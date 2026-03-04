using Microsoft.EntityFrameworkCore;
using CodeQuest.Data.Entities;

namespace CodeQuest.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Attempt> Attempts { get; set; }
    public DbSet<CodeSubmission> CodeSubmissions { get; set; }
    public DbSet<Lesson> Lessons { get; set; }
    public DbSet<Quiz> Quizzes { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<UserQuizProgress> UserQuizProgresses { get; set; }



}
