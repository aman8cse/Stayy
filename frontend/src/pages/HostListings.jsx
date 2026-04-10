import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getHostListings, deleteListing } from '../api/listings.js';
import { getStoredToken } from '../lib/authStorage.js';

function formatMoney(n) {
  if (n == null || Number.isNaN(n)) return '—';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

function ListingCard({ listing, onDelete }) {
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const minPrice = listing.units?.[0]?.pricePerDay ?? null;

  async function handleDelete() {
    const token = getStoredToken();
    if (!token) return;

    setDeleting(true);
    try {
      await deleteListing(listing._id, token);
      onDelete(listing._id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete listing');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="app-panel p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{listing.title}</h2>
            <span className="app-chip">{listing.isVerified ? 'Verified' : 'Pending review'}</span>
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {listing.city}, {listing.state}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {listing.description?.substring(0, 120)}...
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="app-chip">{listing.units?.length ?? 0} units</span>
            {minPrice ? <span className="app-chip">From {formatMoney(minPrice)}/day</span> : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to={`/host/listings/${listing._id}/edit`} className="app-button-secondary">
            Edit
          </Link>
          <button onClick={() => setShowDelete((open) => !open)} className="rounded-2xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/30">
            Delete
          </button>
        </div>
      </div>

      {showDelete && (
        <div className="mt-4 rounded-3xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/30">
          <p className="font-medium text-red-800 dark:text-red-300">Delete this listing?</p>
          <p className="mt-1 text-sm text-red-700 dark:text-red-400">This action cannot be undone.</p>
          <div className="mt-4 flex gap-2">
            <button onClick={handleDelete} disabled={deleting} className="app-button-primary">
              {deleting ? 'Deleting...' : 'Confirm delete'}
            </button>
            <button onClick={() => setShowDelete(false)} className="app-button-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HostListings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
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
        const data = await getHostListings(token);
        setListings(data.listings || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load listings');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  return (
    <div className="app-page space-y-6">
      <section className="app-panel p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Host mode</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Your listings</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Manage inventory, pricing, and the details guests see before they book.
            </p>
          </div>
          <Link to="/listings/new" className="app-button-primary">
            Create listing
          </Link>
        </div>
      </section>

      {loading ? (
        <div className="app-panel p-8 text-center text-slate-600 dark:text-slate-300">Loading listings...</div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : listings.length === 0 ? (
        <div className="app-panel p-10 text-center">
          <p className="text-lg font-medium text-slate-900 dark:text-white">You haven&apos;t created any listings yet</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Start by publishing your first stay.</p>
          <Link to="/listings/new" className="app-button-primary mt-6">
            Create your first listing
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {listings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} onDelete={(id) => setListings((items) => items.filter((item) => item._id !== id))} />
          ))}
        </div>
      )}
    </div>
  );
}
