import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getStoredToken, clearToken } from '../lib/authStorage.js';
import { getStoredUser, clearUser, isUserHost } from '../lib/userStorage.js';
import { useTheme } from '../lib/theme.jsx';

const linkClass = ({ isActive }) =>
  [
    'rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ');

export default function AppShell() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const token = getStoredToken();
  const user = getStoredUser();
  const isHost = isUserHost();

  function handleLogout() {
    clearToken();
    clearUser();
    setShowUserMenu(false);
    navigate('/');
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-900' : 'bg-slate-50'}`}>
      <header className={`sticky top-0 z-20 border-b ${theme === 'dark' ? 'border-slate-700 bg-slate-800/90' : 'border-slate-200/80 bg-white/90'} backdrop-blur supports-[backdrop-filter]:${theme === 'dark' ? 'bg-slate-800/75' : 'bg-white/75'}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <NavLink to="/" className={`text-lg font-semibold tracking-tight ${theme === 'dark' ? 'text-brand-400' : 'text-brand-700'}`}>
            Stayy
          </NavLink>
          <nav className="flex flex-wrap items-center gap-1" aria-label="Main">
            <NavLink to="/" className={linkClass} end>
              Browse
            </NavLink>
            {token && isHost && (
              <NavLink to="/host/listings" className={linkClass}>
                My listings
              </NavLink>
            )}
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                theme === 'dark'
                  ? 'text-slate-300 hover:bg-slate-700 hover:text-slate-100'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {token ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition flex items-center gap-2 ${
                    theme === 'dark'
                      ? 'text-slate-300 hover:bg-slate-700 hover:text-slate-100'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  👤 {user?.name?.split(' ')[0] || 'Menu'}
                  <span className={`text-xs transition ${showUserMenu ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {showUserMenu && (
                  <div className={`absolute right-0 top-full mt-1 rounded-lg border ${theme === 'dark' ? 'border-slate-600 bg-slate-800 shadow-xl' : 'border-slate-200 bg-white shadow-lg'}`}>
                    <NavLink
                      to="/bookings"
                      onClick={() => setShowUserMenu(false)}
                      className={`block px-4 py-2 text-sm ${theme === 'dark' ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'} rounded-t-lg`}
                    >
                      My bookings
                    </NavLink>
                    {isHost ? (
                      <>
                        <NavLink
                          to="/host/listings"
                          onClick={() => setShowUserMenu(false)}
                          className={`block px-4 py-2 text-sm ${theme === 'dark' ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'}`}
                        >
                          Host listings
                        </NavLink>
                        <NavLink
                          to="/listings/new"
                          onClick={() => setShowUserMenu(false)}
                          className={`block px-4 py-2 text-sm ${theme === 'dark' ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'}`}
                        >
                          Create listing
                        </NavLink>
                      </>
                    ) : (
                      <NavLink
                        to="/become-host"
                        onClick={() => setShowUserMenu(false)}
                        className={`block px-4 py-2 text-sm ${theme === 'dark' ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'}`}
                      >
                        Become a host
                      </NavLink>
                    )}
                    <button
                      onClick={handleLogout}
                      className={`w-full text-left px-4 py-2 text-sm ${theme === 'dark' ? 'text-red-400 hover:bg-slate-700 border-slate-600' : 'text-red-600 hover:bg-slate-50 border-slate-200'} rounded-b-lg border-t`}
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
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${theme === 'dark' ? 'bg-brand-700 text-slate-100 hover:bg-brand-600' : 'bg-brand-600 text-white hover:bg-brand-700'}`}
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
