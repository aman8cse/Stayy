import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth.js';

function inputClass(hasError) {
  return [
    'mt-1.5 w-full rounded-lg border bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition',
    'ring-brand-500/30 placeholder:text-slate-400 focus:ring-2',
    hasError ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-brand-500',
  ].join(' ');
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
      // Auto-redirect after 2 seconds
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm ring-1 ring-slate-900/5">
          <h1 className="text-2xl font-semibold text-slate-900 text-center mb-2">
            Forgot your password?
          </h1>
          <p className="text-sm text-slate-600 text-center mb-6">
            Enter your email address and we'll send you a code to reset your password.
          </p>

          {success ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4 text-center">
              <p className="font-medium text-emerald-800 mb-2">✓ Code sent!</p>
              <p className="text-sm text-emerald-700">
                Check your email for the reset code. Redirecting to password reset page…
              </p>
            </div>
          ) : (
            <>
              {serverError && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {serverError}
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700">
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
                  {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Sending code…' : 'Send reset code'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                Remember your password?{' '}
                <Link to="/login" className="font-medium text-brand-600 hover:underline">
                  Log in
                </Link>
              </p>
            </>
          )}
        </div>

        {success && (
          <p className="mt-6 text-center text-xs text-slate-500">
            If you didn't receive the code, check your spam folder.
          </p>
        )}
      </div>
    </div>
  );
}
