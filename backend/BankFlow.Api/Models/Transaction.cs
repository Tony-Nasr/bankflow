namespace BankFlow.Api.Models;

public class Transaction
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty; // Deposit, Withdrawal, Transfer
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsFlagged { get; set; } = false;
    public int AiRiskScore { get; set; } = 0;
    public string AiFeedback { get; set; } = string.Empty;

    public int CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public string? ProcessedByUserId { get; set; }
    public AppUser? ProcessedByUser { get; set; }

    public int BranchId { get; set; }
    public Branch? Branch { get; set; }
}