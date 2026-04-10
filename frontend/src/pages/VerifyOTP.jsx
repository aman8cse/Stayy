import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { verifyOTP, resendOTP } from '../api/auth.js';
import { storeToken } from '../lib/authStorage.js';
import { storeUser } from '../lib/userStorage.js';

function inputClass(hasError) {
  return ['app-input mt-1.5', hasError ? 'border-red-300 focus:border-red-500' : ''].join(' ');
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
      <div className="app-page flex min-h-[calc(100vh-7rem)] items-center justify-center">
        <div className="app-panel w-full max-w-md p-6">
          <p className="font-medium text-slate-900 dark:text-white">Invalid access</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Please sign up first to verify your email.</p>
          <Link to="/signup" className="mt-4 inline-block text-sm font-medium text-teal-600 dark:text-teal-300">
            Go to Sign Up
          </Link>
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
    <div className="app-page flex min-h-[calc(100vh-7rem)] items-center justify-center">
      <div className="app-panel w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Verify your email</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          We sent a 6-digit verification code to <span className="font-medium">{email}</span>.
        </p>

        {serverError && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            {serverError}
          </div>
        )}

        {resendSuccess && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
            {resendSuccess}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="otpCode" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
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
            {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
          </div>

          <button type="submit" disabled={submitting} className="app-button-primary w-full">
            {submitting ? 'Verifying...' : 'Verify email'}
          </button>
        </form>

        <button onClick={handleResend} disabled={resending} className="app-button-secondary mt-4 w-full">
          {resending ? 'Resending...' : 'Resend OTP'}
        </button>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Wrong email?{' '}
          <Link to="/signup" className="font-medium text-teal-600 dark:text-teal-300">
            Go back
          </Link>
        </p>
      </div>
    </div>
  );
}
