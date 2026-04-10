import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getStoredToken, clearToken } from '../lib/authStorage.js';
import { getStoredUser, clearUser, isUserHost, isUserAdmin } from '../lib/userStorage.js';
import { useTheme } from '../lib/theme.jsx';

function ShellIcon({ path }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const topLinkClass = ({ isActive }) =>
  [
    'rounded-full px-3 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-black/5 text-slate-900 dark:bg-white/10 dark:text-white'
      : 'text-slate-500 hover:bg-black/5 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white',
  ].join(' ');

const mobileLinkClass = ({ isActive }) =>
  [
    'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-medium transition',
    isActive
      ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25'
      : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/80',
  ].join(' ');

export default function AppShell() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const token = getStoredToken();
  const user = getStoredUser();
  const isHost = isUserHost();
  const isAdmin = isUserAdmin();

  function handleLogout() {
    clearToken();
    clearUser();
    setShowUserMenu(false);
    navigate('/');
  }

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen`}>
      <div className="sticky top-0 z-30 px-3 pb-3 pt-3 sm:px-6">
        <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-[26px] border border-white/60 bg-white/75 px-4 py-3 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/75 dark:shadow-black/20">
          <NavLink to="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 via-teal-500 to-cyan-500 text-sm font-bold text-white shadow-lg shadow-teal-500/30">
              S
            </div>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
                Stayy App
              </p>
              <p className="truncate text-base font-semibold text-slate-900 dark:text-white">
                Short stays, simplified
              </p>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            <NavLink to="/" className={topLinkClass} end>
              Discover
            </NavLink>
            {token && (
              <NavLink to="/bookings" className={topLinkClass}>
                Trips
              </NavLink>
            )}
            {token && isHost && (
              <NavLink to="/host/listings" className={topLinkClass}>
                Host
              </NavLink>
            )}
            {token && isAdmin && (
              <NavLink to="/admin/dashboard" className={topLinkClass}>
                Admin
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-black/5 bg-white/70 text-slate-600 transition hover:-translate-y-0.5 hover:text-slate-900 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:text-white"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <ShellIcon path="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" />
              ) : (
                <ShellIcon path="M12 3v2.2m0 13.6V21m9-9h-2.2M5.2 12H3m15.16 6.36-1.56-1.56M7.4 7.4 5.84 5.84m12.32 0L16.6 7.4M7.4 16.6l-1.56 1.56M15.5 12a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z" />
              )}
            </button>

            {token ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu((open) => !open)}
                  className="inline-flex items-center gap-3 rounded-2xl border border-black/5 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-200"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-xs font-bold text-white dark:from-teal-500 dark:to-cyan-500">
                    {(user?.name?.[0] || 'U').toUpperCase()}
                  </span>
                  <span className="hidden sm:block">{user?.name?.split(' ')[0] || 'Menu'}</span>
                  <span className={`text-xs transition ${showUserMenu ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-3xl border border-white/60 bg-white/95 p-2 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-black/30">
                    <NavLink
                      to="/bookings"
                      onClick={() => setShowUserMenu(false)}
                      className="block rounded-2xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      My bookings
                    </NavLink>

                    {isAdmin && (
                      <NavLink
                        to="/admin/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="block rounded-2xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Admin Dashboard
                      </NavLink>
                    )}

                    {isHost && (
                      <>
                        <NavLink
                          to="/host/listings"
                          onClick={() => setShowUserMenu(false)}
                          className="block rounded-2xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          My listings
                        </NavLink>
                        <NavLink
                          to="/listings/new"
                          onClick={() => setShowUserMenu(false)}
                          className="block rounded-2xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          Create listing
                        </NavLink>
                      </>
                    )}

                    {!isHost && !isAdmin && (
                      <NavLink
                        to="/become-host"
                        onClick={() => setShowUserMenu(false)}
                        className="block rounded-2xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Become a host
                      </NavLink>
                    )}

                    <button
                      onClick={handleLogout}
                      className="mt-1 w-full rounded-2xl px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <NavLink to="/login" className={topLinkClass}>
                  Log in
                </NavLink>
                <NavLink to="/signup" className="app-button-primary hidden sm:inline-flex">
                  Get started
                </NavLink>
              </>
            )}
          </div>
        </header>
      </div>

      <main>
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/70 bg-white/90 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-20px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/88 md:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-2">
          <NavLink to="/" className={mobileLinkClass} end>
            <ShellIcon path="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z" />
            Discover
          </NavLink>
          {token && (
            <NavLink to="/bookings" className={mobileLinkClass}>
              <ShellIcon path="M8 7V3m8 4V3M5 11h14M6 5h12a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
              Trips
            </NavLink>
          )}
          {token && isHost && (
            <NavLink to="/host/listings" className={mobileLinkClass}>
              <ShellIcon path="M4 20h16M6 20V9l6-5 6 5v11M10 20v-5h4v5" />
              Host
            </NavLink>
          )}
          {!token && (
            <NavLink to="/login" className={mobileLinkClass}>
              <ShellIcon path="M10 17l5-5-5-5M15 12H3m9 9h6a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-6" />
              Login
            </NavLink>
          )}
        </div>
      </nav>
    </div>
  );
}
