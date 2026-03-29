import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { getProduct, updateProduct as apiUpdateProduct } from '../api/productApi';
import useProductsStore from '../store/useProductsStore';
import ImageUploader from '../components/ui/ImageUploader';

const CONDITIONS = ['New', 'Used'];

// Read a File object and return a base64 data URL string
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Convert the ImageUploader image list → plain URL strings for the API.
// Existing images (no file object) keep their URL; new uploads are base64-encoded.
async function serializeImages(images) {
  return Promise.all(
    images.map((img) =>
      img.file ? fileToBase64(img.file) : Promise.resolve(img.url)
    )
  );
}

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const updateProduct = useProductsStore((s) => s.updateProduct);

  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [form, setForm] = useState({ title: '', price: '', description: '', category: '', condition: 'Used' });
  const [images, setImages]     = useState([]); // ImageUploader format: { id, file, url }
  const [submitting, setSubmitting] = useState(false);

  // Fetch product from backend and seed form + image uploader
  useEffect(() => {
    getProduct(id)
      .then((res) => {
        const p = res.data;
        setProduct(p);
        setForm({
          title:       p.title       ?? '',
          price:       p.price       ?? '',
          description: p.description ?? '',
          category:    p.category    ?? '',
          condition:   p.condition   ?? 'Used',
        });
        // Convert existing backend URL strings into the shape ImageUploader expects
        const existingImages = (p.images ?? []).map((url, i) => ({
          id:  `existing-${i}`,
          file: null, // no File object — this is an already-uploaded image
          url,
        }));
        setImages(existingImages);
      })
      .catch(() => toast.error('Failed to load product.'))
      .finally(() => setLoading(false));
  }, [id]);

  const field = (name) => ({
    value: form[name],
    onChange: (e) => setForm((f) => ({ ...f, [name]: e.target.value })),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        title:       form.title,
        description: form.description,
        price:       Number(form.price),
        category:    form.category,
        condition:   form.condition.toLowerCase(), // backend enum: 'new' | 'used'
      };
      const res = await apiUpdateProduct(id, payload);
      updateProduct(res.data);
      toast.success('Product updated successfully!');
      navigate(`/products/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400 animate-pulse">Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-gray-500">Product not found.</p>
        <button onClick={() => navigate('/products')} className="btn-primary">Back to Products</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <button onClick={() => navigate(`/products/${id}`)} className="btn-ghost flex items-center gap-2">
        <ArrowLeft className="w-4 h-4 shrink-0" /> Back to Details
      </button>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <h1 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">Edit Product</h1>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</label>
          <input type="text" className="input-field" required {...field('title')} />
        </div>

        {/* Price */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Price (₹)</label>
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

        {/* Images — same drag & drop uploader as Add Product */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Product Images {images.length > 0 ? `(${images.length})` : ''}
          </label>
          <ImageUploader value={images} onChange={setImages} />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(`/products/${id}`)} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" className="btn-primary flex-1" disabled={submitting}>
            <Save className="w-4 h-4 shrink-0" />
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
