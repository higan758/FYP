namespace CodeQuest.Data.Entities;

public class Lesson
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int LevelNumber { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Relationships
    public ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();
}
