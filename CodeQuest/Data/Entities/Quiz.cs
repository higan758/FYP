using CodeQuest.Data.Entities;
using System.Text.Json.Serialization;

public class Quiz
{
    public Guid Id { get; set; }

    public Guid LessonId { get; set; }

    [JsonIgnore]  
    public Lesson Lesson { get; set; } = null!;

    public string Title { get; set; } = string.Empty;

    public ICollection<Question> Questions { get; set; } = new List<Question>();
}
