using CodeQuest.Data;
using CodeQuest.Data.DTOs;
using CodeQuest.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CodeQuest.Controllers;

[ApiController]
[Route("api/attempts")]
[Authorize]
public class AttemptsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AttemptsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("submit")]
    public async Task<IActionResult> Submit([FromBody] SubmitAttemptDto dto)
    {
   
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
        if (userIdClaim == null)
            return Unauthorized("Missing user id claim.");

        if (!Guid.TryParse(userIdClaim.Value, out var userId))
            return Unauthorized("Invalid user id claim.");

  
        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
            .Include(q => q.Lesson)
            .FirstOrDefaultAsync(q => q.Id == dto.QuizId);

        if (quiz == null)
            return NotFound("Quiz not found");

        var currentLevel = quiz.Lesson.LevelNumber;

        if (currentLevel > 1)
        {
            var previousLessonQuizIds = await _context.Quizzes
                .Where(q => q.Lesson.LevelNumber == currentLevel - 1)
                .Select(q => q.Id)
                .ToListAsync();

            var completedPreviousLesson = await _context.UserQuizProgresses
                .AnyAsync(p =>
                    p.UserId == userId &&
                    previousLessonQuizIds.Contains(p.QuizId) &&
                    p.Completed);

            if (!completedPreviousLesson)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new
                {
                    message = "This quiz is locked. Complete the previous level first."
                });
            }
        }
 //combat
        int playerHp = 100;
        int enemyHp = 100;
        int score = 0;

        foreach (var question in quiz.Questions)
        {
            if (!dto.Answers.TryGetValue(question.Id, out var selected))
                continue;

            if (string.Equals(selected, question.CorrectAnswer, StringComparison.OrdinalIgnoreCase))
            {
                enemyHp -= question.Damage;
                score++;
            }
            else
            {
                playerHp -= question.Damage;
            }

            if (enemyHp <= 0 || playerHp <= 0)
                break;
        }

        // savee attempt
        var attempt = new Attempt
        {
            QuizId = quiz.Id,
            UserId = userId,
            Score = score,
            TotalQuestions = quiz.Questions.Count,
            PlayerHp = Math.Max(playerHp, 0),
            EnemyHp = Math.Max(enemyHp, 0),
            AttemptedAt = DateTime.UtcNow
        };

        _context.Attempts.Add(attempt);
        await _context.SaveChangesAsync();

        bool quizCompleted = attempt.EnemyHp <= 0;

        var progress = await _context.UserQuizProgresses
            .FirstOrDefaultAsync(p =>
                p.UserId == userId &&
                p.QuizId == quiz.Id);

        if (progress == null)
        {
            progress = new UserQuizProgress
            {
                UserId = userId,
                QuizId = quiz.Id,
                BestScore = score,
                Completed = quizCompleted,
                LastAttemptAt = DateTime.UtcNow
            };
            _context.UserQuizProgresses.Add(progress);
        }
        else
        {
            if (score > progress.BestScore)
                progress.BestScore = score;

            if (quizCompleted)
                progress.Completed = true;

            progress.LastAttemptAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            attempt.Id,
            attempt.QuizId,
            attempt.UserId,
            attempt.Score,
            attempt.TotalQuestions,
            attempt.PlayerHp,
            attempt.EnemyHp,
            Result = attempt.EnemyHp <= 0
                ? "Victory"
                : attempt.PlayerHp <= 0
                    ? "Defeat"
                    : "In Progress",
            attempt.AttemptedAt
        });
    }

    //  attempts 
    [HttpGet("my")]
    public async Task<IActionResult> MyAttempts([FromQuery] Guid? quizId = null)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
        if (userIdClaim == null) return Unauthorized();

        if (!Guid.TryParse(userIdClaim.Value, out var userId))
            return Unauthorized();

        var query = _context.Attempts
            .AsNoTracking()
            .Where(a => a.UserId == userId);

        if (quizId.HasValue)
            query = query.Where(a => a.QuizId == quizId.Value);

        var attempts = await query
            .OrderByDescending(a => a.AttemptedAt)
            .Select(a => new
            {
                a.Id,
                a.QuizId,
                a.Score,
                a.TotalQuestions,
                a.PlayerHp,
                a.EnemyHp,
                Result = a.EnemyHp <= 0 ? "Victory" : a.PlayerHp <= 0 ? "Defeat" : "In Progress",
                a.AttemptedAt
            })
            .ToListAsync();

        return Ok(attempts);
    }

    [HttpGet("my/latest")]
    public async Task<IActionResult> LatestAttempt([FromQuery] Guid quizId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
        if (userIdClaim == null) return Unauthorized();

        if (!Guid.TryParse(userIdClaim.Value, out var userId))
            return Unauthorized();

        var attempt = await _context.Attempts
            .AsNoTracking()
            .Where(a => a.UserId == userId && a.QuizId == quizId)
            .OrderByDescending(a => a.AttemptedAt)
            .Select(a => new
            {
                a.Id,
                a.QuizId,
                a.Score,
                a.TotalQuestions,
                a.PlayerHp,
                a.EnemyHp,
                Result = a.EnemyHp <= 0 ? "Victory" : a.PlayerHp <= 0 ? "Defeat" : "In Progress",
                a.AttemptedAt
            })
            .FirstOrDefaultAsync();

        return attempt == null ? NotFound("No attempts yet.") : Ok(attempt);
    }
}
