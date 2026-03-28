import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, ShoppingCart, Eye } from 'lucide-react';
import useMyOrdersStore from '../../store/useMyOrdersStore';

export default function UserItemCard({ item }) {
  const placeOrder = useMyOrdersStore((s) => s.placeOrder);
  const navigate   = useNavigate();
  const [orderSuccess, setOrderSuccess] = useState(false);

  const categoryColors = {
    Mobile:      { bg: 'bg-purple-100', text: 'text-purple-700' },
    Electronics: { bg: 'bg-blue-100',   text: 'text-blue-700'   },
    Furniture:   { bg: 'bg-amber-100',  text: 'text-amber-700'  },
  };
  const catStyle = categoryColors[item.category] || { bg: 'bg-gray-100', text: 'text-gray-600' };

  function handlePlaceOrder() {
    placeOrder(item);
    setOrderSuccess(true);
    setTimeout(() => setOrderSuccess(false), 3000);
  }

  return (
    <div className="card card-hover overflow-hidden group flex flex-col h-full">
      {/* Image — fixed height */}
      <div className="relative h-40 bg-gray-100 overflow-hidden shrink-0">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image className="w-8 h-8 text-gray-300" />
          </div>
        )}
        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${catStyle.bg} ${catStyle.text}`}>
            {item.category}
          </span>
        </div>
        {/* Condition badge */}
        <div className="absolute top-2 right-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            item.condition === 'New' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
          }`}>
            {item.condition}
          </span>
        </div>
      </div>

      {/* Content — flex grow, buttons pinned to bottom */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug mb-0.5">
          {item.title}
        </h3>
        <p className="text-[11px] text-gray-400 mb-1 truncate">By {item.seller}</p>

        <span className="text-sm font-bold text-gray-900 mb-1">
          ${item.price.toLocaleString()}
        </span>

        {/* Success banner */}
        {orderSuccess && (
          <div className="mb-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200
            rounded px-2 py-1 text-center font-medium">
            ✅ Ordered! Check My Orders.
          </div>
        )}

        {/* Actions — always at bottom */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100 mt-auto">
          <button
            onClick={() => navigate(`/explore-items/${item.id}`)}
            className="flex-1 flex items-center justify-center gap-1 text-[11px] font-medium
              py-1 px-2 rounded-lg border border-gray-200 text-gray-600
              hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            <Eye className="w-3 h-3 shrink-0" /> Details
          </button>
          <button
            onClick={handlePlaceOrder}
            className="flex-1 btn-primary text-[11px] py-1 px-2 rounded-lg"
          >
            <ShoppingCart className="w-3 h-3 shrink-0" /> Order
          </button>
        </div>
      </div>
    </div>
  );
}
