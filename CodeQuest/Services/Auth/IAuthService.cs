using CodeQuest.Data.DTOs;

namespace CodeQuest.Services.Auth;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterUserDto dto);
    Task<AuthResponseDto> LoginAsync(LoginUserDto dto);
    Task<AuthResponseDto> GoogleLoginAsync(GoogleLoginDto dto);
}
