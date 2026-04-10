import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth.js';

function inputClass(hasError) {
  return ['app-input mt-1.5', hasError ? 'border-red-300 focus:border-red-500' : ''].join(' ');
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function validateEmail() {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    return true;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setServerError(null);

    if (!validateEmail()) return;

    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 2000);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-page flex min-h-[calc(100vh-7rem)] items-center justify-center">
      <div className="app-panel w-full max-w-xl p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Forgot your password?</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Enter your email and we&apos;ll send a verification code so you can set a new password.
        </p>

        {success ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-center dark:border-emerald-900/40 dark:bg-emerald-950/30">
            <p className="font-medium text-emerald-800 dark:text-emerald-300">Code sent successfully</p>
            <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">
              Check your inbox. We&apos;re taking you to the reset screen now.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {serverError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                {serverError}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                onBlur={validateEmail}
                className={inputClass(Boolean(error))}
              />
              {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
            </div>

            <button type="submit" disabled={submitting} className="app-button-primary w-full">
              {submitting ? 'Sending code...' : 'Send reset code'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-teal-600 hover:text-teal-700 dark:text-teal-300">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
