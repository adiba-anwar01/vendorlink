import { useState } from 'react';
import { Image, ShoppingCart, Eye, X, MapPin, Tag, User } from 'lucide-react';
import useMyOrdersStore from '../../store/useMyOrdersStore';

export default function UserItemCard({ item }) {
  const placeOrder = useMyOrdersStore((s) => s.placeOrder);
  const [showDetails, setShowDetails] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const categoryColors = {
    Mobile: { bg: 'bg-purple-100', text: 'text-purple-700' },
    Electronics: { bg: 'bg-blue-100', text: 'text-blue-700' },
    Furniture: { bg: 'bg-amber-100', text: 'text-amber-700' },
  };
  const catStyle = categoryColors[item.category] || { bg: 'bg-gray-100', text: 'text-gray-600' };

  function handlePlaceOrder() {
    placeOrder(item);
    setOrderSuccess(true);
    setShowDetails(false);
    setTimeout(() => setOrderSuccess(false), 3000);
  }

  return (
    <>
      {/* ── Card ─────────────────────────────────────────────────────── */}
      <div className="card card-hover overflow-hidden group flex flex-col">
        {/* Image */}
        <div className="relative h-36 bg-gray-100 overflow-hidden shrink-0">
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image className="w-10 h-10 text-gray-300" />
            </div>
          )}
          {/* Category badge */}
          <div className="absolute top-2.5 left-2.5">
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${catStyle.bg} ${catStyle.text}`}>
              {item.category}
            </span>
          </div>
          {/* Condition badge */}
          <div className="absolute top-2.5 right-2.5">
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${item.condition === 'New' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
              }`}>
              {item.condition}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-0.5 flex-1">
            {item.title}
          </h3>
          <p className="text-xs text-gray-400 mb-1.5">Posted by {item.seller}</p>

          <div className="flex items-center justify-between mb-2">
            <span className="text-base font-bold text-gray-900">
              ${item.price.toLocaleString()}
            </span>
          </div>

          {/* Success banner */}
          {orderSuccess && (
            <div className="mb-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200
              rounded-lg px-2.5 py-1.5 text-center font-medium animate-fade-in">
              ✅ Order placed! Check My Orders.
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-center gap-2 pt-2.5 border-t border-gray-100 mt-auto">
            <button
              onClick={() => setShowDetails(true)}
              className="btn-ghost flex-auto text-xs py-1 px-3 border border-gray-200
                hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50
                transition-all duration-150 rounded-lg max-w-[120px]"
            >
              <Eye className="w-3.5 h-3.5 shrink-0" /> Details
            </button>
            <button
              onClick={handlePlaceOrder}
              className="btn-primary flex-auto text-xs py-1 px-3 rounded-lg max-w-[120px]"
            >
              <ShoppingCart className="w-3.5 h-3.5 shrink-0" /> Order
            </button>
          </div>
        </div>
      </div>

      {/* ── View Details Modal ────────────────────────────────────────── */}
      {showDetails && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setShowDetails(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-down">
            {/* Modal image */}
            <div className="relative h-52 bg-gray-100">
              {item.image && (
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              )}
              <button
                onClick={() => setShowDetails(false)}
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center
                  justify-center shadow hover:bg-white transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
              {/* Badges */}
              <div className="absolute bottom-3 left-3 flex gap-2">
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${catStyle.bg} ${catStyle.text}`}>
                  {item.category}
                </span>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${item.condition === 'New' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                  }`}>
                  {item.condition}
                </span>
              </div>
            </div>

            {/* Modal content */}
            <div className="p-5">
              <h2 className="text-base font-bold text-gray-900 mb-3">{item.title}</h2>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Tag className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="font-semibold text-gray-900 text-base">
                    ${item.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Posted by <strong>{item.seller}</strong></span>
                </div>
                {item.lat && item.lng && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{item.lat.toFixed(4)}°, {item.lng.toFixed(4)}°</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setShowDetails(false)}
                  className="btn-secondary flex-1"
                >
                  Close
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="btn-primary flex-1 shadow-md hover:shadow-lg"
                >
                  <ShoppingCart className="w-4 h-4" /> Place Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
