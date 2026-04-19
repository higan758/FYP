using CodeQuest.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace CodeQuest.Data.Repositories;

public class QuestionRepository : IQuestionRepository
{
    private readonly AppDbContext _context;

    public QuestionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Question>> GetByQuizIdAsync(Guid quizId)
    {
        return await _context.Questions
            .Where(q => q.QuizId == quizId)
            .ToListAsync();
    }

    public async Task<Question?> GetByIdAsync(Guid id)
    {
        return await _context.Questions
            .FirstOrDefaultAsync(q => q.Id == id);
    }

    public async Task AddAsync(Question question)
    {
        _context.Questions.Add(question);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Question question)
    {
        _context.Questions.Update(question);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var question = await _context.Questions.FirstOrDefaultAsync(q => q.Id == id);
        if (question != null)
        {
            _context.Questions.Remove(question);
            await _context.SaveChangesAsync();
        }
    }
}
