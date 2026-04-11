import { useCallback, useEffect, useState } from 'react';
import * as adminApi from '../api/admin.js';
import InlineNotice from '../components/InlineNotice.jsx';

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

function summaryCard(label, value, helper) {
  return (
    <div className="app-panel-soft p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{helper}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('hosts');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [hosts, setHosts] = useState([]);
  const [hostSummary, setHostSummary] = useState({ total: 0, verified: 0, unverified: 0 });
  const [hostSearch, setHostSearch] = useState('');
  const [hostFilter, setHostFilter] = useState('unverified');
  const [hostPage, setHostPage] = useState(1);
  const [hostTotalPages, setHostTotalPages] = useState(0);
  const [verifyingHostId, setVerifyingHostId] = useState(null);

  const [listings, setListings] = useState([]);
  const [listingSummary, setListingSummary] = useState({ total: 0, verified: 0, unverified: 0 });
  const [listingSearch, setListingSearch] = useState('');
  const [listingFilter, setListingFilter] = useState('unverified');
  const [listingPage, setListingPage] = useState(1);
  const [listingTotalPages, setListingTotalPages] = useState(0);
  const [removingListingId, setRemovingListingId] = useState(null);
  const [verifyingListingId, setVerifyingListingId] = useState(null);

  const loadHosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const isVerifiedFilter = hostFilter === 'all' ? null : hostFilter === 'verified';
      const result = await adminApi.getHosts(hostSearch, isVerifiedFilter, hostPage, PAGE_SIZE);
      setHosts(result.hosts || []);
      setHostSummary(result.summary || { total: 0, verified: 0, unverified: 0 });
      setHostTotalPages(result.totalPages || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hosts');
    } finally {
      setLoading(false);
    }
  }, [hostFilter, hostPage, hostSearch]);

  const loadListings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const isVerifiedFilter = listingFilter === 'all' ? null : listingFilter === 'verified';
      const result = await adminApi.getListings(listingSearch, isVerifiedFilter, listingPage, PAGE_SIZE);
      setListings(result.listings || []);
      setListingSummary(result.summary || { total: 0, verified: 0, unverified: 0 });
      setListingTotalPages(result.totalPages || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [listingFilter, listingPage, listingSearch]);

  useEffect(() => {
    if (activeTab === 'hosts') {
      loadHosts();
    }
  }, [activeTab, loadHosts]);

  useEffect(() => {
    if (activeTab === 'listings') {
      loadListings();
    }
  }, [activeTab, loadListings]);

  async function handleVerifyHost(id) {
    if (!window.confirm('Verify this host?')) return;
    setVerifyingHostId(id);
    setError('');
    setSuccess('');
    try {
      await adminApi.verifyHost(id);
      setSuccess('Host verified successfully.');
      await loadHosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify host');
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
      setSuccess('Listing removed successfully.');
      await loadListings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove listing');
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
      setSuccess('Listing verified successfully.');
      await loadListings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify listing');
    } finally {
      setVerifyingListingId(null);
    }
  }

  const showingHosts = activeTab === 'hosts';
  const pendingItems = showingHosts ? hostSummary.unverified : listingSummary.unverified;
  const currentPage = showingHosts ? hostPage : listingPage;
  const totalPages = showingHosts ? hostTotalPages : listingTotalPages;

  return (
    <div className="app-page space-y-6">
      <section className="app-panel p-6 sm:p-8">
        <p className="text-sm text-slate-500 dark:text-slate-400">Admin tools</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Admin dashboard</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Work through host and listing approvals with clearer queues, search, and moderation actions.
        </p>
      </section>

      <section className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => { setActiveTab('hosts'); setError(''); setSuccess(''); }}
          className={tabClass(showingHosts)}
        >
          Host queue
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('listings'); setError(''); setSuccess(''); }}
          className={tabClass(!showingHosts)}
        >
          Listing queue
        </button>
      </section>

      {showingHosts ? (
        <section className="grid gap-3 sm:grid-cols-3">
          {summaryCard('Hosts', hostSummary.total, 'Total host accounts')}
          {summaryCard('Verified', hostSummary.verified, 'Approved and active')}
          {summaryCard('Pending', hostSummary.unverified, 'Needs moderation review')}
        </section>
      ) : (
        <section className="grid gap-3 sm:grid-cols-3">
          {summaryCard('Listings', listingSummary.total, 'All submitted listings')}
          {summaryCard('Verified', listingSummary.verified, 'Approved for guests')}
          {summaryCard('Pending', listingSummary.unverified, 'Awaiting moderation')}
        </section>
      )}

      <section className="app-panel p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Current queue</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
              {showingHosts ? 'Host verification queue' : 'Listing moderation queue'}
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {pendingItems > 0
                ? `${pendingItems} pending ${showingHosts ? 'hosts' : 'listings'} still need review.`
                : `Everything in the ${showingHosts ? 'host' : 'listing'} queue is currently caught up.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                if (showingHosts) {
                  setHostFilter('unverified');
                  setHostPage(1);
                } else {
                  setListingFilter('unverified');
                  setListingPage(1);
                }
              }}
              className="app-button-secondary"
            >
              Show pending first
            </button>
            <button
              type="button"
              onClick={() => {
                if (showingHosts) {
                  loadHosts();
                } else {
                  loadListings();
                }
              }}
              className="app-button-secondary"
            >
              Refresh queue
            </button>
          </div>
        </div>
      </section>

      {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}
      {success ? <InlineNotice tone="success">{success}</InlineNotice> : null}

      {showingHosts ? (
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
              <InlineNotice tone="info">No hosts match the current search and filter.</InlineNotice>
            ) : hosts.map((host) => (
              <div key={host.id} className="app-panel-soft flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-medium text-slate-900 dark:text-white">{host.name}</h2>
                    <span className="app-chip">{host.isVerified ? 'Verified' : 'Pending review'}</span>
                  </div>
                  <p className="mt-2 truncate text-sm text-slate-500 dark:text-slate-400">{host.email}</p>
                  <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{host.phone || 'No phone shared'}</p>
                </div>

                {!host.isVerified ? (
                  <button
                    type="button"
                    onClick={() => handleVerifyHost(host.id)}
                    disabled={verifyingHostId === host.id}
                    className="app-button-primary"
                  >
                    {verifyingHostId === host.id ? 'Verifying...' : 'Verify host'}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
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
              <InlineNotice tone="info">No listings match the current search and filter.</InlineNotice>
            ) : listings.map((listing) => (
              <div key={listing.id} className="app-panel-soft flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-medium text-slate-900 dark:text-white">{listing.title}</h2>
                    <span className="app-chip">{listing.isVerified ? 'Verified' : 'Pending review'}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {[listing.city, listing.state, listing.country].filter(Boolean).join(', ')}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Host: {listing.host?.name || 'Unknown'}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!listing.isVerified ? (
                    <button
                      type="button"
                      onClick={() => handleVerifyListing(listing.id)}
                      disabled={verifyingListingId === listing.id}
                      className="app-button-primary"
                    >
                      {verifyingListingId === listing.id ? 'Verifying...' : 'Verify'}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleRemoveListing(listing.id)}
                    disabled={removingListingId === listing.id}
                    className="rounded-2xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    {removingListingId === listing.id ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (showingHosts) {
                setHostPage((page) => Math.max(1, page - 1));
              } else {
                setListingPage((page) => Math.max(1, page - 1));
              }
            }}
            disabled={currentPage === 1 || loading}
            className={pagerButton(currentPage === 1 || loading)}
          >
            Previous
          </button>
          <span className="text-sm text-slate-600 dark:text-slate-400">Page {currentPage} of {totalPages}</span>
          <button
            type="button"
            onClick={() => {
              if (showingHosts) {
                setHostPage((page) => Math.min(totalPages, page + 1));
              } else {
                setListingPage((page) => Math.min(totalPages, page + 1));
              }
            }}
            disabled={currentPage === totalPages || loading}
            className={pagerButton(currentPage === totalPages || loading)}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
