namespace CodeQuest.Data.DTOs;

public class AdminUpdateUserDto
{
    public string? FullName { get; set; }
    public string? UserName { get; set; }
    public string? Email { get; set; }
    public bool? IsActive { get; set; }
    public string? Role { get; set; }
}
