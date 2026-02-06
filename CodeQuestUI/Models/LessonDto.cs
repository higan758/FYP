namespace CodeQuestUI.Models;

public class LessonDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public int LevelNumber { get; set; }
}
