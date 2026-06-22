import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, BedDouble, LogOut, Hotel, Menu, X, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';

const NAV = [
  { to: '/admin',          icon: LayoutDashboard, label: 'Dashboard',    end: true },
  { to: '/admin/bookings', icon: CalendarDays,    label: 'Bookings' },
  { to: '/admin/rooms',    icon: BedDouble,       label: 'Rooms' },
];

export function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() { logout(); navigate('/'); }

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full bg-[#1a2f4e] text-white ${mobile ? '' : ''}`}>
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <Hotel className="h-7 w-7 text-amber-400" />
          <div>
            <div className="font-bold text-base leading-none" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Mayani Lodge</div>
            <div className="text-[10px] text-amber-400/70 uppercase tracking-widest mt-0.5">Admin Panel</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`
            }>
            <Icon className="h-4.5 w-4.5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 shadow-xl">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-60 shadow-xl"><Sidebar mobile /></div>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between lg:hidden">
          <button onClick={() => setOpen(true)} className="p-1 text-gray-600">
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-semibold text-[#1a2f4e] text-sm" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Mayani Lodge Admin
          </span>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
