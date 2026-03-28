import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle, X, Plus } from 'lucide-react';
import useProductsStore from '../store/useProductsStore';

const CONDITIONS = ['New', 'Used'];

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, updateProduct } = useProductsStore();
  const product = products.find((p) => p.id === id);

  const [form, setForm] = useState({
    title: product?.title ?? '',
    price: product?.price ?? '',
    description: product?.description ?? '',
    condition: product?.condition ?? 'Used',
  });

  // Images — start with a copy of existing product images
  const [images, setImages] = useState([...(product?.images ?? [])]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [saved, setSaved] = useState(false);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-gray-500">Product not found.</p>
        <button onClick={() => navigate('/products')} className="btn-primary">
          Back to Products
        </button>
      </div>
    );
  }

  const field = (name) => ({
    value: form[name],
    onChange: (e) => setForm((f) => ({ ...f, [name]: e.target.value })),
  });

  function addImage() {
    const url = newImageUrl.trim();
    if (!url) return;
    setImages((prev) => [...prev, url]);
    setNewImageUrl('');
  }

  function removeImage(idx) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProduct({ ...product, ...form, price: Number(form.price), images });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      navigate(`/products/${id}`);
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <button onClick={() => navigate(`/products/${id}`)} className="btn-ghost flex items-center gap-2">
        <ArrowLeft className="w-4 h-4 shrink-0" /> Back to Details
      </button>

      {/* Success banner */}
      {saved && (
        <div className="card p-4 bg-emerald-50 border-l-4 border-emerald-400 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-sm font-semibold text-emerald-700">Product updated! Redirecting…</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <h1 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
          Edit Product
        </h1>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</label>
          <input type="text" className="input-field" required {...field('title')} />
        </div>

        {/* Price */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Price ($)</label>
          <input type="number" min="0" step="0.01" className="input-field" required {...field('price')} />
        </div>

        {/* Condition */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Condition</label>
          <select className="input-field" {...field('condition')}>
            {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
          <textarea rows={4} className="input-field resize-none" {...field('description')} />
        </div>

        {/* ── Images ── */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Images</label>

          {/* Existing images thumbnails */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                  <img src={img} alt={`img-${i}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute inset-0 bg-black/50 invisible group-hover:visible
                      flex items-center justify-center transition-all"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new image by URL */}
          <div className="flex gap-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Paste image URL…"
              className="input-field flex-1 text-sm"
            />
            <button
              type="button"
              onClick={addImage}
              className="btn-secondary shrink-0 px-3 py-2"
            >
              <Plus className="w-4 h-4 shrink-0" /> Add
            </button>
          </div>
          <p className="text-[11px] text-gray-400">Hover over an existing image and click × to remove it.</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(`/products/${id}`)} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" className="btn-primary flex-1" disabled={saved}>
            <Save className="w-4 h-4 shrink-0" />
            {saved ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
