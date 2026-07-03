import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { getProduct, updateProduct as apiUpdateProduct } from '../api/productApi';
import useProductsStore from '../hooks/useProductsStore';
import { cardClass, inputField, btnGhost, btnPrimary, btnSecondary } from '@/utils/theme';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const updateProduct = useProductsStore((s) => s.updateProduct);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', price: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getProduct(id)
      .then((res) => {
        const p = res.data;
        setProduct(p);
        setForm({
          title: p.title ?? '',
          price: p.price ?? '',
          description: p.description ?? '',
        });
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
        title: form.title,
        description: form.description,
        price: Number(form.price),
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
        <button onClick={() => navigate('/products')} className={btnPrimary}>Back to Products</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <button onClick={() => navigate(`/products/${id}`)} className={`${btnGhost} flex items-center gap-2`}>
        <ArrowLeft className="w-4 h-4 shrink-0" /> Back to Details
      </button>

      <form onSubmit={handleSubmit} className={`${cardClass} p-6 space-y-5`}>
        <h1 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">Edit Product</h1>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</label>
          <input type="text" className={inputField} required {...field('title')} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Price (₹)</label>
          <input type="number" min="0" step="0.01" className={inputField} required {...field('price')} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
          <textarea rows={4} className={`${inputField} resize-none`} {...field('description')} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(`/products/${id}`)} className={`${btnSecondary} flex-1`}>
            Cancel
          </button>
          <button type="submit" className={`${btnPrimary} flex-1 flex items-center justify-center gap-1.5`} disabled={submitting}>
            <Save className="w-4 h-4 shrink-0" />
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
