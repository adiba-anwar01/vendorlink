import { useState, useEffect } from 'react';
import { ShoppingBag, Package, Clock } from 'lucide-react';
import { getMyOrders } from '../api/orderApi'; // GET /api/orders/my/orders
import { formatPrice } from '../components/utils/priceUtils';

const STATUS_COLORS = {
  Pending:   { bg: 'bg-amber-100',  text: 'text-amber-700'  },
  Confirmed: { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  Delivered: { bg: 'bg-emerald-100',text: 'text-emerald-700'},
  Cancelled: { bg: 'bg-red-100',    text: 'text-red-600'    },
};

function timeAgo(isoStr) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function MyOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        // GET /api/orders/my/orders — fetch all orders placed by the logged-in buyer
        const res  = await getMyOrders();
        const list = res.data?.orders ?? res.data ?? [];
        if (isMounted) setOrders(Array.isArray(list) ? list : []);
      } catch (err) {
        if (isMounted) setError(err.response?.data?.message || 'Failed to load your orders.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400 animate-pulse">Loading your orders…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-red-500 font-medium">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        </div>
        <span className="text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full">
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Empty state */}
      {orders.length === 0 ? (
        <div className="card p-16 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-blue-300" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">No orders yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Go to <strong>Explore Items</strong> and place your first order.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const status = order.status ?? 'Pending';
            const sc     = STATUS_COLORS[status] || STATUS_COLORS.Pending;

            // Safely pull nested product fields from the populated order object
            const product   = order.product ?? {};
            const title     = product.title    ?? 'Unknown Product';
            const image     = product.images?.[0] ?? product.image ?? null;
            const price     = product.price    ?? order.price ?? 0;
            const category  = product.category ?? '—';
            const condition = product.condition ?? '—';
            const seller    = product.seller?.name ?? product.seller?.email ?? '—';
            const placedAt  = order.createdAt  ?? order.placedAt;

            return (
              <div
                key={order._id ?? order.id}
                className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow duration-200"
              >
                {/* Product image */}
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  {image
                    ? <img src={image} alt={title} className="w-full h-full object-cover" />
                    : <Package className="w-8 h-8 text-gray-300 m-auto mt-4" />
                  }
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Seller: {seller} · {category} · {condition}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Clock className="w-3 h-3 text-gray-300 shrink-0" />
                    <span className="text-[11px] text-gray-400">{placedAt ? timeAgo(placedAt) : '—'}</span>
                  </div>
                </div>

                {/* Price + status */}
                <div className="text-right shrink-0">
                  <p className="text-base font-bold text-gray-900">{formatPrice(price)}</p>
                  <span className={`inline-block mt-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                    {status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
