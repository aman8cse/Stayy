import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth.js';
import { storeToken } from '../lib/authStorage.js';
import { storeUser } from '../lib/userStorage.js';

function inputClass(hasError) {
  return [
    'mt-1.5 w-full rounded-lg border bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition',
    'ring-brand-500/30 placeholder:text-slate-400 focus:ring-2',
    hasError ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-brand-500',
  ].join(' ');
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
    const newErrors = validateForm();
    setErrors(newErrors);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Log in</h1>
          <p className="mt-2 text-slate-600">Access your Stayy account</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {serverError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {serverError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
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
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
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
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition"
          >
            {submitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-brand-600 hover:text-brand-700">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
