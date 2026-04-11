import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchListingById } from '../api/listings.js';
import { BookingConflictError, createBooking } from '../api/bookings.js';
import { listUserBookings } from '../api/auth.js';
import InlineNotice from '../components/InlineNotice.jsx';
import { ReviewsList, ReviewForm } from '../components/Reviews.jsx';
import { getStoredToken } from '../lib/authStorage.js';
import { estimateBookingTotal } from '../lib/bookingEstimate.js';

function formatMoney(n) {
  if (n == null || Number.isNaN(n)) return '--';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'INR',
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
  const [canReview, setCanReview] = useState(false);
  const [reviewStatus, setReviewStatus] = useState('idle');
  const [reviewMessage, setReviewMessage] = useState('Sign in and complete a booking to leave a review.');

  const load = useCallback(async () => {
    if (!listingId) return;

    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchListingById(listingId);
      setListing(data.listing);
      const units = data.listing?.units ?? [];
      setUnitId(units[0]?._id ?? '');
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load listing');
      setListing(null);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let active = true;

    async function loadReviewEligibility() {
      if (!listingId) return;

      const token = getStoredToken();
      if (!token) {
        if (!active) return;
        setCanReview(false);
        setReviewStatus('signed_out');
        setReviewMessage('Sign in and book this listing to leave a review.');
        return;
      }

      setReviewStatus('loading');
      try {
        const data = await listUserBookings(token);
        if (!active) return;

        const hasBookingForListing = (data.bookings || []).some(
          (booking) => booking?.listing?._id === listingId && booking?.status === 'confirmed'
        );

        setCanReview(hasBookingForListing);
        setReviewStatus('ready');
        setReviewMessage(
          hasBookingForListing
            ? ''
            : 'Only guests with a confirmed booking for this listing can leave a review.'
        );
      } catch (error) {
        if (!active) return;
        setCanReview(false);
        setReviewStatus('error');
        setReviewMessage(error instanceof Error ? error.message : 'Unable to check review eligibility right now.');
      }
    }

    loadReviewEligibility();

    return () => {
      active = false;
    };
  }, [listingId, bookingSuccess]);

  const units = useMemo(
    () => (listing?.units ?? []).filter((unit) => (unit.quantity ?? 1) > 0),
    [listing]
  );

  const selectedUnit = useMemo(
    () => units.find((unit) => unit._id === unitId) ?? units[0] ?? null,
    [unitId, units]
  );

  const { totalHours, totalPrice } = estimateBookingTotal(startDate, endDate, startTime, endTime, selectedUnit);

  async function onBook(event) {
    event.preventDefault();
    setBookingError(null);
    setConflict(false);
    setBookingSuccess(false);

    const token = getStoredToken();
    if (!token) {
      setBookingError('Sign in required to complete a booking.');
      return;
    }

    if (!selectedUnit?._id) {
      setBookingError('No bookable unit is available for this listing.');
      return;
    }

    if (totalHours == null || totalPrice == null) {
      setBookingError('Choose valid dates and times. End time must be after start time.');
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
      setCanReview(true);
      setReviewStatus('ready');
      setReviewMessage('');
    } catch (error) {
      if (error instanceof BookingConflictError) {
        setConflict(true);
        return;
      }

      setBookingError(error instanceof Error ? error.message : 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="app-page text-center text-slate-600 dark:text-slate-300">Loading listing...</div>;
  }

  if (loadError || !listing) {
    return (
      <div className="app-page">
        <InlineNotice tone="error">{loadError ?? 'Listing not found.'}</InlineNotice>
        <Link to="/" className="mt-6 inline-flex text-sm font-medium text-teal-600 dark:text-teal-300">
          Back to search
        </Link>
      </div>
    );
  }

  const host = listing.host;
  const primaryImage =
    selectedUnit?.images?.find((image) => image.isThumbnail)?.url || selectedUnit?.images?.[0]?.url;

  return (
    <div className="app-page space-y-6">
      <Link to="/" className="inline-flex text-sm font-medium text-teal-600 dark:text-teal-300">
        Back to search
      </Link>

      <section className="app-panel overflow-hidden p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              {listing.isVerified ? <span className="app-chip">Verified listing</span> : null}
              {host?.isVerified ? <span className="app-chip">Verified host</span> : null}
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {listing.title}
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {[listing.city, listing.state, listing.country].filter(Boolean).join(', ')}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {listing.averageRating != null ? (
                <span className="app-chip">{listing.averageRating.toFixed(1)} rating · {listing.reviewCount || 0} reviews</span>
              ) : (
                <span className="app-chip">No reviews yet</span>
              )}
              {host ? <span className="app-chip">Hosted by {host.name}</span> : null}
            </div>
          </div>

          <div className="app-panel-soft min-w-[180px] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Starting from</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              {formatMoney(selectedUnit?.pricePerDay)}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">per day</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="app-panel overflow-hidden">
            <div className="grid gap-3 p-3 md:grid-cols-[1.6fr_0.8fr]">
              <div className="overflow-hidden rounded-[24px] bg-slate-100 dark:bg-slate-900/60">
                {primaryImage ? (
                  <img src={primaryImage} alt={listing.title} className="h-full min-h-[260px] w-full object-cover" />
                ) : (
                  <div className="flex min-h-[260px] items-center justify-center text-slate-400 dark:text-slate-600">
                    No image available
                  </div>
                )}
              </div>
              <div className="grid gap-3">
                {(selectedUnit?.images || []).slice(1, 4).map((image, index) => (
                  <div key={index} className="overflow-hidden rounded-[20px] bg-slate-100 dark:bg-slate-900/60">
                    <img src={image.url} alt={`${listing.title} ${index + 2}`} className="h-24 w-full object-cover md:h-full" />
                  </div>
                ))}
                {(selectedUnit?.images?.length || 0) <= 1 ? (
                  <div className="app-panel-soft flex items-center justify-center p-4 text-sm text-slate-500 dark:text-slate-400">
                    Add more photos to make this stay shine.
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="app-panel p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">About this stay</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">{listing.description}</p>
          </section>

          {selectedUnit?.amenities?.length > 0 ? (
            <section className="app-panel p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Amenities</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {selectedUnit.amenities.map((amenity, index) => (
                  <div key={index} className="app-panel-soft flex items-center gap-3 p-3 text-sm text-slate-700 dark:text-slate-300">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-300">+</span>
                    {amenity}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="app-panel p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Reviews</h2>
            <div className="mt-6 space-y-6">
              <ReviewsList listingId={listing._id} />
            </div>
            <div className="mt-8">
              {reviewStatus === 'loading' ? (
                <InlineNotice tone="info">Checking whether you can review this stay...</InlineNotice>
              ) : canReview ? (
                <ReviewForm listingId={listing._id} />
              ) : (
                <InlineNotice tone="info">{reviewMessage}</InlineNotice>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="app-panel p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Book this space</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Under 24 hours uses the hourly rate. Longer stays are billed by full days.
            </p>

            {units.length === 0 ? (
              <p className="mt-4 text-sm text-amber-700 dark:text-amber-300">This listing has no units available to book yet.</p>
            ) : (
              <form onSubmit={onBook} className="mt-6 space-y-4">
                {units.length > 1 ? (
                  <div>
                    <label htmlFor="unit" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Unit
                    </label>
                    <select
                      id="unit"
                      value={unitId}
                      onChange={(event) => setUnitId(event.target.value)}
                      className="app-input mt-1.5"
                    >
                      {units.map((unit) => (
                        <option key={unit._id} value={unit._id}>
                          {unit.unitType?.replace('_', ' ') ?? 'Unit'} · {formatMoney(unit.pricePerDay)}/day · cap {unit.capacity} · qty {unit.quantity ?? 1}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Start date</label>
                    <input id="startDate" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="app-input mt-1.5" required />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 dark:text-slate-200">End date</label>
                    <input id="endDate" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="app-input mt-1.5" required />
                  </div>
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Start time</label>
                    <input id="startTime" type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} className="app-input mt-1.5" required />
                  </div>
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-slate-700 dark:text-slate-200">End time</label>
                    <input id="endTime" type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} className="app-input mt-1.5" required />
                  </div>
                </div>

                <div className="app-panel-soft p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Estimated total</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{formatMoney(totalPrice)}</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {totalHours != null ? `${totalHours} hours selected` : 'Choose a valid date/time range'}
                  </p>
                </div>

                {conflict ? <InlineNotice tone="warning">This unit is already booked for part of your selected time.</InlineNotice> : null}
                {bookingError ? <InlineNotice tone="error">{bookingError}</InlineNotice> : null}
                {bookingSuccess ? <InlineNotice tone="success">Booking confirmed. You can find it in your trips.</InlineNotice> : null}

                <button type="submit" disabled={submitting || units.length === 0} className="app-button-primary w-full">
                  {submitting ? 'Booking...' : 'Book now'}
                </button>
              </form>
            )}
          </section>

          {listing.googleMapsUrl ? (
            <section className="app-panel p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Location</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Open the shared map link to view the exact area for this stay.
              </p>
              <a href={listing.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="app-button-secondary mt-4">
                Open in Google Maps
              </a>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
