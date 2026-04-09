import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { verifyOTP, resendOTP } from '../api/auth.js';
import { storeToken } from '../lib/authStorage.js';
import { storeUser } from '../lib/userStorage.js';

function inputClass(hasError) {
  return [
    'mt-1.5 w-full rounded-lg border bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition',
    'ring-brand-500/30 placeholder:text-slate-400 focus:ring-2',
    hasError ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-brand-500',
  ].join(' ');
}

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(null);

  if (!email) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-medium">Invalid access</p>
            <p className="mt-2">Please sign up first to verify your email.</p>
            <Link to="/signup" className="mt-3 inline-block text-sm font-medium text-amber-700 hover:underline">
              Go to Sign Up →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setServerError(null);

    if (!otpCode.trim()) {
      setError('OTP code is required');
      return;
    }

    if (otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
      setError('OTP must be a 6-digit code');
      return;
    }

    setSubmitting(true);
    try {
      const { user, token } = await verifyOTP(email, otpCode);
      storeToken(token);
      storeUser(user);
      navigate('/');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResendSuccess(null);
    setServerError(null);
    setResending(true);
    try {
      await resendOTP(email);
      setResendSuccess('OTP has been resent to your email');
      setOtpCode('');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm ring-1 ring-slate-900/5">
          <h1 className="text-2xl font-semibold text-slate-900 text-center mb-2">
            Verify your email
          </h1>
          <p className="text-sm text-slate-600 text-center mb-6">
            We've sent a 6-digit code to <strong>{email}</strong>
          </p>

          {serverError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {serverError}
            </div>
          )}

          {resendSuccess && (
            <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {resendSuccess}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label htmlFor="otpCode" className="block text-sm font-medium text-slate-700">
                Verification code
              </label>
              <input
                id="otpCode"
                type="text"
                maxLength="6"
                inputMode="numeric"
                placeholder="000000"
                value={otpCode}
                onChange={(e) => {
                  setOtpCode(e.target.value.replace(/\D/g, ''));
                  setError(null);
                }}
                className={inputClass(Boolean(error))}
              />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Verifying…' : 'Verify email'}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-6">
            <p className="text-sm text-slate-600 text-center mb-3">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resending ? 'Resending…' : 'Resend OTP'}
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            This code expires in 10 minutes.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Wrong email? Go back to{' '}
          <Link to="/signup" className="font-medium text-brand-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
