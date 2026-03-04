using CodeQuest.Data.Entities;

namespace CodeQuest.Data.Interfaces;

public interface IQuestionRepository
{
    Task<List<Question>> GetByQuizIdAsync(Guid quizId);
    Task<Question?> GetByIdAsync(Guid id);
    Task AddAsync(Question question);
    Task UpdateAsync(Question question);
    Task DeleteAsync(Guid id);
}
