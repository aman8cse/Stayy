import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchListingById } from '../api/listings.js';
import { BookingConflictError, createBooking } from '../api/bookings.js';
import { getStoredToken } from '../lib/authStorage.js';
import { estimateBookingTotal } from '../lib/bookingEstimate.js';

const PURPOSE_LABELS = {
  sleep: 'Sleep',
  study: 'Study',
  freshen_up: 'Freshen up',
};

function formatMoney(n) {
  if (n == null || Number.isNaN(n)) return '—';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function todayDateInputValue() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function ListingDetails() {
  const { listingId } = useParams();

  const [listing, setListing] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [unitId, setUnitId] = useState('');
  const [startDate, setStartDate] = useState(todayDateInputValue);
  const [endDate, setEndDate] = useState(todayDateInputValue);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const [bookingError, setBookingError] = useState(null);
  const [conflict, setConflict] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!listingId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchListingById(listingId);
      setListing(data.listing);
      const units = data.listing?.units ?? [];
      setUnitId(units[0]?._id ?? '');
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load listing');
      setListing(null);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    load();
  }, [load]);

  const units = listing?.units ?? [];
  const selectedUnit = useMemo(
    () => units.find((u) => u._id === unitId) ?? units[0] ?? null,
    [units, unitId]
  );

  const { totalHours, totalPrice } = estimateBookingTotal(
    startDate,
    endDate,
    startTime,
    endTime,
    selectedUnit
  );

  async function onBook(e) {
    e.preventDefault();
    setBookingError(null);
    setConflict(false);
    setBookingSuccess(false);

    const token = getStoredToken();
    if (!token) {
      setBookingError('Sign in required. Save your JWT in localStorage as stayy_token.');
      return;
    }
    if (!selectedUnit?._id) {
      setBookingError('No bookable unit is available for this listing.');
      return;
    }
    if (totalHours == null || totalPrice == null) {
      setBookingError('Choose valid dates and times (end must be after start).');
      return;
    }

    setSubmitting(true);
    try {
      await createBooking(
        {
          unitId: selectedUnit._id,
          startDate,
          endDate,
          startTime,
          endTime,
        },
        token
      );
      setBookingSuccess(true);
    } catch (err) {
      if (err instanceof BookingConflictError) {
        setConflict(true);
        return;
      }
      setBookingError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-600">
        Loading listing…
      </div>
    );
  }

  if (loadError || !listing) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError ?? 'Listing not found.'}
        </div>
        <Link to="/" className="mt-6 inline-block text-sm font-medium text-brand-700 hover:underline">
          ← Back to search
        </Link>
      </div>
    );
  }

  const purposeLabel = PURPOSE_LABELS[listing.roomPurpose] ?? listing.roomPurpose;
  const host = listing.host;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/" className="text-sm font-medium text-brand-700 hover:underline">
        ← Back to search
      </Link>

      <header className="mt-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {listing.isVerified ? (
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800 ring-1 ring-brand-600/15">
              Verified listing
            </span>
          ) : null}
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
            {purposeLabel}
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{listing.title}</h1>
        <p className="text-slate-600">
          {[listing.city, listing.state, listing.country].filter(Boolean).join(', ')}
        </p>
        {listing.averageRating != null ? (
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{listing.averageRating.toFixed(1)}</span> avg
            rating
            {listing.reviewCount ? (
              <span className="text-slate-500"> · {listing.reviewCount} reviews</span>
            ) : null}
          </p>
        ) : null}
      </header>

      <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">About</h2>
        <p className="mt-3 whitespace-pre-wrap text-slate-700">{listing.description}</p>
      </section>

      {host ? (
        <section className="mt-6 flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <span className="font-medium text-slate-800">Host:</span> {host.name}
          {host.isVerified ? (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-600/15">
              Verified host
            </span>
          ) : null}
        </section>
      ) : null}

      <section className="mt-10 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
        <h2 className="text-lg font-semibold text-slate-900">Book this space</h2>
        <p className="mt-1 text-sm text-slate-500">
          Under 24 hours total uses the hourly rate; 24 hours or more uses the daily rate (same as the API).
        </p>

        {units.length === 0 ? (
          <p className="mt-4 text-sm text-amber-800">This listing has no units available to book yet.</p>
        ) : (
          <form onSubmit={onBook} className="mt-6 space-y-5">
            {units.length > 1 ? (
              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-slate-700">
                  Unit
                </label>
                <select
                  id="unit"
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none ring-brand-500/30 focus:border-brand-500 focus:ring-4"
                >
                  {units.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.unitType?.replace('_', ' ') ?? 'Unit'} · ${u.pricePerHour}/hr · ${u.pricePerDay}/day
                      · cap {u.capacity}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">
                  Start date
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none ring-brand-500/30 focus:border-brand-500 focus:ring-4"
                  required
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-slate-700">
                  End date
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none ring-brand-500/30 focus:border-brand-500 focus:ring-4"
                  required
                />
              </div>
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-slate-700">
                  Start time
                </label>
                <input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none ring-brand-500/30 focus:border-brand-500 focus:ring-4"
                  required
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-slate-700">
                  End time
                </label>
                <input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none ring-brand-500/30 focus:border-brand-500 focus:ring-4"
                  required
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estimated total</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{formatMoney(totalPrice)}</p>
              {totalHours != null ? (
                <p className="mt-1 text-sm text-slate-600">{totalHours} hours</p>
              ) : (
                <p className="mt-1 text-sm text-slate-500">Enter a valid range to see price</p>
              )}
            </div>

            {conflict ? (
              <div
                className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900"
                role="alert"
              >
                Already booked
              </div>
            ) : null}

            {bookingError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {bookingError}
              </div>
            ) : null}

            {bookingSuccess ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                Booking confirmed. Check your trips under account history.
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting || units.length === 0}
              className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
            >
              {submitting ? 'Booking…' : 'Book'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
