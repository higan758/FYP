using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CodeQuest.Services;
using CodeQuest.Data.DTOs;

namespace CodeQuest.Controllers;

[ApiController]
[Route("api/code")]
[Authorize] 
public class CodeController : ControllerBase
{
    private readonly RoslynCodeExecutionService _executor;

    public CodeController(RoslynCodeExecutionService executor)
    {
        _executor = executor;
    }

    [HttpPost("execute")]
    public async Task<IActionResult> Execute([FromBody] CodeExecutionDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Code))
            return BadRequest("Code cannot be empty.");

        var output = await _executor.ExecuteAsync(dto.Code);

        return Ok(new { output });
    }
}