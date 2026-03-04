using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CodeQuest.Migrations
{
    /// <inheritdoc />
    public partial class AddResourceFilePathToLesson : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ResourceFilePath",
                table: "Lessons",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ResourceFilePath",
                table: "Lessons");
        }
    }
}
