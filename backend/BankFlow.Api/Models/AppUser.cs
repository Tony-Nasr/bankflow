using Microsoft.AspNetCore.Identity;

namespace BankFlow.Api.Models;

public class AppUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int? BranchId { get; set; }
    public Branch? Branch { get; set; }
}