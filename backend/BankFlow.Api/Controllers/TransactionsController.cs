using BankFlow.Api.Data;
using BankFlow.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;
using BankFlow.Api.Hubs;
using BankFlow.Api.Services;//new

namespace BankFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransactionsController : ControllerBase
{
    //new
private readonly AppDbContext _context;
private readonly IHubContext<TransactionHub> _hub;
private readonly FraudDetectionService _fraudService;

public TransactionsController(
    AppDbContext context,
    IHubContext<TransactionHub> hub,
    FraudDetectionService fraudService)
{
    _context = context;
    _hub = hub;
    _fraudService = fraudService;
}

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var transactions = await _context.Transactions
            .Include(t => t.Customer)
            .Include(t => t.ProcessedByUser)
            .Include(t => t.Branch)
            .OrderByDescending(t => t.CreatedAt)
            .Take(100)
            .ToListAsync();
        return Ok(transactions);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var transaction = await _context.Transactions
            .Include(t => t.Customer)
            .Include(t => t.ProcessedByUser)
            .Include(t => t.Branch)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (transaction == null) return NotFound();
        return Ok(transaction);
    }

    [HttpGet("customer/{customerId}")]
    public async Task<IActionResult> GetByCustomer(int customerId)
    {
        var transactions = await _context.Transactions
            .Where(t => t.CustomerId == customerId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
        return Ok(transactions);
    }

    [HttpGet("flagged")]
    [Authorize(Roles = "Admin,Manager,Auditor")]
    public async Task<IActionResult> GetFlagged()
    {
        var flagged = await _context.Transactions
            .Include(t => t.Customer)
            .Include(t => t.ProcessedByUser)
            .Where(t => t.IsFlagged)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
        return Ok(flagged);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager,Teller")]
    public async Task<IActionResult> Process([FromBody] ProcessTransactionDto dto)
    {
        var customer = await _context.Customers.FindAsync(dto.CustomerId);
        if (customer == null) return NotFound("Customer not found");
        if (!customer.IsActive) return BadRequest("Customer account is inactive");

        // Validate balance for withdrawals and transfers
        if (dto.Type == "Withdrawal" || dto.Type == "Transfer")
        {
            if (customer.Balance < dto.Amount)
                return BadRequest("Insufficient balance");
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var userBranchId = User.FindFirstValue("BranchId");

        var transaction = new Transaction
        {
            Type = dto.Type,
            Amount = dto.Amount,
            Description = dto.Description,
            CustomerId = dto.CustomerId,
            ProcessedByUserId = userId,
            BranchId = dto.BranchId,
            CreatedAt = DateTime.UtcNow,
            IsFlagged = false,
            AiRiskScore = 0,
            AiFeedback = string.Empty
        };

        // Update customer balance
        if (dto.Type == "Deposit")
            customer.Balance += dto.Amount;
        else if (dto.Type == "Withdrawal" || dto.Type == "Transfer")
            customer.Balance -= dto.Amount;

        _context.Transactions.Add(transaction);

//new
// AI Fraud Detection
try
{
    var recentHistory = await _context.Transactions
        .Where(t => t.CustomerId == dto.CustomerId)
        .OrderByDescending(t => t.CreatedAt)
        .Take(10)
        .ToListAsync();

    var (riskScore, feedback) = await _fraudService.AnalyzeTransaction(
        transaction, customer, recentHistory);

    transaction.AiRiskScore = riskScore;
    transaction.AiFeedback = feedback;
    transaction.IsFlagged = riskScore >= 61;
}
catch (Exception ex)
{
    Console.WriteLine($"AI analysis failed: {ex.Message}");
}

        // Add audit log
        _context.AuditLogs.Add(new AuditLog
        {
            Action = "ProcessTransaction",
            EntityType = "Transaction",
            EntityId = transaction.Id.ToString(),
            UserId = userId,
            Timestamp = DateTime.UtcNow,
            Details = $"{dto.Type} of {dto.Amount} for customer {customer.FullName}"
        });

        await _context.SaveChangesAsync();

//new
await _hub.Clients.All.SendAsync("ReceiveTransaction", new {
    transaction.Id,
    transaction.Type,
    transaction.Amount,
    transaction.CreatedAt,
    transaction.IsFlagged,
    transaction.AiRiskScore,
    CustomerName = customer.FullName,
    CustomerAccount = customer.AccountNumber,
    BranchId = transaction.BranchId
});

        return Ok(transaction);
    }
}

public class ProcessTransactionDto
{
    public string Type { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public int BranchId { get; set; }
}