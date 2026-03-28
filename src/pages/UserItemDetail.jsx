import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Image, Tag, User, MapPin, Package } from 'lucide-react';
import { userListings } from '../data/mockData';
import useMyOrdersStore from '../store/useMyOrdersStore';

export default function UserItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const placeOrder = useMyOrdersStore((s) => s.placeOrder);

  const item = userListings.find((i) => i.id === id);

  // Build an images array — userListings only has one image field,
  // so we treat it as the single image in the gallery.
  const images = item?.image ? [item.image] : [];
  const [activeImg, setActiveImg] = useState(0);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const categoryColors = {
    Mobile:      { bg: 'bg-purple-100', text: 'text-purple-700' },
    Electronics: { bg: 'bg-blue-100',   text: 'text-blue-700'   },
    Furniture:   { bg: 'bg-amber-100',  text: 'text-amber-700'  },
  };
  const catStyle = categoryColors[item?.category] || { bg: 'bg-gray-100', text: 'text-gray-600' };

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-gray-500">Item not found.</p>
        <button onClick={() => navigate('/explore-items')} className="btn-primary">
          Back to Explore
        </button>
      </div>
    );
  }

  function handlePlaceOrder() {
    placeOrder(item);
    setOrderSuccess(true);
    setTimeout(() => setOrderSuccess(false), 3000);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="btn-ghost flex items-center gap-2">
        <ArrowLeft className="w-4 h-4 shrink-0" /> Back
      </button>

      {/* Main layout: image left, details right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Left: Image Gallery ── */}
        <div className="space-y-3">
          {/* Main image */}
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
            {images.length > 0 ? (
              <img
                src={images[activeImg]}
                alt={item.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
                <Image className="w-14 h-14" />
                <p className="text-sm">No image available</p>
              </div>
            )}
          </div>

          {/* Thumbnails — visible only when multiple images */}
          {images.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                    i === activeImg
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${catStyle.bg} ${catStyle.text}`}>
              {item.category}
            </span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              item.condition === 'New'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {item.condition}
            </span>
          </div>
        </div>

        {/* ── Right: Details ── */}
        <div className="space-y-4">
          <div className="card p-6 space-y-4">
            {/* Title + Price */}
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-snug mb-2">
                {item.title}
              </h1>
              <p className="text-3xl font-bold text-gray-900">
                ${item.price.toLocaleString()}
              </p>
            </div>

            {/* Meta */}
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <div className="flex items-start gap-2.5 text-sm text-gray-600">
                <User className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Posted by <strong>{item.seller}</strong></span>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-gray-600">
                <Tag className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Category: <strong>{item.category}</strong></span>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-gray-600">
                <Package className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Condition: <strong>{item.condition}</strong></span>
              </div>
              {item.lat && item.lng && (
                <div className="flex items-start gap-2.5 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>Nearby ({item.lat.toFixed(3)}°, {item.lng.toFixed(3)}°)</span>
                </div>
              )}
            </div>

            {/* Description (if any) */}
            {item.description && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</p>
                <p className="text-sm text-gray-700 leading-relaxed">{item.description}</p>
              </div>
            )}

            {/* Order success */}
            {orderSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3
                text-sm text-emerald-700 font-medium text-center">
                ✅ Order placed! Check My Orders.
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={() => navigate(-1)} className="btn-secondary flex-1">
                Go Back
              </button>
              <button onClick={handlePlaceOrder} className="btn-primary flex-1">
                <ShoppingCart className="w-4 h-4 shrink-0" /> Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
