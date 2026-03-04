using CodeQuest.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using CodeQuest.Data.Entities;
using CodeQuest.Data.DTOs;
using Microsoft.AspNetCore.Identity;

namespace CodeQuest.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/users")]
    [Authorize(Roles = "Admin")]
    public class AdminUsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AdminUsersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AdminCreateUserDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest("Email already exists");
            var user = new User
            {
                FullName = dto.FullName?.Trim() ?? string.Empty,
                UserName = dto.UserName?.Trim() ?? string.Empty,
                Email = dto.Email?.Trim() ?? string.Empty,
                IsActive = true,
                Role = string.IsNullOrWhiteSpace(dto.Role) ? "Student" : dto.Role.Trim()
            };
            var hasher = new PasswordHasher<User>();
            user.PasswordHash = hasher.HashPassword(user, dto.Password);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok(new { user.Id, user.FullName, user.UserName, user.Email, user.IsActive, user.Role });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] AdminUpdateUserDto dto)
        {
            var user = await _context.Users
                .Where(u => u.Id == id)
                .FirstOrDefaultAsync();
            
            if (user == null) 
                return NotFound("User not found");

            _context.ChangeTracker.Clear();
            _context.Attach(user);

            if (!string.IsNullOrWhiteSpace(dto.FullName)) 
                user.FullName = dto.FullName.Trim();
            
            if (!string.IsNullOrWhiteSpace(dto.UserName)) 
            {
                var usernameExists = await _context.Users
                    .AsNoTracking()
                    .AnyAsync(u => u.UserName == dto.UserName.Trim() && u.Id != id);
                
                if (usernameExists)
                    return BadRequest("Username already taken by another user");
                
                user.UserName = dto.UserName.Trim();
            }
            
            if (!string.IsNullOrWhiteSpace(dto.Email)) 
                user.Email = dto.Email.Trim();
            
            if (dto.IsActive.HasValue) 
                user.IsActive = dto.IsActive.Value;
            
            if (!string.IsNullOrWhiteSpace(dto.Role)) 
                user.Role = dto.Role.Trim();

            var changedUsers = _context.ChangeTracker.Entries<User>()
                .Where(e => e.State == EntityState.Modified || e.State == EntityState.Added)
                .ToList();

            if (changedUsers.Count != 1 || changedUsers[0].Entity.Id != id)
            {
                _context.ChangeTracker.Clear();
                return StatusCode(500, "Unexpected change tracker state - update aborted for safety");
            }

            await _context.SaveChangesAsync();
            return Ok(new { user.Id, user.FullName, user.UserName, user.Email, user.IsActive, user.Role });
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _context.Users
                .AsNoTracking()
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.UserName,
                    u.Email,
                    u.EmailConfirmed,
                    u.IsActive,
                    u.Role,
                    u.CreatedAt
                })
                .ToListAsync();
            return Ok(users);
        }

        [HttpPut("{id}/deactivate")]
        public async Task<IActionResult> Deactivate(Guid id)
        {
            var user = await _context.Users
                .Where(u => u.Id == id)
                .FirstOrDefaultAsync();
            
            if (user == null) 
                return NotFound("User not found");

            _context.ChangeTracker.Clear();
            _context.Attach(user);

            var meId = GetCurrentUserId();
            if (meId == id) 
                return BadRequest("Cannot deactivate yourself");

            user.IsActive = false;
            
            var changedUsers = _context.ChangeTracker.Entries<User>()
                .Where(e => e.State == EntityState.Modified)
                .ToList();

            if (changedUsers.Count != 1 || changedUsers[0].Entity.Id != id)
            {
                _context.ChangeTracker.Clear();
                return StatusCode(500, "Unexpected change tracker state - update aborted for safety");
            }

            await _context.SaveChangesAsync();
            return Ok(new { user.Id, user.IsActive });
        }

        [HttpPut("{id}/activate")]
        public async Task<IActionResult> Activate(Guid id)
        {
            var user = await _context.Users
                .Where(u => u.Id == id)
                .FirstOrDefaultAsync();
            
            if (user == null) 
                return NotFound("User not found");

            _context.ChangeTracker.Clear();
            _context.Attach(user);

            user.IsActive = true;
            
            var changedUsers = _context.ChangeTracker.Entries<User>()
                .Where(e => e.State == EntityState.Modified)
                .ToList();

            if (changedUsers.Count != 1 || changedUsers[0].Entity.Id != id)
            {
                _context.ChangeTracker.Clear();
                return StatusCode(500, "Unexpected change tracker state - update aborted for safety");
            }

            await _context.SaveChangesAsync();
            return Ok(new { user.Id, user.IsActive });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound();

            var meId = GetCurrentUserId();
            if (meId == id) return BadRequest("Cannot delete yourself");

            var attempts = await _context.Attempts.Where(a => a.UserId == id).ToListAsync();
            if (attempts.Count > 0)
            {
                _context.Attempts.RemoveRange(attempts);
            }
            var subs = await _context.CodeSubmissions.Where(cs => cs.UserId == id).ToListAsync();
            if (subs.Count > 0)
            {
                _context.CodeSubmissions.RemoveRange(subs);
            }
            var progresses = await _context.UserQuizProgresses.Where(p => p.UserId == id).ToListAsync();
            if (progresses.Count > 0)
            {
                _context.UserQuizProgresses.RemoveRange(progresses);
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Ok(new { deleted = id });
        }

        private Guid GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
            if (claim != null && Guid.TryParse(claim.Value, out var id)) return id;
            return Guid.Empty;
        }
    }
}
