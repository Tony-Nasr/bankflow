# BankFlow — Core Banking Operations Dashboard

A real-time banking operations platform targeting Lebanese banks and financial institutions. Built with ASP.NET Core 8, React + TypeScript, PostgreSQL, SignalR, and Groq AI.

![BankFlow Dashboard](https://raw.githubusercontent.com/Tony-Nasr/bankflow/main/screenshots/dashboard.png)

## Features

### For Branch Managers
- Real-time transaction feed via SignalR WebSockets
- AI-powered fraud detection with risk scores 0-100 (Groq LLaMA 3.1)
- Flagged transaction review with AI explanation
- PDF and Excel compliance report export

### For Tellers
- Process deposits, withdrawals, and transfers
- Customer account search and history
- Real-time balance updates

### For Auditors & Admins
- Full audit log of all operations with timestamps
- Platform-wide analytics dashboard with charts
- User management (create tellers, managers, auditors)
- Export reports to Excel and PDF

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Charts | Recharts |
| Real-time | SignalR |
| State | Zustand |
| Backend | ASP.NET Core 8 Web API |
| Auth | JWT + Refresh Tokens + Role-Based (4 roles) |
| Database | PostgreSQL + Entity Framework Core 8 |
| AI | Groq API (LLaMA 3.1 8B) |
| PDF Export | QuestPDF |
| Excel Export | ClosedXML |
| Containers | Docker + docker-compose |
| Deployment | Render (backend + DB) + Vercel (frontend) |

## Roles

| Role | Permissions |
|------|------------|
| Admin | Full access — users, branches, reports, analytics |
| Manager | Transactions, flagged review, reports, customers |
| Teller | Process transactions, view customers |
| Auditor | Audit logs, reports, analytics (read-only) |

## AI Fraud Detection

Every transaction is analyzed by Groq AI (LLaMA 3.1) in real time:
- Risk score 0-100 assigned automatically
- Transactions above 60 are flagged for manager review
- AI considers transaction amount, type, time, and customer history
- Explanation provided for every flagged transaction

## Project Structure