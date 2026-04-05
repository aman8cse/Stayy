import { useState } from 'react';
import { createListing } from '../api/listings.js';
import { getStoredToken } from '../lib/authStorage.js';
import { validateListingForm } from '../validation/listingForm.js';

const initialForm = {
  title: '',
  description: '',
  city: '',
  state: '',
  country: '',
  latitude: '',
  longitude: '',
  roomPurpose: '',
  unitType: '',
  pricePerHour: '',
  pricePerDay: '',
  capacity: '',
};

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

function inputClass(hasError) {
  return [
    'mt-1.5 w-full rounded-xl border bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition',
    'ring-brand-500/30 placeholder:text-slate-400 focus:ring-4',
    hasError ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-brand-500',
  ].join(' ');
}

export default function CreateListing() {
  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const token = getStoredToken();

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
      setServerError('You need to be signed in as a host. Save your JWT to localStorage as stayy_token (or implement login).');
      return;
    }

    setSubmitting(true);
    try {
      const data = await createListing(v.payload, auth);
      setSuccess(data);
      setForm(initialForm);
      setTouched({});
      setSubmitAttempted(false);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Create a listing</h1>
          <p className="mt-2 text-slate-600">
            Add your space details and pricing. This creates the listing and its first bookable unit in one step.
          </p>
          {!token ? (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              No auth token found. Hosts must send a Bearer token: after login or signup, store{' '}
              <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">localStorage.setItem(&apos;stayy_token&apos;, token)</code>
              .
            </p>
          ) : (
            <p className="mt-3 text-sm text-emerald-700">Signed in (token on file).</p>
          )}
        </header>

        {serverError ? (
          <div
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {serverError}
          </div>
        ) : null}

        {success ? (
          <div
            className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
            role="status"
          >
            Listing created.{' '}
            <span className="font-medium">{success.listing?.title ?? 'Your space'}</span> is live with unit pricing
            configured.
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/5 sm:p-8">
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Basics</h2>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700">
                Title
              </label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                onBlur={() => onBlur('title')}
                className={inputClass(Boolean(showError('title')))}
                placeholder="Quiet room near campus"
                maxLength={220}
              />
              <FieldError message={showError('title')} />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                onBlur={() => onBlur('description')}
                rows={5}
                className={inputClass(Boolean(showError('description')))}
                placeholder="What makes this space comfortable for short stays?"
              />
              <FieldError message={showError('description')} />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Location</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <label htmlFor="city" className="block text-sm font-medium text-slate-700">
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                  onBlur={() => onBlur('city')}
                  className={inputClass(Boolean(showError('city')))}
                />
                <FieldError message={showError('city')} />
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="state" className="block text-sm font-medium text-slate-700">
                  State / region
                </label>
                <input
                  id="state"
                  name="state"
                  value={form.state}
                  onChange={(e) => update('state', e.target.value)}
                  onBlur={() => onBlur('state')}
                  className={inputClass(Boolean(showError('state')))}
                />
                <FieldError message={showError('state')} />
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="country" className="block text-sm font-medium text-slate-700">
                  Country
                </label>
                <input
                  id="country"
                  name="country"
                  value={form.country}
                  onChange={(e) => update('country', e.target.value)}
                  onBlur={() => onBlur('country')}
                  className={inputClass(Boolean(showError('country')))}
                />
                <FieldError message={showError('country')} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-slate-700">
                  Latitude
                </label>
                <input
                  id="latitude"
                  name="latitude"
                  inputMode="decimal"
                  value={form.latitude}
                  onChange={(e) => update('latitude', e.target.value)}
                  onBlur={() => onBlur('latitude')}
                  className={inputClass(Boolean(showError('latitude')))}
                  placeholder="-90 to 90"
                />
                <FieldError message={showError('latitude')} />
              </div>
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-slate-700">
                  Longitude
                </label>
                <input
                  id="longitude"
                  name="longitude"
                  inputMode="decimal"
                  value={form.longitude}
                  onChange={(e) => update('longitude', e.target.value)}
                  onBlur={() => onBlur('longitude')}
                  className={inputClass(Boolean(showError('longitude')))}
                  placeholder="-180 to 180"
                />
                <FieldError message={showError('longitude')} />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Unit & pricing</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="roomPurpose" className="block text-sm font-medium text-slate-700">
                  Room purpose
                </label>
                <select
                  id="roomPurpose"
                  name="roomPurpose"
                  value={form.roomPurpose}
                  onChange={(e) => update('roomPurpose', e.target.value)}
                  onBlur={() => onBlur('roomPurpose')}
                  className={inputClass(Boolean(showError('roomPurpose')))}
                >
                  <option value="">Select purpose</option>
                  <option value="sleep">Sleep</option>
                  <option value="study">Study</option>
                  <option value="freshen_up">Freshen up</option>
                </select>
                <FieldError message={showError('roomPurpose')} />
              </div>
              <div>
                <label htmlFor="unitType" className="block text-sm font-medium text-slate-700">
                  Unit type
                </label>
                <select
                  id="unitType"
                  name="unitType"
                  value={form.unitType}
                  onChange={(e) => update('unitType', e.target.value)}
                  onBlur={() => onBlur('unitType')}
                  className={inputClass(Boolean(showError('unitType')))}
                >
                  <option value="">Select type</option>
                  <option value="room">Room</option>
                  <option value="bed">Bed</option>
                  <option value="entire_place">Entire place</option>
                </select>
                <FieldError message={showError('unitType')} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="pricePerHour" className="block text-sm font-medium text-slate-700">
                  Price / hour (USD)
                </label>
                <input
                  id="pricePerHour"
                  name="pricePerHour"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  value={form.pricePerHour}
                  onChange={(e) => update('pricePerHour', e.target.value)}
                  onBlur={() => onBlur('pricePerHour')}
                  className={inputClass(Boolean(showError('pricePerHour')))}
                />
                <FieldError message={showError('pricePerHour')} />
              </div>
              <div>
                <label htmlFor="pricePerDay" className="block text-sm font-medium text-slate-700">
                  Price / day (USD)
                </label>
                <input
                  id="pricePerDay"
                  name="pricePerDay"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  value={form.pricePerDay}
                  onChange={(e) => update('pricePerDay', e.target.value)}
                  onBlur={() => onBlur('pricePerDay')}
                  className={inputClass(Boolean(showError('pricePerDay')))}
                />
                <FieldError message={showError('pricePerDay')} />
              </div>
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-slate-700">
                  Capacity (guests)
                </label>
                <input
                  id="capacity"
                  name="capacity"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  value={form.capacity}
                  onChange={(e) => update('capacity', e.target.value)}
                  onBlur={() => onBlur('capacity')}
                  className={inputClass(Boolean(showError('capacity')))}
                />
                <FieldError message={showError('capacity')} />
              </div>
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Publishing…' : 'Publish listing'}
            </button>
            <p className="text-xs text-slate-500">Submits to POST /listings as a host.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
