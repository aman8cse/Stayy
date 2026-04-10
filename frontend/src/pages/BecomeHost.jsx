import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { becomeHost } from '../api/auth.js';
import { getStoredToken } from '../lib/authStorage.js';
import { storeUser } from '../lib/userStorage.js';

export default function BecomeHost() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  async function handleBecomeHost() {
    const token = getStoredToken();
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { user } = await becomeHost(token);
      storeUser(user);
      setSuccess(true);
      setTimeout(() => navigate('/listings/new'), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to become a host');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-page space-y-6">
      <section className="app-panel overflow-hidden p-6 sm:p-8">
        <span className="app-chip">Host onboarding</span>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">Turn your space into a polished hosting experience.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Stayy gives you a cleaner listing workflow, app-style management screens, and a simpler path from setup to bookings.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="app-panel-soft p-5">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">Earn more intentionally</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Set your own rates and open only the inventory you actually want to host.</p>
        </div>
        <div className="app-panel-soft p-5">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">Manage like an app</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Use streamlined listing, booking, and editing flows designed for mobile first.</p>
        </div>
        <div className="app-panel-soft p-5">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">Build guest trust</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Publish accurate details, amenities, and pricing in a clean verified experience.</p>
        </div>
      </section>

      <section className="app-panel p-6 sm:p-8">
        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center dark:border-emerald-900/40 dark:bg-emerald-950/30">
            <p className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">You&apos;re now a host</p>
            <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">Redirecting you to create your first listing...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">Ready to activate host mode?</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Once enabled, you can immediately create and manage listings from your dashboard.</p>
            </div>
            <button onClick={handleBecomeHost} disabled={loading} className="app-button-primary">
              {loading ? 'Activating...' : 'Become a host'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
