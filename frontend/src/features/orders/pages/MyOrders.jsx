import { useState, useEffect } from "react";
import { ShoppingBag, Package, Clock } from "lucide-react";
import { getMyOrders } from "../api/orderApi";
import { formatPrice } from "@/utils/priceUtils";
import { formatDistanceToNow } from "@/utils/dateUtils";
import useAuthStore from "@/features/auth/hooks/useAuthStore";
import LoginPrompt from "@/features/auth/components/LoginPrompt";

const STATUS_COLORS = {
  placed: { bg: "bg-gradient-to-r from-brand-500/10 to-indigo-500/10 border border-brand-500/20", text: "text-gray-900" },
  completed: { bg: "bg-gradient-to-r from-brand-500/20 to-indigo-500/20", text: "text-gray-900" },
};

export default function MyOrders() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await getMyOrders();
        const list = res.data?.orders ?? res.data ?? [];
        if (isMounted) setOrders(Array.isArray(list) ? list : []);
      } catch (err) {
        if (isMounted)
          setError(
            err.response?.data?.message || "Failed to load your orders.",
          );
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <LoginPrompt
        title="Login to View My Orders"
        message="You need to be logged in to view your order history."
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400 animate-pulse">
          Loading your orders…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-8 text-center">
        <p className="text-sm text-red-500 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-[0.625rem] bg-gradient-primary text-white text-sm font-medium hover:opacity-90 transition-colors mt-4"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        </div>
        <span className="text-sm font-semibold text-gray-900 bg-gradient-to-r from-brand-500/10 to-indigo-500/10 border border-brand-500/20 px-3 py-1.5 rounded-full">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-16 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-brand-500/10 to-indigo-500/10 rounded-2xl flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-brand-300" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">
              No orders yet
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Go to <strong>Explore Items</strong> and place your first order.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const status = order.status ?? "placed";
            const sc = STATUS_COLORS[status] || STATUS_COLORS.placed;

            const product = order.product ?? {};
            const title = product.title ?? "Unknown Product";
            const image = product.images?.[0] ?? product.image ?? null;
            const price = product.price ?? order.price ?? 0;
            const category = product.category ?? "—";
            const condition = product.condition ?? "—";
            const seller = order.seller?.name ?? order.seller?.email ?? "—";
            const placedAt = order.createdAt ?? order.placedAt;

            return (
              <div
                key={order._id ?? order.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-4 flex items-center gap-4 hover:-translate-y-1 hover:shadow-[0_12px_24px_-4px_rgba(0,0,0,0.1)] transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  {image ? (
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-gray-300 m-auto mt-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {title}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1 text-xs text-gray-500">
                    <p><span className="text-gray-400 mr-1">Seller:</span> <span className="font-medium text-gray-700">{seller}</span></p>
                    <p><span className="text-gray-400 mr-1">Category:</span> <span className="font-medium text-gray-700 capitalize">{category}</span></p>
                    <p><span className="text-gray-400 mr-1">Condition:</span> <span className="font-medium text-gray-700 capitalize">{condition}</span></p>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>{placedAt ? formatDistanceToNow(placedAt) : "—"}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-base font-bold text-gray-900">
                    {formatPrice(price)}
                  </p>
                  <span
                    className={`inline-block mt-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${sc.bg} ${sc.text}`}
                  >
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
