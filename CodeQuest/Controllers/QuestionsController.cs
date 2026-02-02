using CodeQuest.Data;
using CodeQuest.Data.DTOs;
using CodeQuest.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CodeQuest.Controllers;

[ApiController]
[Route("api/questions")]
public class QuestionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public QuestionsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateQuestionDto dto)
    {
        var quizExists = await _context.Quizzes.AnyAsync(q => q.Id == dto.QuizId);
        if (!quizExists)
            return NotFound("Quiz not found");

        var question = new Question
        {
            QuizId = dto.QuizId,
            Text = dto.Text,
            OptionA = dto.OptionA,
            OptionB = dto.OptionB,
            OptionC = dto.OptionC,
            OptionD = dto.OptionD,
            CorrectAnswer = dto.CorrectAnswer.ToUpper(),
            Damage = dto.Damage
        };

        _context.Questions.Add(question);
        await _context.SaveChangesAsync();

        return Ok(question);
    }
}
