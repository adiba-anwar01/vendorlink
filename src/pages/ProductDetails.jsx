import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, CheckCircle, MapPin, Tag, RefreshCw, Eye, MessageSquare } from 'lucide-react';
import useProductsStore from '../store/useProductsStore';
import Badge from '../components/ui/Badge';
import { formatPrice } from '../components/utils/priceUtils';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const products = useProductsStore((s) => s.products);
  const product = products.find((p) => p.id === id);

  const [activeImg, setActiveImg] = useState(0);
  const [status, setStatus] = useState(product?.status);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-gray-500">Product not found.</p>
        <button onClick={() => navigate('/products')} className="btn-primary">Back to Products</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/products')} className="btn-ghost flex items-center gap-2">
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Back</span>
        </button>
        <div className="flex-1" />
        <Badge status={status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left – Image Gallery */}
        <div className="space-y-3">
          {/* Main image */}
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            {product.images?.[activeImg] ? (
              <img
                src={product.images[activeImg]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">No image</div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                    i === activeImg ? 'border-gray-900 dark:border-white' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right – Product Info */}
        <div className="space-y-5">
          <div className="card p-6 space-y-4">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">{product.title}</h1>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(product.price)}</p>

            {/* Meta tags */}
            <div className="flex flex-wrap gap-2">
              <InfoChip icon={Tag}        label={product.category}  />
              <InfoChip icon={RefreshCw}  label={product.condition} />
              <InfoChip icon={MapPin}     label={product.location}  />
            </div>

            {/* Description */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Description</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{product.description}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-gray-500">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="text-xs">Views</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{product.views}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-gray-500">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="text-xs">Inquiries</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{product.inquiries}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/products/${id}/edit`)}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <Edit2 className="w-4 h-4 shrink-0" />
              <span>Edit Product</span>
            </button>
            {status === 'Active' && (
              <button
                onClick={() => setStatus('Sold')}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Mark as Sold</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoChip({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300">
      <Icon className="w-3 h-3 text-gray-500" />
      {label}
    </div>
  );
}
