using CodeQuest.Data.Entities;
using CodeQuest.Data.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CodeQuest.Data.Repositories;

public class LessonRepository : ILessonRepository
{
    private readonly AppDbContext _context;

    public LessonRepository(AppDbContext context)
    {
        _context = context;
    }

    // quiz and que load garna
    public async Task<List<Lesson>> GetAllAsync()
    {
        return await _context.Lessons
            .Include(l => l.Quizzes)
                .ThenInclude(q => q.Questions)
            .ToListAsync();
    }

    public async Task<Lesson?> GetByIdAsync(Guid id)
    {
        return await _context.Lessons
            .Include(l => l.Quizzes)
                .ThenInclude(q => q.Questions)
            .FirstOrDefaultAsync(l => l.Id == id);
    }

    public async Task AddAsync(Lesson lesson)
    {
        _context.Lessons.Add(lesson);
        await _context.SaveChangesAsync();
    }
}
