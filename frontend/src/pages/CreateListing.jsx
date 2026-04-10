import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createListing, updateListing, fetchListingById } from '../api/listings.js';
import { getStoredToken } from '../lib/authStorage.js';
import { validateListingForm } from '../validation/listingForm.js';
import { COMMON_AMENITIES } from '../constants/amenities.js';

const initialForm = {
  title: '',
  description: '',
  city: '',
  state: '',
  country: '',
  latitude: '',
  longitude: '',
  googleMapsUrl: '',
  unitType: '',
  pricePerDay: '',
  capacity: '',
  quantity: '',
  images: [],
  amenities: [],
};

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-2 text-sm text-red-600 dark:text-red-400">{message}</p>;
}

function inputClass(hasError) {
  return ['app-input mt-1.5', hasError ? 'border-red-300 focus:border-red-500' : ''].join(' ');
}

export default function CreateListing() {
  const { listingId } = useParams();
  const isEditMode = Boolean(listingId);
  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const token = getStoredToken();

  useEffect(() => {
    if (!isEditMode) {
      setLoading(false);
      return;
    }

    async function loadListing() {
      try {
        const data = await fetchListingById(listingId);
        if (data.listing) {
          const listing = data.listing;
          const unit = listing.units?.[0];
          setForm({
            title: listing.title || '',
            description: listing.description || '',
            city: listing.city || '',
            state: listing.state || '',
            country: listing.country || '',
            latitude: listing.latitude || '',
            longitude: listing.longitude || '',
            googleMapsUrl: listing.googleMapsUrl || '',
            unitType: unit?.unitType || '',
            pricePerDay: unit?.pricePerDay || '',
            capacity: unit?.capacity || '',
            quantity: unit?.quantity || '',
            images: unit?.images?.map((img) => img.url) || [],
            amenities: unit?.amenities || [],
          });
        }
      } catch (err) {
        setServerError(err instanceof Error ? err.message : 'Failed to load listing');
      } finally {
        setLoading(false);
      }
    }

    loadListing();
  }, [isEditMode, listingId]);

  const validation = validateListingForm(form);
  const errors = validation.ok ? {} : validation.errors;
  const showError = (name) => (submitAttempted || touched[name] ? errors[name] : undefined);

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    setSuccess(null);
    setServerError(null);
  }

  function onBlur(name) {
    setTouched((t) => ({ ...t, [name]: true }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitAttempted(true);
    setServerError(null);
    setSuccess(null);

    const v = validateListingForm(form);
    if (!v.ok) return;

    const auth = getStoredToken();
    if (!auth) {
      setServerError('You need to be signed in as a host to publish a listing.');
      return;
    }

    setSubmitting(true);
    try {
      const data = isEditMode
        ? await updateListing(listingId, v.payload, auth)
        : await createListing(v.payload, auth);

      setSuccess(data);
      if (!isEditMode) {
        setForm(initialForm);
        setTouched({});
        setSubmitAttempted(false);
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="app-page text-center text-slate-600 dark:text-slate-300">Loading listing...</div>;
  }

  return (
    <div className="app-page space-y-6">
      <section className="app-panel p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{isEditMode ? 'Edit mode' : 'Host setup'}</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
              {isEditMode ? 'Update your listing' : 'Create a new listing'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              {isEditMode
                ? 'Refresh every guest-facing detail, from pricing to images and amenities.'
                : 'Add the complete guest-facing experience in one flow: property basics, pricing, inventory, map link, and amenities.'}
            </p>
          </div>
          <Link to="/host/listings" className="app-button-secondary">
            Back to host dashboard
          </Link>
        </div>

        {!token ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
            No auth token found. Sign in as a host before you publish or edit a listing.
          </div>
        ) : (
          <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-300">Host authentication detected.</p>
        )}
      </section>

      {serverError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {serverError}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
          {isEditMode
            ? `Listing updated. ${success.listing?.title ?? 'Your space'} changes are saved.`
            : `Listing created. ${success.listing?.title ?? 'Your space'} is now live with inventory configured.`}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-6">
        <section className="app-panel p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Basics</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Title</label>
              <input id="title" value={form.title} onChange={(e) => update('title', e.target.value)} onBlur={() => onBlur('title')} className={inputClass(Boolean(showError('title')))} placeholder="Quiet room near campus" maxLength={220} />
              <FieldError message={showError('title')} />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Description</label>
              <textarea id="description" value={form.description} onChange={(e) => update('description', e.target.value)} onBlur={() => onBlur('description')} rows={5} className={`${inputClass(Boolean(showError('description')))} min-h-[140px] resize-none`} placeholder="What makes this space comfortable for short stays?" />
              <FieldError message={showError('description')} />
            </div>
          </div>
        </section>

        <section className="app-panel p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Location</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-slate-700 dark:text-slate-200">City</label>
              <input id="city" value={form.city} onChange={(e) => update('city', e.target.value)} onBlur={() => onBlur('city')} className={inputClass(Boolean(showError('city')))} />
              <FieldError message={showError('city')} />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-slate-700 dark:text-slate-200">State / region</label>
              <input id="state" value={form.state} onChange={(e) => update('state', e.target.value)} onBlur={() => onBlur('state')} className={inputClass(Boolean(showError('state')))} />
              <FieldError message={showError('state')} />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Country</label>
              <input id="country" value={form.country} onChange={(e) => update('country', e.target.value)} onBlur={() => onBlur('country')} className={inputClass(Boolean(showError('country')))} />
              <FieldError message={showError('country')} />
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Latitude</label>
              <input id="latitude" inputMode="decimal" value={form.latitude} onChange={(e) => update('latitude', e.target.value)} onBlur={() => onBlur('latitude')} className={inputClass(Boolean(showError('latitude')))} placeholder="-90 to 90" />
              <FieldError message={showError('latitude')} />
            </div>
            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Longitude</label>
              <input id="longitude" inputMode="decimal" value={form.longitude} onChange={(e) => update('longitude', e.target.value)} onBlur={() => onBlur('longitude')} className={inputClass(Boolean(showError('longitude')))} placeholder="-180 to 180" />
              <FieldError message={showError('longitude')} />
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="googleMapsUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Google Maps URL</label>
            <input id="googleMapsUrl" type="url" value={form.googleMapsUrl} onChange={(e) => update('googleMapsUrl', e.target.value)} onBlur={() => onBlur('googleMapsUrl')} className={inputClass(Boolean(showError('googleMapsUrl')))} placeholder="https://maps.google.com/..." />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Optional, but useful for guest trust and navigation.</p>
            <FieldError message={showError('googleMapsUrl')} />
          </div>
        </section>

        <section className="app-panel p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Unit and pricing</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="unitType" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Unit type</label>
              <select id="unitType" value={form.unitType} onChange={(e) => update('unitType', e.target.value)} onBlur={() => onBlur('unitType')} className={inputClass(Boolean(showError('unitType')))}>
                <option value="">Select type</option>
                <option value="room">Room</option>
                <option value="bed">Bed</option>
                <option value="entire_place">Entire place</option>
              </select>
              <FieldError message={showError('unitType')} />
            </div>
            <div>
              <label htmlFor="pricePerDay" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Price / day (INR)</label>
              <input id="pricePerDay" inputMode="decimal" min={0} step="0.01" value={form.pricePerDay} onChange={(e) => update('pricePerDay', e.target.value)} onBlur={() => onBlur('pricePerDay')} className={inputClass(Boolean(showError('pricePerDay')))} />
              <FieldError message={showError('pricePerDay')} />
            </div>
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Capacity</label>
              <input id="capacity" inputMode="numeric" min={1} step={1} value={form.capacity} onChange={(e) => update('capacity', e.target.value)} onBlur={() => onBlur('capacity')} className={inputClass(Boolean(showError('capacity')))} />
              <FieldError message={showError('capacity')} />
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Quantity</label>
              <input id="quantity" inputMode="numeric" min={1} step={1} value={form.quantity} onChange={(e) => update('quantity', e.target.value)} onBlur={() => onBlur('quantity')} className={inputClass(Boolean(showError('quantity')))} />
              <FieldError message={showError('quantity')} />
            </div>
          </div>
        </section>

        <section className="app-panel p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Images</h2>
          <div className="mt-5 space-y-3">
            {form.images.map((image, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={image}
                  onChange={(e) => {
                    const newImages = [...form.images];
                    newImages[idx] = e.target.value;
                    update('images', newImages);
                  }}
                  className="app-input"
                />
                <button
                  type="button"
                  onClick={() => update('images', form.images.filter((_, i) => i !== idx))}
                  className="rounded-2xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={() => update('images', [...form.images, ''])} className="app-button-secondary">
              Add image URL
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400">Up to 10 direct image URLs. The first image becomes the thumbnail.</p>
            <FieldError message={showError('images')} />
          </div>
        </section>

        <section className="app-panel p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Amenities</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {COMMON_AMENITIES.map((amenity) => (
              <label key={amenity} className="app-panel-soft flex cursor-pointer items-center gap-3 p-3 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={form.amenities.includes(amenity)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      update('amenities', [...form.amenities, amenity]);
                    } else {
                      update('amenities', form.amenities.filter((a) => a !== amenity));
                    }
                  }}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span>{amenity}</span>
              </label>
            ))}
          </div>
          <FieldError message={showError('amenities')} />
        </section>

        <section className="app-panel p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isEditMode
                ? 'This saves listing details and the first unit together.'
                : 'This publishes the listing and creates the first unit in one request.'}
            </p>
            <button type="submit" disabled={submitting} className="app-button-primary">
              {submitting ? (isEditMode ? 'Updating...' : 'Publishing...') : (isEditMode ? 'Update listing' : 'Publish listing')}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}
