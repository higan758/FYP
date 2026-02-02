using CodeQuest.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CodeQuest.Controllers;

[ApiController]
[Route("api/progress")]
[Authorize]
public class ProgressController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProgressController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("my")]
    public async Task<IActionResult> MyProgress()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var progress = await _context.Quizzes
            .AsNoTracking()
            .Select(q => new
            {
                q.Id,
                q.Title,
                q.LessonId,
                LatestAttempt = _context.Attempts
                    .Where(a => a.UserId == userId && a.QuizId == q.Id)
                    .OrderByDescending(a => a.AttemptedAt)
                    .Select(a => new
                    {
                        a.Score,
                        a.TotalQuestions,
                        a.PlayerHp,
                        a.EnemyHp,
                        a.AttemptedAt,
                        Result =
                            a.EnemyHp <= 0 ? "Victory" :
                            a.PlayerHp <= 0 ? "Defeat" :
                            "In Progress"
                    })
                    .FirstOrDefault()
            })
            .ToListAsync();

        return Ok(progress);
    }

    // unlock logic 
    [HttpGet("unlocked")]
    public async Task<IActionResult> UnlockedLessons()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var lessons = await _context.Lessons
            .AsNoTracking()
            .OrderBy(l => l.LevelNumber)
            .ToListAsync();

        var result = new List<object>();

        foreach (var lesson in lessons)
        {
            bool unlocked;

            if (lesson.LevelNumber == 1)
            {
                unlocked = true;
            }
            else
            {
                var prevLesson = lessons.First(l => l.LevelNumber == lesson.LevelNumber - 1);

                var prevQuiz = await _context.Quizzes
                    .Where(q => q.LessonId == prevLesson.Id)
                    .FirstOrDefaultAsync();

                if (prevQuiz == null)
                {
                    unlocked = false;
                }
                else
                {
                    var latestAttempt = await _context.Attempts
                        .Where(a => a.UserId == userId && a.QuizId == prevQuiz.Id)
                        .OrderByDescending(a => a.AttemptedAt)
                        .FirstOrDefaultAsync();

                    unlocked = latestAttempt != null && latestAttempt.EnemyHp <= 0;
                }
            }

            result.Add(new
            {
                lessonId = lesson.Id,
                lesson.Title,
                lesson.LevelNumber,
                Unlocked = unlocked
            });
        }

        return Ok(result);
    }

    private Guid? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
        return Guid.TryParse(claim?.Value, out var id) ? id : null;
    }
}
