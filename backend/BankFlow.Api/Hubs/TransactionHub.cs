using Microsoft.AspNetCore.SignalR;

namespace BankFlow.Api.Hubs;

public class TransactionHub : Hub
{
    public async Task JoinGroup(string role)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, role);
    }
}