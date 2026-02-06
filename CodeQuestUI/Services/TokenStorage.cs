namespace CodeQuestUI.Services;

public class TokenStorage
{
    private string? _token;

    public Task SetTokenAsync(string token)
    {
        _token = token;
        return Task.CompletedTask;
    }

    public Task<string?> GetTokenAsync()
    {
        return Task.FromResult(_token);
    }

    public Task ClearTokenAsync()
    {
        _token = null;
        return Task.CompletedTask;
    }
}
