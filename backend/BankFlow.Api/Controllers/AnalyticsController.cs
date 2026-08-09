using BankFlow.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BankFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AnalyticsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AnalyticsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var today = DateTime.UtcNow.Date;

        var totalTransactions = await _context.Transactions.CountAsync();
        var todayTransactions = await _context.Transactions
            .Where(t => t.CreatedAt >= today).CountAsync();
        var flaggedCount = await _context.Transactions
            .Where(t => t.IsFlagged).CountAsync();
        var totalCustomers = await _context.Customers
            .Where(c => c.IsActive).CountAsync();
        var totalVolume = await _context.Transactions
            .SumAsync(t => t.Amount);
        var todayVolume = await _context.Transactions
            .Where(t => t.CreatedAt >= today)
            .SumAsync(t => t.Amount);

        return Ok(new
        {
            totalTransactions,
            todayTransactions,
            flaggedCount,
            totalCustomers,
            totalVolume,
            todayVolume
        });
    }

    [HttpGet("by-type")]
    public async Task<IActionResult> GetByType()
    {
        var data = await _context.Transactions
            .GroupBy(t => t.Type)
            .Select(g => new { type = g.Key, count = g.Count(), volume = g.Sum(t => t.Amount) })
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("by-hour")]
    public async Task<IActionResult> GetByHour()
    {
        var since = DateTime.UtcNow.AddHours(-24);
        var data = await _context.Transactions
            .Where(t => t.CreatedAt >= since)
            .GroupBy(t => t.CreatedAt.Hour)
            .Select(g => new { hour = g.Key, count = g.Count() })
            .OrderBy(x => x.hour)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("risk-distribution")]
    public async Task<IActionResult> GetRiskDistribution()
    {
        var data = new[]
        {
            new { range = "Low (0-30)", count = await _context.Transactions.CountAsync(t => t.AiRiskScore <= 30) },
            new { range = "Medium (31-60)", count = await _context.Transactions.CountAsync(t => t.AiRiskScore > 30 && t.AiRiskScore <= 60) },
            new { range = "High (61-80)", count = await _context.Transactions.CountAsync(t => t.AiRiskScore > 60 && t.AiRiskScore <= 80) },
            new { range = "Critical (81+)", count = await _context.Transactions.CountAsync(t => t.AiRiskScore > 80) },
        };
        return Ok(data);
    }
}