import { NavLink, Outlet } from 'react-router-dom';

const linkClass = ({ isActive }) =>
  [
    'rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ');

export default function AppShell() {
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
            <NavLink to="/listings/new" className={linkClass}>
              New listing
            </NavLink>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
