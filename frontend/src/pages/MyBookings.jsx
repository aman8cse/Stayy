import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listUserBookings } from '../api/auth.js';
import { getStoredToken } from '../lib/authStorage.js';

function formatMoney(n) {
  if (n == null || Number.isNaN(n)) return '—';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatDateTime(dateStr, timeStr) {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    const d = new Date(year, month - 1, day, hours, minutes);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return `${dateStr} ${timeStr}`;
  }
}

function getStatusLabel(booking) {
  const now = new Date();
  const endDate = new Date(booking.endDate);
  const [endHours] = booking.endTime.split(':').map(Number);
  endDate.setHours(endHours);

  if (now > endDate) return 'Completed';
  if (now >= new Date(booking.startDate)) return 'In Progress';
  return 'Upcoming';
}

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      navigate('/login');
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await listUserBookings(token);
        setBookings(data.bookings || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  return (
    <div className="app-page space-y-6">
      <section className="app-panel p-6 sm:p-8">
        <p className="text-sm text-slate-500 dark:text-slate-400">Trips</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">My bookings</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Track upcoming stays, in-progress reservations, and past visits.</p>
      </section>

      {loading ? (
        <div className="app-panel p-8 text-center text-slate-600 dark:text-slate-300">Loading bookings...</div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : bookings.length === 0 ? (
        <div className="app-panel p-10 text-center">
          <p className="text-lg font-medium text-slate-900 dark:text-white">No bookings yet</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Browse listings and make your first reservation.</p>
          <Link to="/" className="app-button-primary mt-6">
            Browse listings
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="app-panel p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {booking.listing?.title || 'Listing'}
                    </h2>
                    <span className="app-chip">{getStatusLabel(booking)}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {booking.listing?.city}, {booking.listing?.state}
                  </p>
                  <div className="mt-4 grid gap-3 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2">
                    <div className="app-panel-soft p-3">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Check-in</p>
                      <p className="mt-2 font-medium">{formatDateTime(booking.startDate, booking.startTime)}</p>
                    </div>
                    <div className="app-panel-soft p-3">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Check-out</p>
                      <p className="mt-2 font-medium">{formatDateTime(booking.endDate, booking.endTime)}</p>
                    </div>
                  </div>
                </div>

                <div className="sm:w-48 sm:text-right">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Total paid</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{formatMoney(booking.totalPrice)}</p>
                  <Link to={`/listings/${booking.listing?._id}`} className="mt-4 inline-flex text-sm font-medium text-teal-600 dark:text-teal-300">
                    View listing
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
