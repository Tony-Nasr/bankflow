import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', roles: ['Admin', 'Manager', 'Teller', 'Auditor'] },
  { label: 'Transactions', path: '/transactions', roles: ['Admin', 'Manager', 'Teller'] },
  { label: 'Customers', path: '/customers', roles: ['Admin', 'Manager', 'Teller'] },
  { label: 'Flagged', path: '/flagged', roles: ['Admin', 'Manager'] },
  { label: 'Reports', path: '/reports', roles: ['Admin', 'Manager', 'Auditor'] },
  { label: 'Audit Logs', path: '/audit-logs', roles: ['Admin', 'Auditor'] },
  { label: 'Users', path: '/users', roles: ['Admin'] },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const filtered = navItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  )

  return (
    <div className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white">BankFlow</h1>
        <p className="text-xs text-slate-400 mt-1">{user?.role} Portal</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {filtered.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="w-full text-left px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition text-sm"
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <p className="text-sm text-white font-medium">{user?.fullName}</p>
        <p className="text-xs text-slate-400 mb-3">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition text-sm"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}