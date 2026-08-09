using BankFlow.Api.Data;
using BankFlow.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BankFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly AppDbContext _context;

    public CustomersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var customers = await _context.Customers
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
        return Ok(customers);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var customer = await _context.Customers
            .Include(c => c.Transactions)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (customer == null) return NotFound();
        return Ok(customer);
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        var customers = await _context.Customers
            .Where(c => c.FullName.Contains(q) || c.AccountNumber.Contains(q))
            .ToListAsync();
        return Ok(customers);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Create(Customer customer)
    {
        customer.AccountNumber = GenerateAccountNumber();
        customer.CreatedAt = DateTime.UtcNow;
        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();
        return Ok(customer);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Update(int id, Customer updated)
    {
        var customer = await _context.Customers.FindAsync(id);
        if (customer == null) return NotFound();

        customer.FullName = updated.FullName;
        customer.Email = updated.Email;
        customer.Phone = updated.Phone;
        customer.AccountType = updated.AccountType;
        customer.IsActive = updated.IsActive;

        await _context.SaveChangesAsync();
        return Ok(customer);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var customer = await _context.Customers.FindAsync(id);
        if (customer == null) return NotFound();

        customer.IsActive = false;
        await _context.SaveChangesAsync();
        return Ok();
    }

    private string GenerateAccountNumber()
    {
        return "BF" + DateTime.UtcNow.Ticks.ToString().Substring(10, 8);
    }
}