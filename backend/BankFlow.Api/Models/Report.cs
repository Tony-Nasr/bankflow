namespace BankFlow.Api.Models;

public class Report
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string? GeneratedByUserId { get; set; }
    public AppUser? GeneratedByUser { get; set; }
}