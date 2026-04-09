import { useState, useEffect } from 'react';
import { useTheme } from '../lib/theme.jsx';
import * as adminApi from '../api/admin.js';

export default function AdminDashboard() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('hosts');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Hosts Tab
  const [hosts, setHosts] = useState([]);
  const [hostSearch, setHostSearch] = useState('');
  const [hostFilter, setHostFilter] = useState('unverified');
  const [hostPage, setHostPage] = useState(1);
  const [hostTotal, setHostTotal] = useState(0);
  const [hostTotalPages, setHostTotalPages] = useState(0);
  const [verifyingHostId, setVerifyingHostId] = useState(null);

  // Listings Tab
  const [listings, setListings] = useState([]);
  const [listingSearch, setListingSearch] = useState('');
  const [listingFilter, setListingFilter] = useState('unverified');
  const [listingPage, setListingPage] = useState(1);
  const [listingTotal, setListingTotal] = useState(0);
  const [listingTotalPages, setListingTotalPages] = useState(0);
  const [removingListingId, setRemovingListingId] = useState(null);
  const [verifyingListingId, setVerifyingListingId] = useState(null);

  // Load hosts on tab change or search/filter/page change
  useEffect(() => {
    if (activeTab === 'hosts') {
      loadHosts();
    }
  }, [activeTab, hostSearch, hostFilter, hostPage]);

  // Load listings on tab change or search/filter/page change
  useEffect(() => {
    if (activeTab === 'listings') {
      loadListings();
    }
  }, [activeTab, listingSearch, listingFilter, listingPage]);

  const loadHosts = async () => {
    setLoading(true);
    setError('');

    try {
      const isVerifiedFilter = hostFilter === 'all' ? null : hostFilter === 'verified';
      const result = await adminApi.getHosts(hostSearch, isVerifiedFilter, hostPage, 10);
      
      setHosts(result.hosts || []);
      setHostTotal(result.total || 0);
      setHostTotalPages(result.totalPages || 0);
    } catch (err) {
      setError(err.message || 'Failed to load hosts');
    } finally {
      setLoading(false);
    }
  };

  const loadListings = async () => {
    setLoading(true);
    setError('');

    try {
      const isVerifiedFilter = listingFilter === 'all' ? null : listingFilter === 'verified';
      const result = await adminApi.getListings(listingSearch, isVerifiedFilter, listingPage, 10);
      
      setListings(result.listings || []);
      setListingTotal(result.total || 0);
      setListingTotalPages(result.totalPages || 0);
    } catch (err) {
      setError(err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyHostFromList = async (id) => {
    if (!window.confirm('Verify this host?')) return;

    setVerifyingHostId(id);
    setError('');
    setSuccess('');

    try {
      await adminApi.verifyHost(id);
      setSuccess(`Host verified successfully`);
      await loadHosts();
    } catch (err) {
      setError(err.message || 'Failed to verify host');
    } finally {
      setVerifyingHostId(null);
    }
  };

  const handleRemoveListingFromList = async (id) => {
    if (!window.confirm('Are you sure you want to remove this listing? This action cannot be undone.')) return;

    setRemovingListingId(id);
    setError('');
    setSuccess('');

    try {
      await adminApi.removeListingByAdmin(id);
      setSuccess(`Listing removed successfully`);
      await loadListings();
    } catch (err) {
      setError(err.message || 'Failed to remove listing');
    } finally {
      setRemovingListingId(null);
    }
  };

  const handleVerifyListingFromList = async (id) => {
    if (!window.confirm('Verify this listing?')) return;

    setVerifyingListingId(id);
    setError('');
    setSuccess('');

    try {
      await adminApi.verifyListing(id);
      setSuccess(`Listing verified successfully`);
      await loadListings();
    } catch (err) {
      setError(err.message || 'Failed to verify listing');
    } finally {
      setVerifyingListingId(null);
    }
  };

  const inputClass = `w-full rounded-lg border px-3 py-2 text-sm ${
    theme === 'dark'
      ? 'border-slate-600 bg-slate-700 text-white placeholder-slate-400'
      : 'border-slate-300 bg-white text-slate-900 placeholder-slate-500'
  }`;

  const buttonClass = `w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed`;

  const tabClass = (active) =>
    `px-4 py-2 text-sm font-medium rounded-t-lg transition ${
      active
        ? theme === 'dark'
          ? 'bg-slate-700 text-white border-b-2 border-brand-500'
          : 'bg-white text-slate-900 border-b-2 border-brand-600'
        : theme === 'dark'
          ? 'bg-slate-800 text-slate-300 hover:text-white'
          : 'bg-slate-100 text-slate-600 hover:text-slate-900'
    }`;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1
          className={`mb-8 text-3xl font-bold tracking-tight ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}
        >
          Admin Dashboard
        </h1>

        <div
          className={`rounded-lg border ${
            theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
          } overflow-hidden shadow-lg`}
        >
          {/* Tabs */}
          <div className={`border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} flex flex-wrap`}>
            <button
              onClick={() => {
                setActiveTab('hosts');
                setError('');
                setSuccess('');
              }}
              className={tabClass(activeTab === 'hosts')}
            >
              Manage Hosts
            </button>
            <button
              onClick={() => {
                setActiveTab('listings');
                setError('');
                setSuccess('');
              }}
              className={tabClass(activeTab === 'listings')}
            >
              Manage Listings
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
                {success}
              </div>
            )}

            {/* Manage Hosts Tab */}
            {activeTab === 'hosts' && (
              <div>
                <h2
                  className={`mb-4 text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Manage Hosts
                </h2>

                <div className="mb-6 space-y-4">
                  <div className="flex gap-4 flex-col sm:flex-row">
                    <input
                      type="text"
                      value={hostSearch}
                      onChange={(e) => {
                        setHostSearch(e.target.value);
                        setHostPage(1);
                      }}
                      placeholder="Search by name or email..."
                      className={inputClass}
                    />
                    <select
                      value={hostFilter}
                      onChange={(e) => {
                        setHostFilter(e.target.value);
                        setHostPage(1);
                      }}
                      className={`rounded-lg border px-3 py-2 text-sm ${
                        theme === 'dark'
                          ? 'border-slate-600 bg-slate-700 text-white'
                          : 'border-slate-300 bg-white text-slate-900'
                      }`}
                    >
                      <option value="unverified">Unverified</option>
                      <option value="verified">Verified</option>
                      <option value="all">All Hosts</option>
                    </select>
                  </div>
                </div>

                {loading && activeTab === 'hosts' ? (
                  <div className={`text-center py-8 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    Loading hosts...
                  </div>
                ) : hosts.length === 0 ? (
                  <div className={`text-center py-8 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    No hosts found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {hosts.map((host) => (
                      <div
                        key={host.id}
                        className={`rounded-lg border p-4 flex items-center justify-between ${
                          theme === 'dark'
                            ? 'border-slate-600 bg-slate-700'
                            : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-medium ${
                              theme === 'dark' ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            {host.name}
                          </h3>
                          <div className={`text-sm ${
                            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                          }`}>
                            <div className="truncate">{host.email}</div>
                            <div className="truncate">{host.phone}</div>
                          </div>
                          {host.isVerified && (
                            <span className={`inline-block mt-2 text-xs font-semibold px-2 py-1 rounded-full ${
                              theme === 'dark'
                                ? 'bg-green-900/50 text-green-400'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        {!host.isVerified && (
                          <button
                            onClick={() => handleVerifyHostFromList(host.id)}
                            disabled={verifyingHostId === host.id}
                            className={`ml-4 px-4 py-2 text-sm font-medium rounded-lg transition ${
                              theme === 'dark'
                                ? 'bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50'
                                : 'bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50'
                            }`}
                          >
                            {verifyingHostId === host.id ? 'Verifying...' : 'Verify'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {hostTotalPages > 1 && (
                  <div className="mt-6 flex gap-2 justify-center">
                    <button
                      onClick={() => setHostPage(p => Math.max(1, p - 1))}
                      disabled={hostPage === 1 || loading}
                      className={`px-3 py-2 rounded-lg text-sm ${
                        theme === 'dark'
                          ? 'bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50'
                          : 'bg-slate-200 text-slate-900 hover:bg-slate-300 disabled:opacity-50'
                      }`}
                    >
                      Previous
                    </button>
                    <div className={`px-4 py-2 text-sm ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      Page {hostPage} of {hostTotalPages}
                    </div>
                    <button
                      onClick={() => setHostPage(p => Math.min(hostTotalPages, p + 1))}
                      disabled={hostPage === hostTotalPages || loading}
                      className={`px-3 py-2 rounded-lg text-sm ${
                        theme === 'dark'
                          ? 'bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50'
                          : 'bg-slate-200 text-slate-900 hover:bg-slate-300 disabled:opacity-50'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Manage Listings Tab */}
            {activeTab === 'listings' && (
              <div>
                <h2
                  className={`mb-4 text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Manage Listings
                </h2>

                <div className="mb-6 space-y-4">
                  <div className="flex gap-4 flex-col sm:flex-row">
                    <input
                      type="text"
                      value={listingSearch}
                      onChange={(e) => {
                        setListingSearch(e.target.value);
                        setListingPage(1);
                      }}
                      placeholder="Search by title or city..."
                      className={inputClass}
                    />
                    <select
                      value={listingFilter}
                      onChange={(e) => {
                        setListingFilter(e.target.value);
                        setListingPage(1);
                      }}
                      className={`rounded-lg border px-3 py-2 text-sm ${
                        theme === 'dark'
                          ? 'border-slate-600 bg-slate-700 text-white'
                          : 'border-slate-300 bg-white text-slate-900'
                      }`}
                    >
                      <option value="unverified">Unverified</option>
                      <option value="verified">Verified</option>
                      <option value="all">All Listings</option>
                    </select>
                  </div>
                </div>

                {loading && activeTab === 'listings' ? (
                  <div className={`text-center py-8 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    Loading listings...
                  </div>
                ) : listings.length === 0 ? (
                  <div className={`text-center py-8 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    No listings found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {listings.map((listing) => (
                      <div
                        key={listing.id}
                        className={`rounded-lg border p-4 flex items-center justify-between ${
                          theme === 'dark'
                            ? 'border-slate-600 bg-slate-700'
                            : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-medium ${
                              theme === 'dark' ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            {listing.title}
                          </h3>
                          <div className={`text-sm ${
                            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                          }`}>
                            <div className="truncate">{listing.city}, {listing.state}</div>
                            <div className="truncate">Host: {listing.host?.name || 'Unknown'}</div>
                          </div>
                          {listing.isVerified && (
                            <span className={`inline-block mt-2 text-xs font-semibold px-2 py-1 rounded-full ${
                              theme === 'dark'
                                ? 'bg-green-900/50 text-green-400'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <div className="ml-4 flex gap-2">
                          {!listing.isVerified && (
                            <button
                              onClick={() => handleVerifyListingFromList(listing.id)}
                              disabled={verifyingListingId === listing.id}
                              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                                theme === 'dark'
                                  ? 'bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50'
                                  : 'bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50'
                              }`}
                            >
                              {verifyingListingId === listing.id ? 'Verifying...' : 'Verify'}
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveListingFromList(listing.id)}
                            disabled={removingListingId === listing.id}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                              theme === 'dark'
                                ? 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50'
                                : 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50'
                            }`}
                          >
                            {removingListingId === listing.id ? 'Removing...' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {listingTotalPages > 1 && (
                  <div className="mt-6 flex gap-2 justify-center">
                    <button
                      onClick={() => setListingPage(p => Math.max(1, p - 1))}
                      disabled={listingPage === 1 || loading}
                      className={`px-3 py-2 rounded-lg text-sm ${
                        theme === 'dark'
                          ? 'bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50'
                          : 'bg-slate-200 text-slate-900 hover:bg-slate-300 disabled:opacity-50'
                      }`}
                    >
                      Previous
                    </button>
                    <div className={`px-4 py-2 text-sm ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      Page {listingPage} of {listingTotalPages}
                    </div>
                    <button
                      onClick={() => setListingPage(p => Math.min(listingTotalPages, p + 1))}
                      disabled={listingPage === listingTotalPages || loading}
                      className={`px-3 py-2 rounded-lg text-sm ${
                        theme === 'dark'
                          ? 'bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50'
                          : 'bg-slate-200 text-slate-900 hover:bg-slate-300 disabled:opacity-50'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
