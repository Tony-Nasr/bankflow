using BankFlow.Api.Data;
using BankFlow.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BankFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BranchesController : ControllerBase
{
    private readonly AppDbContext _context;

    public BranchesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var branches = await _context.Branches.ToListAsync();
        return Ok(branches);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(Branch branch)
    {
        _context.Branches.Add(branch);
        await _context.SaveChangesAsync();
        return Ok(branch);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var branch = await _context.Branches.FindAsync(id);
        if (branch == null) return NotFound();
        _context.Branches.Remove(branch);
        await _context.SaveChangesAsync();
        return Ok();
    }
}