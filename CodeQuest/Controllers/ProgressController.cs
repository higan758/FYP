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
                Progress = _context.UserQuizProgresses
                    .Where(p => p.UserId == userId && p.QuizId == q.Id)
                    .Select(p => new
                    {
                        p.Completed,
                        p.BestScore,
                        p.LastAttemptAt
                    })
                    .FirstOrDefault(),
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
            .Select(x => new
            {
                x.Id,
                x.Title,
                x.LessonId,
                Completed = x.Progress != null && x.Progress.Completed,
                BestScore = x.Progress != null ? x.Progress.BestScore : 0,
                LastAttemptAt = x.Progress != null ? x.Progress.LastAttemptAt : (DateTime?)null,
                x.LatestAttempt
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
            bool completed;

            var lessonQuizIds = await _context.Quizzes
                .Where(q => q.LessonId == lesson.Id)
                .Select(q => q.Id)
                .ToListAsync();

            completed = lessonQuizIds.Any() && await _context.UserQuizProgresses
                .AnyAsync(p => p.UserId == userId && p.Completed && lessonQuizIds.Contains(p.QuizId));

            if (lesson.LevelNumber == 1)
            {
                unlocked = true;
            }
            else
            {
                var prevLesson = lessons.First(l => l.LevelNumber == lesson.LevelNumber - 1);
                var prevLessonQuizIds = await _context.Quizzes
                    .Where(q => q.LessonId == prevLesson.Id)
                    .Select(q => q.Id)
                    .ToListAsync();

                unlocked = prevLessonQuizIds.Any() && await _context.UserQuizProgresses
                    .AnyAsync(p => p.UserId == userId && p.Completed && prevLessonQuizIds.Contains(p.QuizId));
            }

            result.Add(new
            {
                lessonId = lesson.Id,
                lesson.Title,
                lesson.LevelNumber,
                Unlocked = unlocked,
                Completed = completed
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
