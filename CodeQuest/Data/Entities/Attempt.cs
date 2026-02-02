using CodeQuest.Data.Entities;

public class Attempt
{
    public Guid Id { get; set; }

    public Guid QuizId { get; set; }
    public Quiz Quiz { get; set; } = null!;

    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public int Score { get; set; }
    public int TotalQuestions { get; set; }

    public int PlayerHp { get; set; } = 100;
    public int EnemyHp { get; set; } = 100;

    public DateTime AttemptedAt { get; set; } = DateTime.UtcNow;
}
