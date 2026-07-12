import { useState } from 'react';
import { User, Save, MapPin, Mail, Store } from 'lucide-react';
import useAuthStore from '@/features/auth/hooks/useAuthStore';
import { InputWithIcon } from '@/components/ui';
import { updateVendorLocation } from '@/features/auth/api/authApi';
import { cardClass, inputField, btnPrimary } from '@/utils/theme';
import { getInitials } from '@/utils/userUtils';

export default function Profile() {
  const { vendor, setVendor } = useAuthStore();
  const [form, setForm] = useState({ ...vendor, locationDisplay: '', latitude: '', longitude: '' });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  const getLocationText = (vendorData) => {
    if (!vendorData) return '';

    const label =
      typeof vendorData.location === 'string'
        ? vendorData.location
        : vendorData.location?.address ||
          vendorData.location?.label ||
          vendorData.locationName ||
          vendorData.shopLocation ||
          vendorData.address;

    if (label) return label;

    const geoCoords = vendorData.location?.coordinates;
    if (Array.isArray(geoCoords) && geoCoords.length >= 2) {
      return `${Number(geoCoords[1]).toFixed(4)}, ${Number(geoCoords[0]).toFixed(4)}`;
    }

    if (vendorData.latitude != null && vendorData.longitude != null) {
      return `${Number(vendorData.latitude).toFixed(4)}, ${Number(vendorData.longitude).toFixed(4)}`;
    }
    if (vendorData.lat != null && vendorData.lng != null) {
      return `${Number(vendorData.lat).toFixed(4)}, ${Number(vendorData.lng).toFixed(4)}`;
    }

    return '';
  };

  const [prevVendor, setPrevVendor] = useState(null);

  if (vendor !== prevVendor) {
    setPrevVendor(vendor);
    const coords = vendor?.location?.coordinates;
    const latitude = Array.isArray(coords) && coords.length >= 2
      ? Number(coords[1])
      : vendor?.latitude ?? vendor?.lat ?? '';
    const longitude = Array.isArray(coords) && coords.length >= 2
      ? Number(coords[0])
      : vendor?.longitude ?? vendor?.lng ?? '';

    setForm({
      ...vendor,
      locationDisplay: getLocationText(vendor),
      latitude: latitude === '' ? '' : String(latitude),
      longitude: longitude === '' ? '' : String(longitude),
    });
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser. Enter coordinates manually.');
      return;
    }

    setDetectingLocation(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setForm((prev) => ({
          ...prev,
          latitude: String(lat),
          longitude: String(lng),
          locationDisplay: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        }));
        setDetectingLocation(false);
      },
      (error) => {
        setDetectingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location permission denied. Please allow location access and try again.');
          return;
        }
        if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationError('Location is unavailable. Please enter coordinates manually.');
          return;
        }
        if (error.code === error.TIMEOUT) {
          setLocationError('Location request timed out. Please try again.');
          return;
        }
        setLocationError('Unable to detect your location. Please enter coordinates manually.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const latValue = Number(form.latitude);
    const lngValue = Number(form.longitude);

    if (!Number.isFinite(latValue) || !Number.isFinite(lngValue)) {
      setLocationError('Please provide valid latitude and longitude.');
      return;
    }

    try {
      setSaving(true);
      setLocationError('');

      await updateVendorLocation({
        latitude: latValue,
        longitude: lngValue,
      });

      setVendor({
        ...vendor,
        name: form.name,
        email: form.email,
        locationName: vendor?.locationName,
        location: {
          type: 'Point',
          coordinates: [lngValue, latValue],
        },
        latitude: latValue,
        longitude: lngValue,
        lat: latValue,
        lng: lngValue,
      });

      setForm((prev) => ({
        ...prev,
        locationDisplay: `${latValue.toFixed(4)}, ${lngValue.toFixed(4)}`,
      }));

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setLocationError(err.response?.data?.message || 'Failed to update location. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const field = (name) => ({
    value: form[name] || '',
    onChange: (e) => setForm((f) => ({ ...f, [name]: e.target.value })),
  });



  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className={`${cardClass} p-6 bg-gradient-primary text-white`}>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0 border-2 border-white/30">
            <span className="text-xl font-bold text-white">
              {getInitials(vendor?.name)}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Store className="w-5 h-5 shrink-0" />
              {vendor?.name}
            </h1>
            <p className="text-brand-100 text-sm mt-0.5">{vendor?.email}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-brand-200">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" />
                <span>{getLocationText(vendor) || 'Location not available'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {saved && (
        <div className={`${cardClass} p-4 bg-emerald-50 border-l-4 border-emerald-400`}>
          <p className="text-sm font-semibold text-emerald-700">Profile updated successfully!</p>
        </div>
      )}

      <form onSubmit={handleSave} className={`${cardClass} p-6 space-y-5`}>
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <div className="w-7 h-7 bg-brand-50 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-brand-500" />
          </div>
          <h2 className="text-sm font-bold text-gray-900">Account Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ProfileField label="Store Name" className="sm:col-span-2">
            <InputWithIcon icon={Store} {...field('name')} readOnly className="bg-gray-50/70 cursor-not-allowed opacity-70" />
          </ProfileField>
          <ProfileField label="Email Address" className="sm:col-span-2">
            <InputWithIcon icon={Mail} type="email" {...field('email')} readOnly className="bg-gray-50/70 cursor-not-allowed opacity-70" />
          </ProfileField>
          <ProfileField label="Location" className="sm:col-span-2">
            <InputWithIcon icon={MapPin} value={form.locationDisplay || ''} readOnly />
          </ProfileField>
          <ProfileField label="Latitude">
            <input
              type="number"
              step="any"
              value={form.latitude || ''}
              onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
              className={inputField}
              placeholder="e.g. 22.5726"
            />
          </ProfileField>
          <ProfileField label="Longitude">
            <input
              type="number"
              step="any"
              value={form.longitude || ''}
              onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
              className={inputField}
              placeholder="e.g. 88.3639"
            />
          </ProfileField>
          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={detectingLocation}
              className={`w-full rounded-lg border border-dashed border-[#6366f1] bg-[#eef2ff] p-[10px] text-[13px] font-semibold text-[#4f46e5] transition-opacity ${
                detectingLocation ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {detectingLocation ? 'Detecting your location...' : 'Use My Current Location'}
            </button>
          </div>
        </div>

        {locationError && (
          <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-lg">
            <p className="text-sm text-red-600">{locationError}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className={`${btnPrimary} flex-1 py-3 flex items-center justify-center gap-2`}
          >
            <Save className="w-4 h-4 shrink-0" />
            <span>{saving ? 'Updating...' : 'Update Profile'}</span>
          </button>

        </div>
      </form>

    </div>
  );
}

function ProfileField({ label, children, className = '' }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

