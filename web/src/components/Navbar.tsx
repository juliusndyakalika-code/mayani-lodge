import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Hotel, Menu, X, LogOut, CalendarDays, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isHome = location.pathname === '/';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, [isHome]);

  const transparent = isHome && !scrolled;

  function handleLogout() {
    logout();
    setDropdownOpen(false);
    navigate('/');
  }

  const navLink = `text-sm font-medium transition-colors ${transparent ? 'text-white/90 hover:text-amber-300' : 'text-gray-700 hover:text-amber-600'}`;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${transparent ? 'bg-transparent' : 'bg-white/95 backdrop-blur-sm shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2.5">
            <Hotel className={`h-7 w-7 ${transparent ? 'text-amber-300' : 'text-amber-600'}`} />
            <div>
              <div className={`text-lg font-bold leading-none tracking-tight ${transparent ? 'text-white' : 'text-[#1a2f4e]'}`} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                Mayian Luxury Motel
              </div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={navLink}>Home</Link>
            <Link to="/rooms" className={navLink}>Rooms</Link>
            <a href="/#amenities" className={navLink}>Amenities</a>
            <a href="/#contact" className={navLink}>Contact</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${transparent ? 'text-white hover:text-amber-300' : 'text-gray-700 hover:text-amber-600'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.name.split(' ')[0]}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 overflow-hidden">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/my-bookings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                      <CalendarDays className="h-4 w-4" /> My Bookings
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#1a2f4e] hover:bg-amber-50 hover:text-amber-700 font-semibold transition-colors border-t border-gray-50"
                      >
                        <LayoutDashboard className="h-4 w-4" /> Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className={`text-sm font-medium transition-colors ${transparent ? 'text-white hover:text-amber-300' : 'text-gray-700 hover:text-amber-600'}`}>
                  Sign In
                </Link>
                <Link to="/register" className="text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg transition-colors shadow-sm">
                  Register
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen
              ? <X className={`h-6 w-6 ${transparent ? 'text-white' : 'text-gray-700'}`} />
              : <Menu className={`h-6 w-6 ${transparent ? 'text-white' : 'text-gray-700'}`} />
            }
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white shadow-lg border-t border-gray-100">
          <div className="flex flex-col px-4 py-4 gap-4">
            <Link to="/" onClick={() => setMobileOpen(false)} className="text-gray-700 font-medium">Home</Link>
            <Link to="/rooms" onClick={() => setMobileOpen(false)} className="text-gray-700 font-medium">Rooms</Link>
            {user ? (
              <>
                <Link to="/my-bookings" onClick={() => setMobileOpen(false)} className="text-gray-700 font-medium">My Bookings</Link>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-[#1a2f4e] font-semibold">Admin Panel</Link>
                )}
                <button onClick={handleLogout} className="text-red-500 font-medium text-left">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-gray-700 font-medium">Sign In</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="font-semibold text-amber-600">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
