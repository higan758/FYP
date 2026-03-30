namespace CodeQuest.Data.DTOs;

public class SubmitAttemptDto
{
    public Guid QuizId { get; set; }
    public Dictionary<Guid, string> Answers { get; set; } = new();
}
