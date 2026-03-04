using CodeQuest.Data;
using CodeQuest.Data.DTOs;
using CodeQuest.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

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

    [HttpPost("{id}/check")]
    [Authorize]
    public async Task<IActionResult> CheckAnswer(Guid id, [FromBody] CheckAnswerDto dto)
    {
        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (quiz == null)
            return NotFound("Quiz not found");

        var question = quiz.Questions.FirstOrDefault(q => q.Id == dto.QuestionId);
        if (question == null)
            return NotFound("Question not found");

        var answer = (dto.Answer ?? "").Trim().ToUpper();
        var correct = answer == (question.CorrectAnswer ?? "").ToUpper();
        var dmg = question.Damage;

        return Ok(new
        {
            Correct = correct,
            DamageToEnemy = correct ? dmg : 0,
            DamageToPlayer = correct ? 0 : dmg
        });
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

    //getting quiz for ui ko lagi
    [HttpGet("{id}")]
    public async Task<IActionResult> GetQuizById(Guid id)
    {
        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
            .AsNoTracking()
            .FirstOrDefaultAsync(q => q.Id == id);

        if (quiz == null)
            return NotFound("Quiz not found");

        return Ok(new
        {
            quiz.Id,
            quiz.Title,
            Questions = quiz.Questions.Select(q => new
            {
                q.Id,
                q.Text,
                q.OptionA,
                q.OptionB,
                q.OptionC,
                q.OptionD,
                q.Damage
            })
        });
    }



}
