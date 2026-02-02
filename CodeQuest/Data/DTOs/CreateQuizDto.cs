namespace CodeQuest.Data.DTOs;

public class CreateQuizDto
{
    public Guid LessonId { get; set; }
    public string Title { get; set; } = string.Empty;
}
