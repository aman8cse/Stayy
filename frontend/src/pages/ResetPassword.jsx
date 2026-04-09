import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { resetPassword } from '../api/auth.js';

function inputClass(hasError) {
  return [
    'mt-1.5 w-full rounded-lg border bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition',
    'ring-brand-500/30 placeholder:text-slate-400 focus:ring-2',
    hasError ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-brand-500',
  ].join(' ');
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [form, setForm] = useState({ otpCode: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!email) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-medium">Invalid access</p>
            <p className="mt-2">Please request a password reset first.</p>
            <Link to="/forgot-password" className="mt-3 inline-block text-sm font-medium text-amber-700 hover:underline">
              Go to Forgot Password →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  function validateForm() {
    const newErrors = {};

    if (!form.otpCode.trim()) {
      newErrors.otpCode = 'OTP code is required';
    } else if (form.otpCode.length !== 6 || !/^\d+$/.test(form.otpCode)) {
      newErrors.otpCode = 'OTP must be a 6-digit code';
    }

    if (!form.newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (form.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setServerError(null);
    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    try {
      await resetPassword(email, form.otpCode, form.newPassword);
      // Success - redirect to login
      navigate('/login', { state: { message: 'Password reset successful! Please login with your new password.' } });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Password reset failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm ring-1 ring-slate-900/5">
          <h1 className="text-2xl font-semibold text-slate-900 text-center mb-2">
            Reset your password
          </h1>
          <p className="text-sm text-slate-600 text-center mb-6">
            Enter the code from your email and your new password.
          </p>

          {serverError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {serverError}
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
                value={form.otpCode}
                onChange={(e) => {
                  setForm({ ...form, otpCode: e.target.value.replace(/\D/g, '') });
                  setErrors({ ...errors, otpCode: '' });
                }}
                className={inputClass(Boolean(errors.otpCode))}
              />
              {errors.otpCode && <p className="mt-1 text-sm text-red-600">{errors.otpCode}</p>}
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700">
                New password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={form.newPassword}
                  onChange={(e) => {
                    setForm({ ...form, newPassword: e.target.value });
                    setErrors({ ...errors, newPassword: '' });
                  }}
                  className={inputClass(Boolean(errors.newPassword))}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-600 hover:text-slate-900 text-sm"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your new password"
                  value={form.confirmPassword}
                  onChange={(e) => {
                    setForm({ ...form, confirmPassword: e.target.value });
                    setErrors({ ...errors, confirmPassword: '' });
                  }}
                  className={inputClass(Boolean(errors.confirmPassword))}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-slate-600 hover:text-slate-900 text-sm"
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Resetting password…' : 'Reset password'}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-6">
            <p className="text-center text-sm text-slate-600">
              Remember your password?{' '}
              <Link to="/login" className="font-medium text-brand-600 hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Code expires in 10 minutes.
        </p>
      </div>
    </div>
  );
}
