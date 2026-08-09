import DashboardPage from './pages/DashboardPage'  //new
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
<Route path="dashboard" element={<DashboardPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
<Route path="customers" element={<CustomersPage />} />
          <Route path="flagged" element={<div className="text-white">Flagged coming soon...</div>} />
          <Route path="reports" element={<div className="text-white">Reports coming soon...</div>} />
          <Route path="audit-logs" element={<div className="text-white">Audit Logs coming soon...</div>} />
          <Route path="users" element={<div className="text-white">Users coming soon...</div>} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App