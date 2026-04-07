import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getHostListings, updateListing, deleteListing } from '../api/listings.js';
import { getStoredToken } from '../lib/authStorage.js';

function formatMoney(n) {
  if (n == null || Number.isNaN(n)) return '—';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

function ListingCard({ listing, onDelete, onEdit }) {
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const minPrice = listing.units?.[0]?.pricePerDay ?? null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900">{listing.title}</h3>
          <p className="text-sm text-slate-600 mt-1">
            {listing.city}, {listing.state}
          </p>
          <p className="text-sm text-slate-600 mt-2">{listing.description?.substring(0, 100)}...</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <span className="inline-block px-2.5 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700">
              {listing.units?.length ?? 0} units
            </span>
            {minPrice && (
              <span className="inline-block px-2.5 py-1 rounded text-xs font-medium bg-brand-50 text-brand-700">
                From {formatMoney(minPrice)}/day
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/host/listings/${listing._id}/edit`}
            className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition"
          >
            Edit
          </Link>
          <button
            onClick={() => setShowDelete(!showDelete)}
            className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition"
          >
            Delete
          </button>
        </div>
      </div>
      {showDelete && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-900 font-medium">Delete this listing?</p>
          <p className="text-xs text-red-700 mt-1">This action cannot be undone.</p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition"
            >
              {deleting ? 'Deleting...' : 'Confirm delete'}
            </button>
            <button
              onClick={() => setShowDelete(false)}
              className="px-3 py-2 rounded-lg bg-slate-200 text-slate-900 text-sm font-medium hover:bg-slate-300 transition"
            >
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Your listings</h1>
            <p className="mt-1 text-slate-600">Manage your spaces and units</p>
          </div>
          <Link
            to="/listings/new"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition"
          >
            Create listing
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {listings.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-600 mb-4">You haven't created any listings yet</p>
            <Link
              to="/listings/new"
              className="inline-block rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700 transition"
            >
              Create your first listing
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {listings.map((listing) => (
              <ListingCard
                key={listing._id}
                listing={listing}
                onDelete={(id) => setListings(listings.filter((l) => l._id !== id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
