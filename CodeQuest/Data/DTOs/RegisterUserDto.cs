using System.ComponentModel.DataAnnotations;

namespace CodeQuest.Data.DTOs;

public class RegisterUserDto
{
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Username is required.")]
    public string UserName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Email format is invalid.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters.")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Confirm password is required.")]
    [Compare(nameof(Password), ErrorMessage = "Password and confirm password do not match.")]
    public string ConfirmPassword { get; set; } = string.Empty;
}
