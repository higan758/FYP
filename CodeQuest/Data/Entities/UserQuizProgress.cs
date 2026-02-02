namespace CodeQuest.Data.Entities;

public class UserQuizProgress
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid QuizId { get; set; }
    public Quiz Quiz { get; set; } = null!;

    public int BestScore { get; set; }
    public bool Completed { get; set; }

    public DateTime LastAttemptAt { get; set; } = DateTime.UtcNow;
}

