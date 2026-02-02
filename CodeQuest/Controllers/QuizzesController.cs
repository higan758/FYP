using CodeQuest.Data;
using CodeQuest.Data.DTOs;
using CodeQuest.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CodeQuest.Controllers;

[ApiController]
[Route("api/quizzes")]
public class QuizzesController : ControllerBase
{
    private readonly AppDbContext _context;

    public QuizzesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateQuizDto dto)
    {
        var lessonExists = await _context.Lessons.AnyAsync(l => l.Id == dto.LessonId);
        if (!lessonExists)
            return NotFound("Lesson not found");

        var quiz = new Quiz
        {
            LessonId = dto.LessonId,
            Title = dto.Title
        };

        _context.Quizzes.Add(quiz);
        await _context.SaveChangesAsync();

        return Ok(quiz);
    }
}
