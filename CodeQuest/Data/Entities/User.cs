namespace CodeQuest.Data.Entities;

public class User
{
    public Guid Id { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string UserName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public bool EmailConfirmed { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Relationships
    public ICollection<Attempt> Attempts { get; set; } = new List<Attempt>();
    public ICollection<CodeSubmission> CodeSubmissions { get; set; } = new List<CodeSubmission>();
}
