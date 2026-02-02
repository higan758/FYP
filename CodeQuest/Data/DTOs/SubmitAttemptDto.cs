namespace CodeQuest.Data.DTOs;

public class SubmitAttemptDto
{
    public Guid QuizId { get; set; }

    // QuestionId → SelectedAnswer (A/B/C/D)
    public Dictionary<Guid, string> Answers { get; set; } = new();
}
