import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth.js';
import { storeToken } from '../lib/authStorage.js';
import { storeUser } from '../lib/userStorage.js';

function inputClass(hasError) {
  return ['app-input mt-1.5', hasError ? 'border-red-300 focus:border-red-500' : ''].join(' ');
}

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  function validateForm() {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email';
    if (!form.password) newErrors.password = 'Password is required';
    return newErrors;
  }

  async function onSubmit(e) {
    e.preventDefault();
    const newErrors = validateForm();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    setServerError(null);
    try {
      const { token, user } = await login(form.email, form.password);
      storeToken(token);
      storeUser(user);
      navigate('/');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function onBlur(name) {
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors(validateForm());
  }

  return (
    <div className="app-page flex min-h-[calc(100vh-7rem)] items-center justify-center">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden rounded-[32px] border border-white/60 bg-gradient-to-br from-slate-900 via-teal-900 to-cyan-700 p-8 text-white shadow-2xl shadow-slate-900/20 lg:block">
          <p className="text-xs uppercase tracking-[0.28em] text-white/70">Stayy Mobile</p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight">Your stays, bookings, and hosting tools in one place.</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/78">
            Sign in to browse smarter, manage trips faster, and keep every part of your stay organized in a clean app-style flow.
          </p>
        </div>

        <div className="app-panel w-full p-6 sm:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Log in to continue to Stayy</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {serverError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                {serverError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                onBlur={() => onBlur('email')}
                className={inputClass(!!errors.email && touched.email)}
                placeholder="you@example.com"
                disabled={submitting}
              />
              {errors.email && touched.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                onBlur={() => onBlur('password')}
                className={inputClass(!!errors.password && touched.password)}
                placeholder="••••••••"
                disabled={submitting}
              />
              {errors.password && touched.password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
              <div className="mt-3 text-right">
                <Link to="/forgot-password" className="text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-300 dark:hover:text-teal-200">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="app-button-primary w-full">
              {submitting ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-teal-600 hover:text-teal-700 dark:text-teal-300">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
