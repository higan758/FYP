namespace CodeQuest.Data.DTOs;

public class CheckAnswerDto
{
    public Guid QuestionId { get; set; }
    public string Answer { get; set; } = "";
}
