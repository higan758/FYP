using CodeQuest.Data.Entities;

namespace CodeQuest.Data.Interfaces;

public interface ILessonRepository
{
    Task<List<Lesson>> GetAllAsync();
    Task<Lesson?> GetByIdAsync(Guid id);
    Task AddAsync(Lesson lesson);
    Task UpdateAsync(Lesson lesson);
    Task DeleteAsync(Guid id);
}
