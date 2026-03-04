using CodeQuest.Data.Entities;
using CodeQuest.Data.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CodeQuest.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/lessons")]
    [Authorize(Roles = "Admin")]
    public class AdminLessonsController : ControllerBase
    {
        private readonly ILessonRepository _lessonRepository;
        private readonly IWebHostEnvironment _env;

        public AdminLessonsController(ILessonRepository lessonRepository, IWebHostEnvironment env)
        {
            _lessonRepository = lessonRepository;
            _env = env;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var lessons = await _lessonRepository.GetAllAsync();
            return Ok(lessons);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Lesson lesson)
        {
            if (lesson.Id == Guid.Empty) lesson.Id = Guid.NewGuid();
            await _lessonRepository.AddAsync(lesson);
            return Ok(lesson);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] Lesson lesson)
        {
            var existing = await _lessonRepository.GetByIdAsync(id);
            if (existing == null) return NotFound();
            existing.Title = lesson.Title;
            existing.Description = lesson.Description;
            existing.LevelNumber = lesson.LevelNumber;
            await _lessonRepository.UpdateAsync(existing);
            return Ok(existing);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existing = await _lessonRepository.GetByIdAsync(id);
            if (existing == null) return NotFound();
            await _lessonRepository.DeleteAsync(id);
            return Ok(new { deleted = id });
        }

        [HttpPost("{id}/upload-resource")]
        public async Task<IActionResult> UploadResource(Guid id, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { error = "No file provided." });

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            var allowed = new[] { ".pdf", ".ppt", ".pptx" };
            if (!allowed.Contains(ext))
                return BadRequest(new { error = "Only .pdf, .ppt, and .pptx files are allowed." });

            var lesson = await _lessonRepository.GetByIdAsync(id);
            if (lesson == null)
                return NotFound(new { error = "Lesson not found." });

            // Ensure uploads directory exists
            var uploadsDir = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
            Directory.CreateDirectory(uploadsDir);

            // Delete old file if it exists
            if (!string.IsNullOrWhiteSpace(lesson.ResourceFilePath))
            {
                var oldPath = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), lesson.ResourceFilePath.TrimStart('/'));
                if (System.IO.File.Exists(oldPath))
                    System.IO.File.Delete(oldPath);
            }

            // Save the new file
            var fileName = $"{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadsDir, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Store relative path
            lesson.ResourceFilePath = $"/uploads/{fileName}";
            await _lessonRepository.UpdateAsync(lesson);

            return Ok(new { url = lesson.ResourceFilePath });
        }
    }
}
