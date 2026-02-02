using System.Text.Json.Serialization;

namespace CodeQuest.Data.Entities;

public class Question
{
    public Guid Id { get; set; }

    public Guid QuizId { get; set; }

    [JsonIgnore] // avoid circular reference
    public Quiz Quiz { get; set; } = null!;

    public string Text { get; set; } = string.Empty;

    public string OptionA { get; set; } = string.Empty;
    public string OptionB { get; set; } = string.Empty;
    public string OptionC { get; set; } = string.Empty;
    public string OptionD { get; set; } = string.Empty;

    // a b c d mcq
    public string CorrectAnswer { get; set; } = string.Empty;

   // combat mechanics
    public int Damage { get; set; } = 10;
}
