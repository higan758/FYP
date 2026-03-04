using CodeQuest.Data;
using CodeQuest.Data.Entities;
using CodeQuest.Data.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace CodeQuest.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            return Unauthorized();

        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return NotFound("User not found");

        var lessons = await _context.Lessons
            .AsNoTracking()
            .OrderBy(l => l.LevelNumber)
            .ToListAsync();

        int highestLevel = 0;

        foreach (var lesson in lessons)
        {
            var quiz = await _context.Quizzes
                .AsNoTracking()
                .FirstOrDefaultAsync(q => q.LessonId == lesson.Id);

            if (quiz == null)
                break;

            var latestAttempt = await _context.Attempts
                .AsNoTracking()
                .Where(a => a.UserId == userId && a.QuizId == quiz.Id)
                .OrderByDescending(a => a.AttemptedAt)
                .FirstOrDefaultAsync();

            if (latestAttempt != null && latestAttempt.EnemyHp <= 0)
                highestLevel = lesson.LevelNumber;
            else
                break;
        }

        var totalQuizzes = await _context.Quizzes.CountAsync();

        var completedCount = await _context.UserQuizProgresses
            .CountAsync(p => p.UserId == userId && p.Completed);

        string avatarUrl =
            !string.IsNullOrWhiteSpace(user.ProfilePictureUrl)
                ? user.ProfilePictureUrl
                : BuildGravatar(user.Email);

        return Ok(new
        {
            user.Id,
            user.UserName,
            user.Email,
            user.Role,
            HighestLevel = highestLevel,
            CompletedQuizzes = completedCount,
            TotalQuizzes = totalQuizzes,
            AvatarUrl = avatarUrl,
            user.LastUsernameChangeUtc
        });
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateMe([FromBody] UpdateProfileDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            return Unauthorized("Invalid or missing user ID in JWT");

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return NotFound("User not found");

        if (!string.IsNullOrWhiteSpace(dto.UserName))
        {
            var newName = dto.UserName.Trim();

            if (user.LastUsernameChangeUtc.HasValue)
            {
                var nextAllowed = user.LastUsernameChangeUtc.Value.AddDays(7);
                if (DateTime.UtcNow < nextAllowed)
                {
                    var remaining = (nextAllowed - DateTime.UtcNow).Days + 1;
                    return BadRequest(
                        $"Username can only be changed once every 7 days. Try again in {remaining} day(s)."
                    );
                }
            }

            if (string.Equals(user.UserName, newName, StringComparison.OrdinalIgnoreCase))
                return BadRequest("New username must be different from your current one.");

            var exists = await _context.Users
                .AnyAsync(u => u.UserName == newName && u.Id != userId);

            if (exists)
                return BadRequest("Username already taken.");

            user.UserName = newName;
            user.LastUsernameChangeUtc = DateTime.UtcNow;
        }

        if (!string.IsNullOrWhiteSpace(dto.ProfilePictureUrl))
        {
            user.ProfilePictureUrl = dto.ProfilePictureUrl.Trim();
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            user.Id,
            user.UserName,
            user.Email,
            user.ProfilePictureUrl,
            user.LastUsernameChangeUtc
        });
    }

    private static string BuildGravatar(string? email)
    {
        var e = (email ?? "").Trim().ToLowerInvariant();

        using var md5 = MD5.Create();
        var hash = md5.ComputeHash(Encoding.UTF8.GetBytes(e));

        var sb = new StringBuilder();
        foreach (var b in hash)
            sb.Append(b.ToString("x2"));

        return $"https://www.gravatar.com/avatar/{sb}?d=identicon";
    }
}