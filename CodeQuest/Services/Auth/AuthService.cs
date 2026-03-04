using CodeQuest.Data;
using CodeQuest.Data.DTOs;
using CodeQuest.Data.Entities;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CodeQuest.Services.Auth;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;
    private readonly PasswordHasher<User> _passwordHasher = new();

    public AuthService(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterUserDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            throw new Exception("Email already exists");

        var user = new User
        {
            FullName = dto.FullName,
            UserName = dto.UserName,
            Email = dto.Email,
            Role = "Student",
            IsActive = true
        };

        if (IsAdminEmail(user.Email))
        {
            user.Role = "Admin";
        }

        user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return new AuthResponseDto
        {
            UserId = user.Id,
            UserName = user.UserName,
            Token = GenerateJwt(user)
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginUserDto dto)
    {

        var input = (dto.Email ?? string.Empty).Trim();
        var user = await _context.Users
            .Where(u => u.Email == input || u.UserName == input)
            .FirstOrDefaultAsync();
        
        if (user == null)
            throw new Exception("Invalid credentials");

        if (user is { IsActive: false })
            throw new Exception("Account is inactive");

        var result = _passwordHasher.VerifyHashedPassword(
            user, user.PasswordHash, dto.Password);

        if (result == PasswordVerificationResult.Failed)
            throw new Exception("Invalid credentials");


        if (IsAdminEmail(user.Email) && user.Role != "Admin")
        {
            _context.ChangeTracker.Clear();
            _context.Attach(user);
            
            user.Role = "Admin";
            await _context.SaveChangesAsync();
        }

        return new AuthResponseDto
        {
            UserId = user.Id,
            UserName = user.UserName,
            Token = GenerateJwt(user)
        };
    }

    public async Task<AuthResponseDto> GoogleLoginAsync(GoogleLoginDto dto)
    {
        var clientId = _config["Google:ClientId"]
            ?? throw new Exception("Google ClientId not configured");

        GoogleJsonWebSignature.Payload payload;
        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { clientId }
            };
            payload = await GoogleJsonWebSignature.ValidateAsync(dto.IdToken, settings);
        }
        catch (InvalidJwtException)
        {
            throw new Exception("Invalid Google token");
        }

        if (payload.EmailVerified != true)
            throw new Exception("Google email is not verified");

        var email = payload.Email.Trim().ToLowerInvariant();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.GoogleId == payload.Subject)
                ?? await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);

        if (user == null)
        {
            var baseName = email.Split('@')[0];
            var userName = baseName;
            var suffix = 1;
            while (await _context.Users.AnyAsync(u => u.UserName == userName))
            {
                userName = $"{baseName}{suffix++}";
            }

            user = new User
            {
                Id = Guid.NewGuid(),
                FullName = payload.Name ?? email,
                UserName = userName,
                Email = email,
                GoogleId = payload.Subject,
                PasswordHash = string.Empty,
                EmailConfirmed = true,
                IsActive = true,
                Role = IsAdminEmail(email) ? "Admin" : "Student",
                ProfilePictureUrl = payload.Picture,
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }
        else
        {
            if (!user.IsActive)
                throw new Exception("Account is inactive");

            if (string.IsNullOrEmpty(user.GoogleId))
            {
                user.GoogleId = payload.Subject;
            }

            if (string.IsNullOrEmpty(user.ProfilePictureUrl) && !string.IsNullOrEmpty(payload.Picture))
            {
                user.ProfilePictureUrl = payload.Picture;
            }

            if (IsAdminEmail(user.Email) && user.Role != "Admin")
            {
                user.Role = "Admin";
            }

            await _context.SaveChangesAsync();
        }

        return new AuthResponseDto
        {
            UserId = user.Id,
            UserName = user.UserName,
            Token = GenerateJwt(user)
        };
    }

    private bool IsAdminEmail(string? email)
    {
        var admins = _config.GetSection("Admin:Emails").Get<string[]>() ?? Array.Empty<string>();
        var target = (email ?? string.Empty).Trim().ToLowerInvariant();
        foreach (var a in admins)
        {
            if (string.Equals((a ?? string.Empty).Trim().ToLowerInvariant(), target))
                return true;
        }
        return false;
    }

    private string GenerateJwt(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("username", user.UserName)
        };

        var role = string.IsNullOrWhiteSpace(user.Role) ? "Student" : user.Role;
        claims.Add(new Claim(ClaimTypes.Role, role));

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(3),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
