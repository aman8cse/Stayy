import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchListings } from '../api/listings.js';

const LIMIT = 12;

const PURPOSE_OPTIONS = [
  { value: '', label: 'Any purpose' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'study', label: 'Study' },
  { value: 'freshen_up', label: 'Freshen up' },
];

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

function minHourlyPrice(units) {
  if (!Array.isArray(units) || units.length === 0) return null;
  const nums = units.map((u) => u.pricePerHour).filter((n) => typeof n === 'number');
  if (!nums.length) return null;
  return Math.min(...nums);
}

function formatMoney(n) {
  if (n == null || Number.isNaN(n)) return '—';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function Stars({ value }) {
  const filled = Math.min(5, Math.max(0, Math.round(Number(value))));
  const items = [];
  for (let i = 0; i < 5; i += 1) {
    items.push(
      <span key={i} className={i < filled ? 'text-amber-400' : 'text-slate-200'} aria-hidden>
        ★
      </span>
    );
  }
  return <span className="text-sm tracking-tight">{items}</span>;
}

function optionalNumber(value) {
  if (value === '' || value == null) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export default function Home() {
  const [cityInput, setCityInput] = useState('');
  const city = useDebouncedValue(cityInput.trim(), 400);

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [roomPurpose, setRoomPurpose] = useState('');
  const [page, setPage] = useState(1);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const queryParams = useMemo(
    () => ({
      city: city || undefined,
      minPrice: optionalNumber(minPrice),
      maxPrice: optionalNumber(maxPrice),
      roomPurpose: roomPurpose || undefined,
      page,
      limit: LIMIT,
    }),
    [city, minPrice, maxPrice, roomPurpose, page]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await fetchListings(queryParams);
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [city, minPrice, maxPrice, roomPurpose]);

  const listings = data?.listings ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const currentPage = data?.page ?? page;

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Find a room for a few hours or days
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Search by city, tune price and purpose, and browse verified local hosts.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_minmax(0,2fr)] lg:items-end">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-slate-700">
                City
              </label>
              <input
                id="city"
                type="search"
                placeholder="e.g. Austin, Brooklyn…"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none ring-brand-500/30 transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="minPrice" className="block text-sm font-medium text-slate-700">
                  Min $/hr
                </label>
                <input
                  id="minPrice"
                  inputMode="decimal"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none ring-brand-500/30 focus:border-brand-500 focus:ring-4"
                />
              </div>
              <div>
                <label htmlFor="maxPrice" className="block text-sm font-medium text-slate-700">
                  Max $/hr
                </label>
                <input
                  id="maxPrice"
                  inputMode="decimal"
                  placeholder="Any"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none ring-brand-500/30 focus:border-brand-500 focus:ring-4"
                />
              </div>
              <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-slate-700">
                  Room purpose
                </label>
                <select
                  id="purpose"
                  value={roomPurpose}
                  onChange={(e) => setRoomPurpose(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none ring-brand-500/30 focus:border-brand-500 focus:ring-4"
                >
                  {PURPOSE_OPTIONS.map((o) => (
                    <option key={o.value || 'any'} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            {loading ? (
              <span>Loading listings…</span>
            ) : (
              <span>
                <span className="font-semibold text-slate-900">{total}</span> result
                {total === 1 ? '' : 's'}
                {city ? (
                  <>
                    {' '}
                    for “<span className="font-medium text-slate-800">{city}</span>”
                  </>
                ) : null}
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={() => load()}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {error ? (
          <div
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        {!loading && !error && listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
            <p className="text-lg font-medium text-slate-800">No listings match your filters</p>
            <p className="mt-2 text-sm text-slate-500">Try another city or widen your price range.</p>
          </div>
        ) : null}

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => {
            const price = minHourlyPrice(listing.units);
            const rating = listing.averageRating;
            const verified = listing.isVerified;
            return (
              <li key={listing._id}>
                <Link
                  to={`/listings/${listing._id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/5 transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                <article className="flex h-full flex-col">
                  <div className="relative aspect-[5/3] bg-gradient-to-br from-brand-100 via-white to-slate-100">
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                      <svg className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.25}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                    </div>
                    {verified ? (
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-xs font-semibold text-brand-700 shadow-sm ring-1 ring-brand-600/10">
                        Verified listing
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <div>
                      <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-slate-900">
                        {listing.title}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">{listing.city}</p>
                    </div>
                    <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          From / hour
                        </p>
                        <p className="text-lg font-semibold text-slate-900">{formatMoney(price)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Rating
                        </p>
                        {rating != null ? (
                          <div className="flex flex-col items-end gap-0.5">
                            <Stars value={rating} />
                            <span className="text-sm font-semibold text-slate-800">{rating.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">No reviews yet</span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
                </Link>
              </li>
            );
          })}
        </ul>

        {totalPages > 1 ? (
          <nav
            className="mt-12 flex flex-wrap items-center justify-center gap-2"
            aria-label="Pagination"
          >
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-3 text-sm text-slate-600">
              Page <span className="font-semibold text-slate-900">{currentPage}</span> of{' '}
              <span className="font-semibold text-slate-900">{totalPages}</span>
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </nav>
        ) : null}
      </main>

      <footer className="border-t border-slate-200/80 bg-white py-8 text-center text-xs text-slate-500">
        Stayy — short stays for students & travelers
      </footer>
    </div>
  );
}
