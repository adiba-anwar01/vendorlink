import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { categories, conditions } from '../data/mockData';
import { createProduct } from '../api/productApi';
import useProductsStore from '../store/useProductsStore';
import ImageUploader from '../components/ui/ImageUploader';

const INITIAL_FORM = {
  title: '', description: '', price: '', category: '', condition: 'New',
};

export default function AddProduct() {
  const navigate = useNavigate();
  const addProduct = useProductsStore((s) => s.addProduct);
  const [form, setForm]       = useState(INITIAL_FORM);
  const [images, setImages]   = useState([]);
  const [errors, setErrors]   = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Enter a valid price';
    if (!form.category)           e.category    = 'Select a category';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload = {
      title:       form.title.trim(),
      description: form.description.trim(),
      price:       Number(form.price),
      category:    form.category,
      condition:   form.condition.toLowerCase(), // backend enum: 'new' | 'used'
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
      setForm((f) => ({ ...f, [name]: e.target.value }));
      if (errors[name]) setErrors((er) => { const c = { ...er }; delete c[name]; return c; });
    },
  });

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button onClick={() => navigate('/products')} className="btn-ghost mb-3 -ml-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Add New Product</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Fill in the details to publish your listing.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 card p-6">
        {/* Title */}
        <Field label="Product Title" error={errors.title}>
          <input type="text" placeholder="e.g. iPhone 14 Pro 256GB – Space Black" className="input-field" {...field('title')} />
        </Field>

        {/* Description */}
        <Field label="Description" error={errors.description}>
          <textarea rows={4} placeholder="Describe your product in detail..." className="input-field resize-none" {...field('description')} />
        </Field>

        {/* Price + Category row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Price (₹)" error={errors.price}>
            <input type="number" min="0" step="0.01" placeholder="0.00" className="input-field" {...field('price')} />
          </Field>
          <Field label="Category" error={errors.category}>
            <select className="input-field" {...field('category')}>
              <option value="">Select category…</option>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>

        {/* Condition */}
        <Field label="Condition">
          <div className="flex gap-3">
            {conditions.map((c) => (
              <label key={c} className={`flex items-center gap-2 flex-1 cursor-pointer px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                form.condition === c
                  ? 'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900'
                  : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400'
              }`}>
                <input type="radio" name="condition" value={c} checked={form.condition === c}
                  onChange={() => setForm((f) => ({ ...f, condition: c }))} className="hidden" />
                {c}
              </label>
            ))}
          </div>
        </Field>

        {/* Image Upload */}
        <Field label={`Product Images ${images.length > 0 ? `(${images.length})` : ''}`}>
          <ImageUploader value={images} onChange={setImages} />
        </Field>

        {/* Submit */}
        <div className="pt-2">
          <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
            {submitting ? 'Publishing…' : 'Publish Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
