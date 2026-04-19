using CodeQuest.Data.Entities;
using CodeQuest.Data.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CodeQuest.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/questions")]
    [Authorize(Roles = "Admin")]
    public class AdminQuestionsController : ControllerBase
    {
        private readonly IQuestionRepository _questionRepository;

        public AdminQuestionsController(IQuestionRepository questionRepository)
        {
            _questionRepository = questionRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetByQuiz([FromQuery] Guid quizId)
        {
            if (quizId == Guid.Empty)
                return BadRequest("QuizId is required");

            var questions = await _questionRepository.GetByQuizIdAsync(quizId);
            return Ok(questions);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateQuestionDto dto)
        {
            if (dto.QuizId == Guid.Empty)
                return BadRequest("QuizId is required");

            var question = new Question
            {
                Id = Guid.NewGuid(),
                QuizId = dto.QuizId,
                Text = dto.Text,
                OptionA = dto.OptionA,
                OptionB = dto.OptionB,
                OptionC = dto.OptionC,
                OptionD = dto.OptionD,
                CorrectAnswer = dto.CorrectAnswer?.ToUpper() ?? "A",
                Damage = dto.Damage
            };

            await _questionRepository.AddAsync(question);
            return CreatedAtAction(nameof(GetById), new { id = question.Id }, question);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var question = await _questionRepository.GetByIdAsync(id);
            if (question == null)
                return NotFound();

            return Ok(question);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateQuestionDto dto)
        {
            var question = await _questionRepository.GetByIdAsync(id);
            if (question == null)
                return NotFound();

            question.Text = dto.Text;
            question.OptionA = dto.OptionA;
            question.OptionB = dto.OptionB;
            question.OptionC = dto.OptionC;
            question.OptionD = dto.OptionD;
            question.CorrectAnswer = dto.CorrectAnswer?.ToUpper() ?? "A";
            question.Damage = dto.Damage;

            await _questionRepository.UpdateAsync(question);
            return Ok(question);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var question = await _questionRepository.GetByIdAsync(id);
            if (question == null)
                return NotFound();

            await _questionRepository.DeleteAsync(id);
            return NoContent();
        }
    }

    public class CreateQuestionDto
    {
        public Guid QuizId { get; set; }
        public string Text { get; set; } = string.Empty;
        public string OptionA { get; set; } = string.Empty;
        public string OptionB { get; set; } = string.Empty;
        public string OptionC { get; set; } = string.Empty;
        public string OptionD { get; set; } = string.Empty;
        public string CorrectAnswer { get; set; } = "A";
        public int Damage { get; set; } = 10;
    }

    public class UpdateQuestionDto
    {
        public string Text { get; set; } = string.Empty;
        public string OptionA { get; set; } = string.Empty;
        public string OptionB { get; set; } = string.Empty;
        public string OptionC { get; set; } = string.Empty;
        public string OptionD { get; set; } = string.Empty;
        public string CorrectAnswer { get; set; } = "A";
        public int Damage { get; set; } = 10;
    }
}
