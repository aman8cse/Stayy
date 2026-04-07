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

function getStatusBadgeClass(booking) {
  const now = new Date();
  const endDate = new Date(booking.endDate);
  const [endHours] = booking.endTime.split(':').map(Number);
  endDate.setHours(endHours);

  if (now > endDate) return 'bg-slate-100 text-slate-800';
  if (now >= new Date(booking.startDate)) return 'bg-blue-100 text-blue-800';
  return 'bg-green-100 text-green-800';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">My bookings</h1>
          <p className="mt-1 text-slate-600">View and manage your reservations</p>
        </header>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-600 mb-4">You haven't made any bookings yet</p>
            <Link to="/" className="inline-block rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700 transition">
              Browse listings
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="rounded-lg border border-slate-200 bg-white p-6 hover:border-slate-300 transition">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {booking.listing?.title || 'Listing'}
                      </h3>
                      <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${getStatusBadgeClass(booking)}`}>
                        {getStatusLabel(booking)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">
                      {booking.listing?.city}, {booking.listing?.state}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Check-in</p>
                        <p className="font-medium text-slate-900">
                          {formatDateTime(booking.startDate, booking.startTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">Check-out</p>
                        <p className="font-medium text-slate-900">
                          {formatDateTime(booking.endDate, booking.endTime)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Total paid</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatMoney(booking.totalPrice)}
                    </p>
                    <Link
                      to={`/listings/${booking.listing?._id}`}
                      className="mt-3 inline-block text-sm text-brand-600 hover:text-brand-700 font-medium"
                    >
                      View listing
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
