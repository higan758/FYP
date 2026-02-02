using Microsoft.EntityFrameworkCore;
using CodeQuest.Data.Entities;

namespace CodeQuest.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Attempt> Attempts => Set<Attempt>();
    public DbSet<CodeSubmission> CodeSubmissions => Set<CodeSubmission>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<Quiz> Quizzes => Set<Quiz>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<UserQuizProgress> UserQuizProgresses => Set<UserQuizProgress>();




}
