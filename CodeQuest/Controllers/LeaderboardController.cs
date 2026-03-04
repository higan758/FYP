using CodeQuest.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CodeQuest.Controllers;

[ApiController]
[Route("api/leaderboard")]
public class LeaderboardController : ControllerBase
{
    private readonly AppDbContext _context;
    public LeaderboardController(AppDbContext context) => _context = context;

    [HttpGet("top")]
    public async Task<IActionResult> Top([FromQuery] int limit = 10)
    {
        if (limit <= 0) limit = 10;
        if (limit > 100) limit = 100;

        var totals = await _context.Users
            .Select(u => new
            {
                u.Id,
                u.UserName,
                u.Email,
                TotalScore = _context.UserQuizProgresses
                    .Where(p => p.UserId == u.Id)
                    .Select(p => (int?)p.BestScore)
                    .Sum() ?? 0,
                Completed = _context.UserQuizProgresses
                    .Count(p => p.UserId == u.Id && p.Completed)
            })
            .OrderByDescending(x => x.TotalScore)
            .ThenByDescending(x => x.Completed)
            .ThenBy(x => x.UserName)
            .Take(limit)
            .ToListAsync();

        var top = totals.Select((x, i) => new
        {
            Rank = i + 1,
            x.Id,
            x.UserName,
            x.Email,
            x.TotalScore,
            x.Completed
        }).ToList();

        Guid? currentUserId = null;
        var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
        if (claim != null && Guid.TryParse(claim.Value, out var id)) currentUserId = id;

        object? me = null;
        if (currentUserId.HasValue)
        {
            var myScore = await _context.UserQuizProgresses
                .Where(p => p.UserId == currentUserId.Value)
                .Select(p => (int?)p.BestScore)
                .SumAsync() ?? 0;

            var betterCount = await _context.Users
                .Select(u => new
                {
                    Score = _context.UserQuizProgresses
                        .Where(p => p.UserId == u.Id)
                        .Select(p => (int?)p.BestScore)
                        .Sum() ?? 0
                })
                .CountAsync(x => x.Score > myScore);

            me = new { Rank = betterCount + 1, TotalScore = myScore };
        }

        return Ok(new { top, me });
    }
}
