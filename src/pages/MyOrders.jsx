import useMyOrdersStore from '../store/useMyOrdersStore';
import { ShoppingBag, Package, Clock } from 'lucide-react';
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
  const myOrders = useMyOrdersStore((s) => s.myOrders);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        </div>
        <span className="text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full">
          {myOrders.length} order{myOrders.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Empty state */}
      {myOrders.length === 0 ? (
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
          {myOrders.map((order) => {
            const sc = STATUS_COLORS[order.status] || STATUS_COLORS.Pending;
            return (
              <div
                key={order.id}
                className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow duration-200"
              >
                {/* Image */}
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  {order.image
                    ? <img src={order.image} alt={order.title} className="w-full h-full object-cover" />
                    : <Package className="w-8 h-8 text-gray-300 m-auto mt-4" />
                  }
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{order.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Seller: {order.seller} · {order.category} · {order.condition}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Clock className="w-3 h-3 text-gray-300 shrink-0" />
                    <span className="text-[11px] text-gray-400">{timeAgo(order.placedAt)}</span>
                  </div>
                </div>

                {/* Price + status */}
                <div className="text-right shrink-0">
                  <p className="text-base font-bold text-gray-900">{formatPrice(order.price)}</p>
                  <span className={`inline-block mt-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                    {order.status}
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
