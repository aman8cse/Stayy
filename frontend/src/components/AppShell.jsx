import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getStoredToken, clearToken } from '../lib/authStorage.js';

const linkClass = ({ isActive }) =>
  [
    'rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ');

export default function AppShell() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const token = getStoredToken();

  function handleLogout() {
    clearToken();
    setShowUserMenu(false);
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <NavLink to="/" className="text-lg font-semibold tracking-tight text-brand-700">
            Stayy
          </NavLink>
          <nav className="flex flex-wrap items-center gap-1" aria-label="Main">
            <NavLink to="/" className={linkClass} end>
              Browse
            </NavLink>
            {token && (
              <NavLink to="/listings/new" className={linkClass}>
                New listing
              </NavLink>
            )}
          </nav>
          <div className="flex items-center gap-2">
            {token ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition flex items-center gap-2"
                >
                  👤 Menu
                  <span className={`text-xs transition ${showUserMenu ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-1 rounded-lg border border-slate-200 bg-white shadow-lg">
                    <NavLink
                      to="/bookings"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-t-lg"
                    >
                      My bookings
                    </NavLink>
                    <NavLink
                      to="/become-host"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Become a host
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50 rounded-b-lg border-t border-slate-200"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <NavLink to="/login" className={linkClass}>
                  Log in
                </NavLink>
                <NavLink
                  to="/signup"
                  className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 transition"
                >
                  Sign up
                </NavLink>
              </>
            )}
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
