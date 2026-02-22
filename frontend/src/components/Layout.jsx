import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, BarChart3, Activity, FileText, Settings,
  User, LogOut, ChevronLeft, ChevronRight, Eye, Menu, X
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/realtime', icon: Activity, label: 'Real-time' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const Sidebar = ({ mobile = false }) => (
    <div className={clsx(
      'flex flex-col h-full bg-dark-900 border-r border-slate-800 transition-all duration-300',
      mobile ? 'w-64' : collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className={clsx('flex items-center h-16 px-4 border-b border-slate-800', collapsed && !mobile && 'justify-center')}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Eye className="w-4 h-4 text-white" />
          </div>
          {(!collapsed || mobile) && (
            <span className="font-display font-bold text-lg text-white">TrafficLens</span>
          )}
        </div>
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-slate-500 hover:text-slate-300 transition-colors p-1"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => mobile && setMobileOpen(false)}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium',
              isActive
                ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800',
              collapsed && !mobile && 'justify-center px-2'
            )}
            title={collapsed && !mobile ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {(!collapsed || mobile) && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-800 p-2">
        <NavLink
          to="/profile"
          onClick={() => mobile && setMobileOpen(false)}
          className={({ isActive }) => clsx(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium mb-1',
            isActive ? 'bg-primary-600/20 text-primary-400' : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800',
            collapsed && !mobile && 'justify-center px-2'
          )}
        >
          <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {(!collapsed || mobile) && (
            <div className="min-w-0">
              <p className="text-slate-200 text-sm font-medium truncate">{user?.fullName}</p>
              <p className="text-slate-500 text-xs truncate">{user?.email}</p>
            </div>
          )}
        </NavLink>
        <button
          onClick={handleLogout}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm',
            collapsed && !mobile && 'justify-center px-2'
          )}
          title={collapsed && !mobile ? 'Logout' : undefined}
        >
          <LogOut size={16} />
          {(!collapsed || mobile) && 'Logout'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex items-center h-14 px-4 border-b border-slate-800 bg-dark-900">
          <button onClick={() => setMobileOpen(true)} className="text-slate-400 mr-3">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-600 rounded flex items-center justify-center">
              <Eye className="w-3 h-3 text-white" />
            </div>
            <span className="font-display font-bold text-white">TrafficLens</span>
          </div>
        </div>

        <main className="flex-1 overflow-auto bg-dark-950">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
