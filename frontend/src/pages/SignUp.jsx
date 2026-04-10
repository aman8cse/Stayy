import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../api/auth.js';
import { storeToken } from '../lib/authStorage.js';
import { storeUser } from '../lib/userStorage.js';

function inputClass(hasError) {
  return ['app-input mt-1.5', hasError ? 'border-red-300 focus:border-red-500' : ''].join(' ');
}

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  function validateForm() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Full name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
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
      const { token, user } = await signup(form.email, form.password, form.name, form.phone);
      storeToken(token);
      storeUser(user);
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Signup failed');
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
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_1.05fr]">
        <div className="app-panel hidden p-8 lg:block">
          <span className="app-chip">New to Stayy</span>
          <h1 className="mt-5 text-4xl font-semibold text-slate-900 dark:text-white">Create your account and start booking smarter.</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
            Sign up once to browse stays, manage reservations, become a host, and move through the experience with a clean app-like flow.
          </p>
        </div>

        <div className="app-panel w-full p-6 sm:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create account</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Join Stayy and start booking spaces</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {serverError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                {serverError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                onBlur={() => onBlur('name')}
                className={inputClass(!!errors.name && touched.name)}
                placeholder="John Doe"
                disabled={submitting}
              />
              {errors.name && touched.name && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

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
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                onBlur={() => onBlur('phone')}
                className={inputClass(!!errors.phone && touched.phone)}
                placeholder="+1 (555) 123-4567"
                disabled={submitting}
              />
              {errors.phone && touched.phone && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
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
            </div>

            <button type="submit" disabled={submitting} className="app-button-primary w-full">
              {submitting ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-teal-600 hover:text-teal-700 dark:text-teal-300">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
