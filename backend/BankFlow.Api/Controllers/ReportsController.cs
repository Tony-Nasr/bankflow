using BankFlow.Api.Data;
using ClosedXML.Excel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace BankFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Manager,Auditor")]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReportsController(AppDbContext context)
    {
        _context = context;
        QuestPDF.Settings.License = LicenseType.Community;
    }

    [HttpGet("transactions/excel")]
    public async Task<IActionResult> ExportTransactionsExcel()
    {
        var transactions = await _context.Transactions
            .Include(t => t.Customer)
            .Include(t => t.Branch)
            .Include(t => t.ProcessedByUser)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Transactions");

        ws.Cell(1, 1).Value = "ID";
        ws.Cell(1, 2).Value = "Type";
        ws.Cell(1, 3).Value = "Amount";
        ws.Cell(1, 4).Value = "Customer";
        ws.Cell(1, 5).Value = "Branch";
        ws.Cell(1, 6).Value = "Processed By";
        ws.Cell(1, 7).Value = "Date";
        ws.Cell(1, 8).Value = "Flagged";
        ws.Cell(1, 9).Value = "AI Risk Score";
        ws.Cell(1, 10).Value = "AI Feedback";

        var headerRow = ws.Row(1);
        headerRow.Style.Font.Bold = true;
        headerRow.Style.Fill.BackgroundColor = XLColor.DarkBlue;
        headerRow.Style.Font.FontColor = XLColor.White;

        for (int i = 0; i < transactions.Count; i++)
        {
            var t = transactions[i];
            var row = i + 2;
            ws.Cell(row, 1).Value = t.Id;
            ws.Cell(row, 2).Value = t.Type;
            ws.Cell(row, 3).Value = (double)t.Amount;
            ws.Cell(row, 4).Value = t.Customer?.FullName ?? "";
            ws.Cell(row, 5).Value = t.Branch?.Name ?? "";
            ws.Cell(row, 6).Value = t.ProcessedByUser?.FullName ?? "";
            ws.Cell(row, 7).Value = t.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss");
            ws.Cell(row, 8).Value = t.IsFlagged ? "Yes" : "No";
            ws.Cell(row, 9).Value = t.AiRiskScore;
            ws.Cell(row, 10).Value = t.AiFeedback;

            if (t.IsFlagged)
                ws.Row(row).Style.Fill.BackgroundColor = XLColor.LightSalmon;
        }

        ws.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        stream.Position = 0;

        return File(stream.ToArray(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"BankFlow_Transactions_{DateTime.Now:yyyyMMdd}.xlsx");
    }

    [HttpGet("transactions/pdf")]
    public async Task<IActionResult> ExportTransactionsPdf()
    {
        var transactions = await _context.Transactions
            .Include(t => t.Customer)
            .Include(t => t.Branch)
            .OrderByDescending(t => t.CreatedAt)
            .Take(50)
            .ToListAsync();

        var pdf = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(1, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(9));

                page.Header().Text($"BankFlow — Transaction Report ({DateTime.Now:yyyy-MM-dd})")
                    .SemiBold().FontSize(14).FontColor(Colors.Blue.Darken3);

                page.Content().Table(table =>
                {
                    table.ColumnsDefinition(cols =>
                    {
                        cols.ConstantColumn(30);
                        cols.RelativeColumn(2);
                        cols.RelativeColumn(2);
                        cols.RelativeColumn(2);
                        cols.RelativeColumn(2);
                        cols.RelativeColumn(3);
                        cols.ConstantColumn(50);
                    });

                    table.Header(header =>
                    {
                        foreach (var h in new[] { "ID", "Type", "Amount", "Customer", "Branch", "Date", "Risk" })
                        {
                            header.Cell().Background(Colors.Blue.Darken3)
                                .Padding(4).Text(h).FontColor(Colors.White).SemiBold();
                        }
                    });

                    foreach (var t in transactions)
                    {
                        var bg = t.IsFlagged ? Colors.Red.Lighten4 : Colors.White;
                        table.Cell().Background(bg).Padding(4).Text(t.Id.ToString());
                        table.Cell().Background(bg).Padding(4).Text(t.Type);
                        table.Cell().Background(bg).Padding(4).Text($"${t.Amount:N2}");
                        table.Cell().Background(bg).Padding(4).Text(t.Customer?.FullName ?? "");
                        table.Cell().Background(bg).Padding(4).Text(t.Branch?.Name ?? "");
                        table.Cell().Background(bg).Padding(4).Text(t.CreatedAt.ToString("MM/dd HH:mm"));
                        table.Cell().Background(bg).Padding(4).Text(t.IsFlagged ? $"⚠ {t.AiRiskScore}" : "Clear");
                    }
                });

                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Page ");
                    x.CurrentPageNumber();
                    x.Span(" — BankFlow Compliance Report");
                });
            });
        });

        var pdfBytes = pdf.GeneratePdf();
        return File(pdfBytes, "application/pdf",
            $"BankFlow_Report_{DateTime.Now:yyyyMMdd}.pdf");
    }
}