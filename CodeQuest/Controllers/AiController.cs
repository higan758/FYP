using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace CodeQuest.Controllers;

[ApiController]
[Route("api/ai")]
[Authorize]
public class AiController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly string _huggingFaceKey;

    public AiController(IHttpClientFactory httpClientFactory, IConfiguration config)
    {
        _httpClientFactory = httpClientFactory;
        _huggingFaceKey = config["HUGGINGFACE_API_KEY"] ?? string.Empty;
    }

    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] ChatRequestDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Message))
            return BadRequest(new { error = "Message is required" });

        if (string.IsNullOrWhiteSpace(_huggingFaceKey))
            return StatusCode(500, new { error = "HuggingFace API key not configured" });

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _huggingFaceKey);

        // HuggingFace now uses OpenAI-compatible chat completions endpoint
        var payload = new
        {
            model = "deepseek-ai/DeepSeek-R1:fastest",
            messages = new object[]
            {
                new
                {
                    role = "system",
                    content = "You are a helpful C# tutor. Answer clearly and concisely. Limit responses to 2-3 sentences."
                },
                new
                {
                    role = "user",
                    content = dto.Message
                }
            },
            max_tokens = 200,
            temperature = 0.7
        };

        var requestUrl = "https://router.huggingface.co/v1/chat/completions";

        try
        {
            Console.WriteLine($"[HuggingFace] Request URL: {requestUrl}");

            using var request = new HttpRequestMessage(HttpMethod.Post, requestUrl);
            request.Content = new StringContent(
                System.Text.Json.JsonSerializer.Serialize(payload),
                System.Text.Encoding.UTF8,
                "application/json"
            );

            var response = await client.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();

            Console.WriteLine($"[HuggingFace] HTTP Status: {(int)response.StatusCode} {response.StatusCode}");
            Console.WriteLine($"[HuggingFace] Raw Response: {content}");

            // Handle 403 Forbidden
            if (response.StatusCode == System.Net.HttpStatusCode.Forbidden)
                return StatusCode(403, new { error = "HuggingFace permission denied (403)", detail = content });

            // Handle 429 Rate Limit
            if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                return StatusCode(429, new { error = "HuggingFace rate limit exceeded", detail = content });

            // Handle 400 Bad Request
            if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
                return StatusCode(400, new { error = "Bad request to HuggingFace", detail = content });

            // Handle other non-success responses
            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, new
                {
                    error = $"HuggingFace returned {(int)response.StatusCode}",
                    detail = content
                });
            }

            // Parse OpenAI-compatible response: { choices: [{ message: { content: "..." } }] }
            using var successDoc = System.Text.Json.JsonDocument.Parse(content);
            var root = successDoc.RootElement;

            if (!root.TryGetProperty("choices", out var choices) || choices.GetArrayLength() == 0)
            {
                Console.WriteLine("[HuggingFace] No choices in response");
                return StatusCode(502, new { error = "Invalid response from HuggingFace", detail = content });
            }

            var message = choices[0].GetProperty("message");
            var reply = message.GetProperty("content").GetString()?.Trim() ?? string.Empty;

            // Strip <think>...</think> blocks from DeepSeek reasoning models
            reply = System.Text.RegularExpressions.Regex.Replace(reply, @"<think>[\s\S]*?</think>", "").Trim();

            if (string.IsNullOrWhiteSpace(reply))
            {
                Console.WriteLine("[HuggingFace] Empty content in response");
                return StatusCode(502, new { error = "Empty response from HuggingFace", detail = content });
            }

            Console.WriteLine($"[HuggingFace] Success: {reply.Length} chars");
            return Ok(new { reply });
        }
        catch (HttpRequestException ex)
        {
            Console.WriteLine($"[HuggingFace Network Error] {ex.Message}");
            return StatusCode(500, new { error = "Network error contacting HuggingFace", detail = ex.Message });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[HuggingFace Server Error] {ex.GetType().Name}: {ex.Message}");
            return StatusCode(500, new { error = $"Server error: {ex.GetType().Name}", detail = ex.Message });
        }
    }
}

public class ChatRequestDto
{
    public string Message { get; set; } = string.Empty;
}
