import { useState, useEffect } from 'react';
import * as adminApi from '../api/admin.js';

const PAGE_SIZE = 10;

function tabClass(active) {
  return [
    'rounded-full px-4 py-2 text-sm font-medium transition',
    active
      ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25'
      : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white',
  ].join(' ');
}

function pagerButton(disabled) {
  return `app-button-secondary ${disabled ? 'cursor-not-allowed opacity-40' : ''}`;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('hosts');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [hosts, setHosts] = useState([]);
  const [hostSearch, setHostSearch] = useState('');
  const [hostFilter, setHostFilter] = useState('unverified');
  const [hostPage, setHostPage] = useState(1);
  const [hostTotalPages, setHostTotalPages] = useState(0);
  const [verifyingHostId, setVerifyingHostId] = useState(null);

  const [listings, setListings] = useState([]);
  const [listingSearch, setListingSearch] = useState('');
  const [listingFilter, setListingFilter] = useState('unverified');
  const [listingPage, setListingPage] = useState(1);
  const [listingTotalPages, setListingTotalPages] = useState(0);
  const [removingListingId, setRemovingListingId] = useState(null);
  const [verifyingListingId, setVerifyingListingId] = useState(null);

  useEffect(() => {
    if (activeTab === 'hosts') loadHosts();
  }, [activeTab, hostSearch, hostFilter, hostPage]);

  useEffect(() => {
    if (activeTab === 'listings') loadListings();
  }, [activeTab, listingSearch, listingFilter, listingPage]);

  async function loadHosts() {
    setLoading(true);
    setError('');
    try {
      const isVerifiedFilter = hostFilter === 'all' ? null : hostFilter === 'verified';
      const result = await adminApi.getHosts(hostSearch, isVerifiedFilter, hostPage, PAGE_SIZE);
      setHosts(result.hosts || []);
      setHostTotalPages(result.totalPages || 0);
    } catch (err) {
      setError(err.message || 'Failed to load hosts');
    } finally {
      setLoading(false);
    }
  }

  async function loadListings() {
    setLoading(true);
    setError('');
    try {
      const isVerifiedFilter = listingFilter === 'all' ? null : listingFilter === 'verified';
      const result = await adminApi.getListings(listingSearch, isVerifiedFilter, listingPage, PAGE_SIZE);
      setListings(result.listings || []);
      setListingTotalPages(result.totalPages || 0);
    } catch (err) {
      setError(err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyHost(id) {
    if (!window.confirm('Verify this host?')) return;
    setVerifyingHostId(id);
    setError('');
    setSuccess('');
    try {
      await adminApi.verifyHost(id);
      setSuccess('Host verified successfully');
      await loadHosts();
    } catch (err) {
      setError(err.message || 'Failed to verify host');
    } finally {
      setVerifyingHostId(null);
    }
  }

  async function handleRemoveListing(id) {
    if (!window.confirm('Remove this listing? This cannot be undone.')) return;
    setRemovingListingId(id);
    setError('');
    setSuccess('');
    try {
      await adminApi.removeListingByAdmin(id);
      setSuccess('Listing removed successfully');
      await loadListings();
    } catch (err) {
      setError(err.message || 'Failed to remove listing');
    } finally {
      setRemovingListingId(null);
    }
  }

  async function handleVerifyListing(id) {
    if (!window.confirm('Verify this listing?')) return;
    setVerifyingListingId(id);
    setError('');
    setSuccess('');
    try {
      await adminApi.verifyListing(id);
      setSuccess('Listing verified successfully');
      await loadListings();
    } catch (err) {
      setError(err.message || 'Failed to verify listing');
    } finally {
      setVerifyingListingId(null);
    }
  }

  return (
    <div className="app-page space-y-6">
      <section className="app-panel p-6 sm:p-8">
        <p className="text-sm text-slate-500 dark:text-slate-400">Admin tools</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Admin dashboard</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Review hosts, verify listings, and keep the marketplace clean and trustworthy.
        </p>
      </section>

      <section className="flex flex-wrap gap-2">
        <button onClick={() => { setActiveTab('hosts'); setError(''); setSuccess(''); }} className={tabClass(activeTab === 'hosts')}>
          Manage hosts
        </button>
        <button onClick={() => { setActiveTab('listings'); setError(''); setSuccess(''); }} className={tabClass(activeTab === 'listings')}>
          Manage listings
        </button>
      </section>

      {error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
          {success}
        </div>
      ) : null}

      {activeTab === 'hosts' ? (
        <section className="app-panel p-6">
          <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
            <input
              type="text"
              value={hostSearch}
              onChange={(e) => { setHostSearch(e.target.value); setHostPage(1); }}
              placeholder="Search by host name or email..."
              className="app-input"
            />
            <select
              value={hostFilter}
              onChange={(e) => { setHostFilter(e.target.value); setHostPage(1); }}
              className="app-input"
            >
              <option value="unverified">Unverified</option>
              <option value="verified">Verified</option>
              <option value="all">All hosts</option>
            </select>
          </div>

          <div className="mt-6 space-y-3">
            {loading ? (
              <div className="text-center text-slate-600 dark:text-slate-300">Loading hosts...</div>
            ) : hosts.length === 0 ? (
              <div className="text-center text-slate-500 dark:text-slate-400">No hosts found</div>
            ) : hosts.map((host) => (
              <div key={host.id} className="app-panel-soft flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-medium text-slate-900 dark:text-white">{host.name}</h2>
                    {host.isVerified ? <span className="app-chip">Verified</span> : <span className="app-chip">Pending</span>}
                  </div>
                  <p className="mt-2 truncate text-sm text-slate-500 dark:text-slate-400">{host.email}</p>
                  <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{host.phone}</p>
                </div>

                {!host.isVerified ? (
                  <button onClick={() => handleVerifyHost(host.id)} disabled={verifyingHostId === host.id} className="app-button-primary">
                    {verifyingHostId === host.id ? 'Verifying...' : 'Verify host'}
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          {hostTotalPages > 1 ? (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button onClick={() => setHostPage((p) => Math.max(1, p - 1))} disabled={hostPage === 1 || loading} className={pagerButton(hostPage === 1 || loading)}>
                Previous
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-400">Page {hostPage} of {hostTotalPages}</span>
              <button onClick={() => setHostPage((p) => Math.min(hostTotalPages, p + 1))} disabled={hostPage === hostTotalPages || loading} className={pagerButton(hostPage === hostTotalPages || loading)}>
                Next
              </button>
            </div>
          ) : null}
        </section>
      ) : (
        <section className="app-panel p-6">
          <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
            <input
              type="text"
              value={listingSearch}
              onChange={(e) => { setListingSearch(e.target.value); setListingPage(1); }}
              placeholder="Search by listing title or city..."
              className="app-input"
            />
            <select
              value={listingFilter}
              onChange={(e) => { setListingFilter(e.target.value); setListingPage(1); }}
              className="app-input"
            >
              <option value="unverified">Unverified</option>
              <option value="verified">Verified</option>
              <option value="all">All listings</option>
            </select>
          </div>

          <div className="mt-6 space-y-3">
            {loading ? (
              <div className="text-center text-slate-600 dark:text-slate-300">Loading listings...</div>
            ) : listings.length === 0 ? (
              <div className="text-center text-slate-500 dark:text-slate-400">No listings found</div>
            ) : listings.map((listing) => (
              <div key={listing.id} className="app-panel-soft flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-medium text-slate-900 dark:text-white">{listing.title}</h2>
                    {listing.isVerified ? <span className="app-chip">Verified</span> : <span className="app-chip">Pending</span>}
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{listing.city}, {listing.state}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Host: {listing.host?.name || 'Unknown'}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!listing.isVerified ? (
                    <button onClick={() => handleVerifyListing(listing.id)} disabled={verifyingListingId === listing.id} className="app-button-primary">
                      {verifyingListingId === listing.id ? 'Verifying...' : 'Verify'}
                    </button>
                  ) : null}
                  <button onClick={() => handleRemoveListing(listing.id)} disabled={removingListingId === listing.id} className="rounded-2xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/30">
                    {removingListingId === listing.id ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {listingTotalPages > 1 ? (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button onClick={() => setListingPage((p) => Math.max(1, p - 1))} disabled={listingPage === 1 || loading} className={pagerButton(listingPage === 1 || loading)}>
                Previous
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-400">Page {listingPage} of {listingTotalPages}</span>
              <button onClick={() => setListingPage((p) => Math.min(listingTotalPages, p + 1))} disabled={listingPage === listingTotalPages || loading} className={pagerButton(listingPage === listingTotalPages || loading)}>
                Next
              </button>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}
