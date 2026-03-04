using CodeQuest.Data.Entities;
using CodeQuest.Data.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

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

    [HttpGet("{id}/ppt")]
    [Authorize]
    public async Task<IActionResult> GetResource(Guid id)
    {
        var lesson = await _lessonRepository.GetByIdAsync(id);
        if (lesson == null) return NotFound();

        if (string.IsNullOrWhiteSpace(lesson.ResourceFilePath))
            return Ok(new { url = (string?)null });

        return Ok(new { url = lesson.ResourceFilePath });
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(Lesson lesson)
    {
        await _lessonRepository.AddAsync(lesson);
        return Ok(lesson);
    }
}
