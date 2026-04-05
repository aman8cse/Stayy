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
      setTimeout(() => {
        navigate('/listings/new');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to become a host');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Become a host</h1>
          <p className="mt-2 text-lg text-slate-600">Start earning by sharing your space on Stayy</p>
        </header>

        <div className="space-y-8">
          {/* Benefits Section */}
          <div className="rounded-lg border border-slate-200 bg-white p-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">Why become a host?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-3xl mb-2">💰</div>
                <h3 className="font-semibold text-slate-900 mb-2">Earn extra income</h3>
                <p className="text-slate-600 text-sm">Set your own prices and earn from your unused space</p>
              </div>
              <div>
                <div className="text-3xl mb-2">🏠</div>
                <h3 className="font-semibold text-slate-900 mb-2">Stay in control</h3>
                <p className="text-slate-600 text-sm">Manage your availability and approve bookings</p>
              </div>
              <div>
                <div className="text-3xl mb-2">🤝</div>
                <h3 className="font-semibold text-slate-900 mb-2">Meet people</h3>
                <p className="text-slate-600 text-sm">Connect with travelers and locals in your community</p>
              </div>
            </div>
          </div>

          {/* Requirements Section */}
          <div className="rounded-lg border border-slate-200 bg-white p-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">Host requirements</h2>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span>Must be at least 18 years old</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span>Valid email address and phone number</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span>Provide accurate listing information</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span>Maintain a safe and clean space</span>
              </li>
            </ul>
          </div>

          {/* CTA Section */}
          <div className="rounded-lg bg-gradient-to-r from-brand-50 to-brand-100 border border-brand-200 p-8 text-center">
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}
            
            {success ? (
              <div className="text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-2">Welcome to Stayy hosts!</h3>
                <p className="text-slate-600 mb-4">You're now a host. Let's create your first listing.</p>
                <p className="text-sm text-slate-500">Redirecting...</p>
              </div>
            ) : (
              <>
                <p className="text-slate-700 mb-6">Ready to start hosting? Click below to activate your host account and create your first listing.</p>
                <button
                  onClick={handleBecomeHost}
                  disabled={loading}
                  className="rounded-lg bg-brand-600 px-8 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition inline-block"
                >
                  {loading ? 'Activating...' : 'Become a host'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
