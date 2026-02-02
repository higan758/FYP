using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CodeQuest.Migrations
{
    /// <inheritdoc />
    public partial class AddAttemptScoring : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attempts_Users_UserId",
                table: "Attempts");

            migrationBuilder.AlterColumn<Guid>(
                name: "UserId",
                table: "Attempts",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<Guid>(
                name: "QuizId",
                table: "Attempts",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<int>(
                name: "Score",
                table: "Attempts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalQuestions",
                table: "Attempts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Attempts_QuizId",
                table: "Attempts",
                column: "QuizId");

            migrationBuilder.AddForeignKey(
                name: "FK_Attempts_Quizzes_QuizId",
                table: "Attempts",
                column: "QuizId",
                principalTable: "Quizzes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Attempts_Users_UserId",
                table: "Attempts",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attempts_Quizzes_QuizId",
                table: "Attempts");

            migrationBuilder.DropForeignKey(
                name: "FK_Attempts_Users_UserId",
                table: "Attempts");

            migrationBuilder.DropIndex(
                name: "IX_Attempts_QuizId",
                table: "Attempts");

            migrationBuilder.DropColumn(
                name: "QuizId",
                table: "Attempts");

            migrationBuilder.DropColumn(
                name: "Score",
                table: "Attempts");

            migrationBuilder.DropColumn(
                name: "TotalQuestions",
                table: "Attempts");

            migrationBuilder.AlterColumn<Guid>(
                name: "UserId",
                table: "Attempts",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Attempts_Users_UserId",
                table: "Attempts",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
