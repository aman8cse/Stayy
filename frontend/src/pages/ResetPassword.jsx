import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { resetPassword } from '../api/auth.js';

function inputClass(hasError) {
  return ['app-input mt-1.5', hasError ? 'border-red-300 focus:border-red-500' : ''].join(' ');
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
      <div className="app-page flex min-h-[calc(100vh-7rem)] items-center justify-center">
        <div className="app-panel w-full max-w-md p-6">
          <p className="font-medium text-slate-900 dark:text-white">Invalid access</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Please request a password reset first.</p>
          <Link to="/forgot-password" className="mt-4 inline-block text-sm font-medium text-teal-600 dark:text-teal-300">
            Go to Forgot Password
          </Link>
        </div>
      </div>
    );
  }

  function validateForm() {
    const newErrors = {};

    if (!form.otpCode.trim()) newErrors.otpCode = 'OTP code is required';
    else if (form.otpCode.length !== 6 || !/^\d+$/.test(form.otpCode)) newErrors.otpCode = 'OTP must be a 6-digit code';

    if (!form.newPassword) newErrors.newPassword = 'Password is required';
    else if (form.newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';

    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (form.newPassword !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

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
      navigate('/login', { state: { message: 'Password reset successful! Please login with your new password.' } });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Password reset failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-page flex min-h-[calc(100vh-7rem)] items-center justify-center">
      <div className="app-panel w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Reset your password</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Enter the verification code from your email and choose a new password.
        </p>

        {serverError && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            {serverError}
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
              value={form.otpCode}
              onChange={(e) => {
                setForm({ ...form, otpCode: e.target.value.replace(/\D/g, '') });
                setErrors({ ...errors, otpCode: '' });
              }}
              className={inputClass(Boolean(errors.otpCode))}
            />
            {errors.otpCode && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.otpCode}</p>}
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
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
                className="absolute right-3 top-5 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.newPassword && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.newPassword}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
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
                className="absolute right-3 top-5 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" disabled={submitting} className="app-button-primary w-full">
            {submitting ? 'Resetting password...' : 'Reset password'}
          </button>
        </form>

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
