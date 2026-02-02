using CodeQuest.Data.Entities;
using CodeQuest.Data.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CodeQuest.Controllers;

[ApiController]
[Route("api/lessons")]
public class LessonsController : ControllerBase
{
    private readonly ILessonRepository _lessonRepository;

    public LessonsController(ILessonRepository lessonRepository)
    {
        _lessonRepository = lessonRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var lessons = await _lessonRepository.GetAllAsync();
        return Ok(lessons);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var lesson = await _lessonRepository.GetByIdAsync(id);
        if (lesson == null) return NotFound();

        return Ok(lesson);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Lesson lesson)
    {
        await _lessonRepository.AddAsync(lesson);
        return Ok(lesson);
    }
}
