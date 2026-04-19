using CodeQuest.Data;
using CodeQuest.Data.Repositories;
using CodeQuest.Services;
using CodeQuest.Services.Auth;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",
                "http://localhost:3001"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<RoslynCodeExecutionService>();

builder.Services.AddScoped<ILessonRepository, LessonRepository>();
builder.Services.AddScoped<IQuizRepository, QuizRepository>();
builder.Services.AddScoped<IQuestionRepository, QuestionRepository>();

builder.Services.AddHttpClient();

builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
            )
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter: Bearer {your JWT token}"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
    var hasher = new Microsoft.AspNetCore.Identity.PasswordHasher<CodeQuest.Data.Entities.User>();
    var adminEmails = config.GetSection("Admin:Emails").Get<string[]>() ?? Array.Empty<string>();
    var adminPassword = config["Admin:Password"];
    foreach (var e in adminEmails)
    {
        var email = (e ?? string.Empty).Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(email)) continue;
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);
        if (user == null)
        {
            user = new CodeQuest.Data.Entities.User
            {
                Id = Guid.NewGuid(),
                FullName = email,
                UserName = email,
                Email = email,
                Role = "Admin",
                IsActive = true,
                EmailConfirmed = true,
            };
            if (!string.IsNullOrWhiteSpace(adminPassword))
            {
                user.PasswordHash = hasher.HashPassword(user, adminPassword!);
            }
            else
            {
                user.PasswordHash = hasher.HashPassword(user, Guid.NewGuid().ToString("n"));
            }
            db.Users.Add(user);
            await db.SaveChangesAsync();
        }
        else
        {
            if (user.Role != "Admin")
            {
                user.Role = "Admin";
                await db.SaveChangesAsync();
            }
            if (!string.IsNullOrWhiteSpace(adminPassword))
            {
              
                user.PasswordHash = hasher.HashPassword(user, adminPassword!);
                await db.SaveChangesAsync();
            }
        }
    }
}
app.Run();
