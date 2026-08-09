using System.Text;
using System.Text.Json;
using BankFlow.Api.Models;

namespace BankFlow.Api.Services;

public class FraudDetectionService
{
    private readonly HttpClient _http;
    private readonly IConfiguration _config;

    public FraudDetectionService(HttpClient http, IConfiguration config)
    {
        _http = http;
        _config = config;
    }

    public async Task<(int riskScore, string feedback)> AnalyzeTransaction(
        Transaction transaction, Customer customer, List<Transaction> recentHistory)
    {
        var apiKey = _config["Groq:ApiKey"]!;

        var historyText = recentHistory.Count == 0
            ? "No recent transactions."
            : string.Join("\n", recentHistory.Select(t =>
                $"- {t.Type} of ${t.Amount} on {t.CreatedAt:yyyy-MM-dd HH:mm}"));

        var jsonTemplate = "{\"riskScore\": <0-100 integer>, \"feedback\": \"<one sentence explanation>\"}";

        var prompt = $"""
            You are a banking fraud detection AI. Analyze this transaction and return a JSON object only.

            Transaction:
            - Type: {transaction.Type}
            - Amount: ${transaction.Amount}
            - Time: {transaction.CreatedAt:yyyy-MM-dd HH:mm}
            - Customer: {customer.FullName}
            - Current Balance: ${customer.Balance}
            - Account Type: {customer.AccountType}

            Customer's last 10 transactions:
            {historyText}

            Respond with ONLY this JSON, no explanation:
            {jsonTemplate}

            Risk scoring guide:
            0-30: Normal transaction
            31-60: Slightly unusual, monitor
            61-80: Suspicious, review recommended
            81-100: High risk, flag immediately
            """;

        var requestBody = new
        {
            model = "llama-3.1-8b-instant",
            messages = new[]
            {
                new { role = "user", content = prompt }
            },
            max_tokens = 150,
            temperature = 0.1
        };

        var request = new HttpRequestMessage(HttpMethod.Post,
            "https://api.groq.com/openai/v1/chat/completions");
        request.Headers.Add("Authorization", $"Bearer {apiKey}");
        request.Content = new StringContent(
            JsonSerializer.Serialize(requestBody),
            Encoding.UTF8, "application/json");

        var response = await _http.SendAsync(request);
        var responseText = await response.Content.ReadAsStringAsync();

        var doc = JsonDocument.Parse(responseText);
        var content = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? "{}";

        var result = JsonDocument.Parse(content.Trim());
        var riskScore = result.RootElement.GetProperty("riskScore").GetInt32();
        var feedback = result.RootElement.GetProperty("feedback").GetString() ?? "";

        return (riskScore, feedback);
    }
}