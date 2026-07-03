import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS } from '@/constants/product';
import { createProduct } from '../api/productApi';
import useProductsStore from '../hooks/useProductsStore';
import useAuthStore from '@/features/auth/hooks/useAuthStore';
import ImageUploader from '@/components/ui/ImageUploader';
import { cardClass, inputField, btnGhost, btnSecondary, btnPrimary } from '@/utils/theme';

const INITIAL_FORM = {
  title: '',
  description: '',
  price: '',
  category: '',
  condition: 'New',
};

function getInitialLocation(vendor) {
  const coordinates = vendor?.location?.coordinates;

  if (Array.isArray(coordinates) && coordinates.length >= 2) {
    return {
      longitude: coordinates[0],
      latitude: coordinates[1],
    };
  }

  return {
    latitude: vendor?.latitude ?? vendor?.lat ?? '',
    longitude: vendor?.longitude ?? vendor?.lng ?? '',
  };
}

export default function AddProduct() {
  const navigate = useNavigate();
  const addProduct = useProductsStore((s) => s.addProduct);
  const vendor = useAuthStore((s) => s.vendor);
  const [form, setForm] = useState(INITIAL_FORM);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [imagesUploading, setImagesUploading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationCoords, setLocationCoords] = useState(getInitialLocation(vendor));

  const validate = () => {
    const nextErrors = {};

    if (!form.title.trim()) nextErrors.title = 'Title is required';
    if (!form.description.trim()) nextErrors.description = 'Description is required';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) nextErrors.price = 'Enter a valid price';
    if (!form.category) nextErrors.category = 'Select a category';
    if (imagesUploading) nextErrors.images = 'Please wait for image upload to finish';
    else if (images.length === 0) nextErrors.images = 'Upload at least one product image';

    const latitude = Number(locationCoords.latitude);
    const longitude = Number(locationCoords.longitude);

    if (locationCoords.latitude === '' || locationCoords.longitude === '') {
      nextErrors.location = 'Product location is required';
    } else if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      nextErrors.location = 'Enter valid latitude and longitude';
    }

    return nextErrors;
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationCoords({
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
        });
        setErrors((current) => {
          const next = { ...current };
          delete next.location;
          return next;
        });
        toast.success('Product location detected.');
        setDetectingLocation(false);
      },
      () => {
        toast.error('Could not detect location. Enter coordinates manually.');
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category,
      condition: form.condition.toLowerCase(),
      images: images.map((img) => img.url),
      location: {
        type: 'Point',
        coordinates: [Number(locationCoords.longitude), Number(locationCoords.latitude)],
      },
    };

    try {
      setSubmitting(true);
      const res = await createProduct(payload);
      addProduct(res.data);
      toast.success('Product published successfully!');
      navigate('/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish product.');
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name) => ({
    value: form[name],
    onChange: (e) => {
      setForm((current) => ({ ...current, [name]: e.target.value }));
      if (errors[name]) {
        setErrors((current) => {
          const next = { ...current };
          delete next[name];
          return next;
        });
      }
    },
  });

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <button onClick={() => navigate('/products')} className={`${btnGhost} mb-3 -ml-2`}>
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-sm text-gray-500 mt-0.5">Fill in the details to publish your listing.</p>
      </div>

      <form onSubmit={handleSubmit} className={`space-y-5 ${cardClass} p-6`}>
        <Field label="Product Title" error={errors.title}>
          <input type="text" placeholder="e.g. iPhone 14 Pro 256GB - Space Black" className={inputField} {...field('title')} />
        </Field>

        <Field label="Description" error={errors.description}>
          <textarea rows={4} placeholder="Describe your product in detail..." className={`${inputField} resize-none`} {...field('description')} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Price (INR)" error={errors.price}>
            <input type="number" min="0" step="0.01" placeholder="0.00" className={inputField} {...field('price')} />
          </Field>
          <Field label="Category" error={errors.category}>
            <select className={inputField} {...field('category')}>
              <option value="">Select category...</option>
              {PRODUCT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Condition">
          <div className="flex gap-3">
            {PRODUCT_CONDITIONS.map((c) => (
              <label key={c} className={`flex items-center gap-2 flex-1 cursor-pointer px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                form.condition === c
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 text-gray-700 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="condition"
                  value={c}
                  checked={form.condition === c}
                  onChange={() => setForm((current) => ({ ...current, condition: c }))}
                  className="hidden"
                />
                {c}
              </label>
            ))}
          </div>
        </Field>

        <Field label={`Product Images ${images.length > 0 ? `(${images.length})` : ''}`} error={errors.images}>
          <ImageUploader
            value={images}
            onChange={(nextImages) => {
              setImages(nextImages);
              setErrors((current) => {
                const next = { ...current };
                if (nextImages.length > 0) {
                  delete next.images;
                }
                return next;
              });
            }}
            disabled={submitting}
            onUploadingChange={setImagesUploading}
          />
        </Field>

        <Field label="Product Location" error={errors.location} hint="The backend requires product coordinates.">
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={detectingLocation}
              className={`${btnSecondary} w-full flex items-center justify-center gap-2`}
            >
              <MapPin className="w-4 h-4" />
              {detectingLocation ? 'Detecting location...' : 'Use Current Location'}
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="number"
                step="any"
                placeholder="Latitude"
                className={inputField}
                value={locationCoords.latitude}
                onChange={(e) => setLocationCoords((current) => ({ ...current, latitude: e.target.value }))}
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                className={inputField}
                value={locationCoords.longitude}
                onChange={(e) => setLocationCoords((current) => ({ ...current, longitude: e.target.value }))}
              />
            </div>
          </div>
        </Field>

        <div className="pt-2">
          <button type="submit" disabled={submitting || imagesUploading} className={`${btnPrimary} w-full py-3`}>
            {submitting ? 'Publishing...' : imagesUploading ? 'Uploading images...' : 'Publish Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
