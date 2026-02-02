namespace CodeQuest.Data.Entities;

public class CodeSubmission
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string Code { get; set; } = string.Empty;

    public string Feedback { get; set; } = string.Empty;

    public bool IsCorrect { get; set; }

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
}
