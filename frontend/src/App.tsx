//import DashboardPage from './pages/DashboardPage'  //new
import FlaggedPage from './pages/FlaggedPage' //new
import AuditLogsPage from './pages/AuditLogsPage' //new
import ReportsPage from './pages/ReportsPage'  //new
import AnalyticsPage from './pages/AnalyticsPage'  //new
import UsersPage from './pages/UsersPage'           //new
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardLayout from './components/DashboardLayout'
import { useAuthStore } from './store/authStore'
import CustomersPage from './pages/CustomersPage'
import TransactionsPage from './pages/TransactionsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          
<Route path="dashboard" element={<AnalyticsPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
<Route path="customers" element={<CustomersPage />} />
<Route path="flagged" element={<FlaggedPage />} />

<Route path="reports" element={<ReportsPage />} />
<Route path="audit-logs" element={<AuditLogsPage />} />

<Route path="users" element={<UsersPage />} />

        </Route>
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App