using CodeQuest.Data.Entities;

namespace CodeQuest.Data.Repositories;

public interface IQuizRepository
{
    Task AddAsync(Quiz quiz);
}
