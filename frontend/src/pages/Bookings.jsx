import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listBookings } from '../api/auth.js/';
import InlineNotice from '../components/InlineNotice.jsx';
import { getStoredToken } from '../lib/authStorage.js';
import { canCancelBooking, getBookingStatusLabel, matchesBookingFilter } from '../lib/bookingStatus.js';

const FILTERS = [
  { id: 'all', label: 'All bookings' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

function formatMoney(n) {
  if (n == null || Number.isNaN(n)) return '--';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatDateTime(dateStr, timeStr) {
  try {
    const [year, month, day] = String(dateStr).slice(0, 10).split('-').map(Number);
    const [hours, minutes] = String(timeStr).split(':').map(Number);
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

function filterPillClass(active) {
  return [
    'rounded-full px-4 py-2 text-sm font-medium transition',
    active
      ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25'
      : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white',
  ].join(' ');
}

export default function Bookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

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
        const data = await listBookings(token);
        setBookings(data.bookings || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  const summary = useMemo(() => ({
    total: bookings.length,
    upcoming: bookings.filter((booking) => matchesBookingFilter(booking, 'upcoming')).length,
    inProgress: bookings.filter((booking) => matchesBookingFilter(booking, 'in_progress')).length,
    completed: bookings.filter((booking) => matchesBookingFilter(booking, 'completed')).length,
    cancelled: bookings.filter((booking) => matchesBookingFilter(booking, 'cancelled')).length,
  }), [bookings]);

  const filteredBookings = useMemo(
    () => bookings.filter((booking) => matchesBookingFilter(booking, activeFilter)),
    [activeFilter, bookings]
  );


  return (
    <div className="app-page space-y-6">
      <section className="app-panel p-6 sm:p-8">
        <p className="text-sm text-slate-500 dark:text-slate-400">Bookings</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Listings Booked</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Track upcoming stays, in-progress reservations, completed bookings, and any cancelled bookings.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="app-panel-soft p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Total booked</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{summary.total}</p>
        </div>
        <div className="app-panel-soft p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Upcoming</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{summary.upcoming}</p>
        </div>
        <div className="app-panel-soft p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">In progress</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{summary.inProgress}</p>
        </div>
        <div className="app-panel-soft p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Completed</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{summary.completed}</p>
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setActiveFilter(filter.id)}
            className={filterPillClass(activeFilter === filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </section>

      {success ? <InlineNotice tone="success">{success}</InlineNotice> : null}
      {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}

      {loading ? (
        <div className="app-panel p-8 text-center text-slate-600 dark:text-slate-300">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="app-panel p-10 text-center">
          <p className="text-lg font-medium text-slate-900 dark:text-white">No bookings yet</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Browse listings and make your first reservation.</p>
          <Link to="/" className="app-button-primary mt-6">
            Browse listings
          </Link>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="app-panel p-10 text-center">
          <p className="text-lg font-medium text-slate-900 dark:text-white">Nothing in this view yet</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Switch filters or book a new stay to see more activity here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredBookings.map((booking) => {
            const statusLabel = getBookingStatusLabel(booking);

            return (
              <div key={booking._id} className="app-panel p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {booking.listing?.title || 'Listing'}
                      </h2>
                      <span className="app-chip">{statusLabel}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {[booking.listing?.city, booking.listing?.state, booking.listing?.country].filter(Boolean).join(', ') || 'Location unavailable'}
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

                  <div className="sm:w-56 sm:text-right">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Total paid</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{formatMoney(booking.totalPrice)}</p>
                    <div className="mt-4 flex flex-wrap justify-start gap-2 sm:justify-end">
                      {booking.listing?._id ? (
                        <Link to={`/listings/${booking.listing._id}`} className="app-button-secondary">
                          View listing
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
