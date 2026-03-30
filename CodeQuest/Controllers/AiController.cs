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
    private const string TutorSystemPrompt = "You are CodeQuest AI Tutor, a friendly and natural AI assistant inside a C# learning platform.\nYou can answer both general questions and programming questions.\nIf the user asks a programming or C# question, explain clearly and give examples when useful.\nIf the user asks a general question, respond naturally like a normal assistant.\nNever reveal internal reasoning, hidden thoughts, planning, or tags like <think>.\nOnly return the final answer.\nKeep responses short, clear, and conversational.";

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

        var payload = new
        {
            model = "meta-llama/Meta-Llama-3-8B-Instruct",
            messages = new object[]
            {
                new
                {
                    role = "system",
                    content = TutorSystemPrompt
                },
                new
                {
                    role = "user",
                    content = dto.Message
                }
            },
            max_tokens = 300,
            temperature = 0.6
        };

        var requestUrl = "https://router.huggingface.co/v1/chat/completions";

        try
        {
            Console.WriteLine($"[HuggingFace] Request URL: {requestUrl}");

            const int maxRetries = 3;
            string? lastErrorContent = null;
            int? lastStatusCode = null;

            for (var attempt = 1; attempt <= maxRetries; attempt++)
            {
                using var request = new HttpRequestMessage(HttpMethod.Post, requestUrl);
                request.Content = new StringContent(
                    System.Text.Json.JsonSerializer.Serialize(payload),
                    System.Text.Encoding.UTF8,
                    "application/json"
                );

                var response = await client.SendAsync(request);
                var content = await response.Content.ReadAsStringAsync();

                Console.WriteLine($"[HuggingFace] Attempt {attempt}/{maxRetries} - HTTP Status: {(int)response.StatusCode} {response.StatusCode}");
                Console.WriteLine($"[HuggingFace] Raw Response: {content}");

                if (response.IsSuccessStatusCode)
                {
                    using var successDoc = System.Text.Json.JsonDocument.Parse(content);
                    var root = successDoc.RootElement;

                    if (!root.TryGetProperty("choices", out var choices) || choices.GetArrayLength() == 0)
                    {
                        Console.WriteLine("[HuggingFace] No choices in response");
                        return StatusCode(502, new { error = "Invalid response from HuggingFace", detail = content });
                    }

                    var message = choices[0].GetProperty("message");
                    var reply = message.GetProperty("content").GetString()?.Trim() ?? string.Empty;

                    // Remove reasoning tags and internal thought processes
                    reply = System.Text.RegularExpressions.Regex.Replace(reply, @"<think>[\s\S]*?</think>", "", System.Text.RegularExpressions.RegexOptions.IgnoreCase).Trim();
                    reply = System.Text.RegularExpressions.Regex.Replace(reply, @"<analysis>[\s\S]*?</analysis>", "", System.Text.RegularExpressions.RegexOptions.IgnoreCase).Trim();
                    
                    // Remove any leading reasoning markers
                    reply = System.Text.RegularExpressions.Regex.Replace(reply, @"^(Reasoning|Analysis|Thinking):[\s\S]*?(?=Answer:|$)", "", System.Text.RegularExpressions.RegexOptions.IgnoreCase).Trim();
                    
                    // If there's an "Answer:" marker, extract only what follows it
                    var answerMatch = System.Text.RegularExpressions.Regex.Match(reply, @"Answer:\s*([\s\S]*)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
                    if (answerMatch.Success)
                    {
                        reply = answerMatch.Groups[1].Value.Trim();
                    }

                    if (string.IsNullOrWhiteSpace(reply))
                    {
                        Console.WriteLine("[HuggingFace] Empty content in response");
                        return StatusCode(502, new { error = "Empty response from HuggingFace", detail = content });
                    }

                    Console.WriteLine($"[HuggingFace] Success: {reply.Length} chars");
                    return Ok(new { reply });
                }

                lastErrorContent = content;
                lastStatusCode = (int)response.StatusCode;

                if ((int)response.StatusCode >= 500 && attempt < maxRetries)
                {
                    await Task.Delay(250 * attempt);
                    continue;
                }

                if (response.StatusCode == System.Net.HttpStatusCode.Forbidden)
                    return StatusCode(403, new { error = "HuggingFace permission denied (403)", detail = content });

                if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                    return StatusCode(429, new { error = "HuggingFace rate limit exceeded", detail = content });

                if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
                    return StatusCode(400, new { error = "Bad request to HuggingFace", detail = content });

                return StatusCode((int)response.StatusCode, new
                {
                    error = $"HuggingFace returned {(int)response.StatusCode}",
                    detail = content
                });
            }

            return StatusCode(502, new
            {
                error = "HuggingFace service temporarily unavailable after retries",
                detail = lastErrorContent,
                status = lastStatusCode
            });
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
