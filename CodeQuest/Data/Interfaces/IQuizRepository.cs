using CodeQuest.Data.Entities;

namespace CodeQuest.Data.Interfaces;

public interface IQuizRepository
{
    Task AddAsync(Quiz quiz);
}
