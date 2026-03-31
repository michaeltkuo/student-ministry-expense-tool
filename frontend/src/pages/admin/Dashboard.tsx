import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Building2, LogOut } from 'lucide-react'
import clsx from 'clsx'
import { logout } from '../../api/auth'

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-cru-gray">
      <aside className="w-64 bg-cru-black text-cru-yellow flex flex-col">
        <div className="p-5 border-b border-white/20">
          <img src="/brand/cru-logo-home.png" alt="Cru logo" className="h-10 w-auto mb-3" />
          <h1 className="font-heading font-bold text-lg leading-tight">Ministry Expenses</h1>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <NavLink
            to="/admin/submissions"
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-cru-yellow text-cru-black' : 'text-white hover:bg-white/10',
              )
            }
          >
            <LayoutDashboard size={18} />
            Submissions
          </NavLink>
          <NavLink
            to="/admin/ministries"
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-cru-yellow text-cru-black' : 'text-white hover:bg-white/10',
              )
            }
          >
            <Building2 size={18} />
            Ministries
          </NavLink>
        </nav>
        <div className="p-3 border-t border-white/20">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/10 w-full transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
