import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchListings } from '../api/listings.js';

const LIMIT = 12;

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

function formatMoney(n) {
  if (n == null || Number.isNaN(n)) return '—';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

function minDailyPrice(units) {
  if (!Array.isArray(units) || units.length === 0) return null;
  const nums = units.map((u) => u.pricePerDay).filter((n) => typeof n === 'number');
  if (!nums.length) return null;
  return Math.min(...nums);
}

function Stars({ value }) {
  const filled = Math.min(5, Math.max(0, Math.round(Number(value))));
  return (
    <span className="text-sm tracking-tight">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < filled ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'} aria-hidden>
          ★
        </span>
      ))}
    </span>
  );
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
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const queryParams = useMemo(
    () => ({
      city: city || undefined,
      minPrice: optionalNumber(minPrice),
      maxPrice: optionalNumber(maxPrice),
      page,
      limit: LIMIT,
    }),
    [city, minPrice, maxPrice, page]
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
  }, [city, minPrice, maxPrice]);

  const listings = data?.listings ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const currentPage = data?.page ?? page;

  return (
    <div className="app-page space-y-6">
      <section className="app-panel overflow-hidden p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.95fr] lg:items-end">
          <div>
            <span className="app-chip">Mobile-first stays</span>
            <h1 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Book a cleaner short-stay experience.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
              Discover verified spaces, compare day rates, and manage your trips like an app instead of a directory.
            </p>
          </div>

          <div className="app-panel-soft p-4 sm:p-5">
            <div className="grid gap-3">
              <div>
                <label htmlFor="city" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Destination
                </label>
                <input
                  id="city"
                  type="search"
                  placeholder="Search city"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  className="app-input"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="minPrice" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Min rate
                  </label>
                  <input
                    id="minPrice"
                    inputMode="decimal"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="app-input"
                  />
                </div>
                <div>
                  <label htmlFor="maxPrice" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Max rate
                  </label>
                  <input
                    id="maxPrice"
                    inputMode="decimal"
                    placeholder="No limit"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="app-input"
                  />
                </div>
              </div>

              <button type="button" onClick={() => load()} className="app-button-primary w-full">
                Refresh results
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="app-panel-soft p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Results</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{loading ? '...' : total}</p>
        </div>
        <div className="app-panel-soft p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Location</p>
          <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{city || 'All cities'}</p>
        </div>
        <div className="app-panel-soft p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Budget</p>
          <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
            {minPrice || maxPrice ? `${minPrice || '0'} - ${maxPrice || '∞'}` : 'Flexible'}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Explore stays</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {loading ? 'Loading listings...' : `${total} places ready to browse`}
            </h2>
          </div>
          <button type="button" onClick={() => load()} className="app-button-secondary">
            Refresh
          </button>
        </div>

        {error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300" role="alert">
            {error}
          </div>
        ) : null}

        {!loading && !error && listings.length === 0 ? (
          <div className="app-panel p-10 text-center">
            <p className="text-lg font-medium text-slate-900 dark:text-white">No listings match your filters</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try another city or widen your price range.</p>
          </div>
        ) : null}

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => {
            const price = minDailyPrice(listing.units);
            const rating = listing.averageRating;
            const verified = listing.isVerified;

            return (
              <li key={listing._id}>
                <Link
                  to={`/listings/${listing._id}`}
                  className="group app-panel flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
                >
                  <article className="flex h-full flex-col">
                    <div className="relative aspect-[5/4] bg-gradient-to-br from-teal-400/20 via-cyan-300/10 to-slate-200 dark:from-teal-500/20 dark:via-slate-900 dark:to-slate-800">
                      <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-slate-600">
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
                        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-teal-700 shadow-sm ring-1 ring-teal-600/10 dark:bg-slate-950/85 dark:text-teal-300">
                          Verified listing
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <div>
                        <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-slate-900 dark:text-white">
                          {listing.title}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{listing.city}</p>
                      </div>

                      <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">From / day</p>
                          <p className="text-lg font-semibold text-slate-900 dark:text-white">{formatMoney(price)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">Rating</p>
                          {rating != null ? (
                            <div className="flex flex-col items-end gap-0.5">
                              <Stars value={rating} />
                              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{rating.toFixed(1)}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400 dark:text-slate-500">No reviews yet</span>
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
          <nav className="mt-8 flex flex-wrap items-center justify-center gap-3" aria-label="Pagination">
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="app-button-secondary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Page <span className="font-semibold text-slate-900 dark:text-white">{currentPage}</span> of{' '}
              <span className="font-semibold text-slate-900 dark:text-white">{totalPages}</span>
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="app-button-secondary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </nav>
        ) : null}
      </section>
    </div>
  );
}
