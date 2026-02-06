using CodeQuestUI.Models.Auth;
using System.Net.Http.Json;

namespace CodeQuestUI.Services;

public class AuthService
{
    private readonly HttpClient _http;
    private readonly TokenStorage _tokenStorage;

    public AuthService(HttpClient http, TokenStorage tokenStorage)
    {
        _http = http;
        _tokenStorage = tokenStorage;
    }

    public async Task<(bool ok, string? error)> Register(RegisterRequest req)
    {
        var res = await _http.PostAsJsonAsync("/api/auth/register", req);

        if (res.IsSuccessStatusCode) return (true, null);

        var body = await res.Content.ReadAsStringAsync();
        return (false, $"HTTP {(int)res.StatusCode}: {body}");
    }

    public async Task<(bool ok, string? error)> Login(LoginRequest req)
    {
        var res = await _http.PostAsJsonAsync("/api/auth/login", req);

        if (!res.IsSuccessStatusCode)
        {
            var body = await res.Content.ReadAsStringAsync();
            return (false, $"HTTP {(int)res.StatusCode}: {body}");
        }

        var data = await res.Content.ReadFromJsonAsync<AuthResponse>();
        if (data == null || string.IsNullOrWhiteSpace(data.Token))
            return (false, "Login response missing token.");

        await _tokenStorage.SetTokenAsync(data.Token);
        return (true, null);
    }

    public async Task Logout()
    {
        await _tokenStorage.ClearTokenAsync();
    }
}
