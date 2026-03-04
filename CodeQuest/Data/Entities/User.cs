using Microsoft.EntityFrameworkCore;
namespace CodeQuest.Data.Entities;

[Index(nameof(UserName), IsUnique = true)]
public class User
{
    public Guid Id { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string UserName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public bool EmailConfirmed { get; set; } = false;

    public bool IsActive { get; set; } = true;

    public string Role { get; set; } = "Student";

    public string? ProfilePictureUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? LastUsernameChangeUtc { get; set; }

    public string? GoogleId { get; set; }

    public ICollection<Attempt> Attempts { get; set; } = new List<Attempt>();
    public ICollection<CodeSubmission> CodeSubmissions { get; set; } = new List<CodeSubmission>();
}
