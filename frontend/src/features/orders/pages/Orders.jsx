import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Package2 } from "lucide-react";
import { getSellerOrders, updateOrderStatus } from "../api/orderApi";
import { formatDate } from "@/utils/dateUtils";
import { toast } from "react-toastify";
import { formatPrice } from "@/utils/priceUtils";
import { InputWithIcon, CustomSelect } from "@/components/ui";
import useAuthStore from "@/features/auth/hooks/useAuthStore";
import LoginPrompt from "@/features/auth/components/LoginPrompt";
import { cardClass, btnPrimary } from "@/utils/theme";
import { getVendorId } from "@/utils/userUtils";

const STAT_CARDS = [
  {
    label: "Placed",
    statuses: ["placed"],
  },
  {
    label: "Completed",
    statuses: ["completed"],
  },
];

const FILTER_OPTIONS = [
  { label: "All", value: "All" },
  { label: "Placed", value: "placed" },
  { label: "Completed", value: "completed" },
];

export default function Orders() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const vendor = useAuthStore((s) => s.vendor);
  const currentVendorId = getVendorId(vendor);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const loadRef = useRef(null);

  const tableRowHover = "transition-colors hover:bg-gray-50";

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getSellerOrders();
      const list = res.data?.orders ?? res.data ?? [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [currentVendorId]);

  async function handleStatusChange(orderId, newStatus) {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => (o._id ?? o.id) === orderId ? { ...o, status: newStatus } : o));
      toast.success('Order status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  }

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && loadRef.current) {
        loadRef.current();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [load]);

  useEffect(() => {
    loadRef.current = load;
  }, [load]);

  if (!isAuthenticated) {
    return (
      <LoginPrompt
        title="Login to View Orders"
        message="You need to be logged in to view and manage your orders."
      />
    );
  }

  const filtered = orders.filter((o) => {
    const product = o.product ?? {};
    const buyer = o.buyer ?? {};
    const title = product.title ?? "";
    const buyerName = buyer.name ?? buyer.email ?? "";
    const matchSearch =
      title.toLowerCase().includes(search.toLowerCase()) ||
      buyerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400 animate-pulse">Loading orders…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${cardClass} p-8 text-center`}>
        <p className="text-sm text-red-500 font-medium">{error}</p>
        <button onClick={load} className={`${btnPrimary} mt-4`}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders Received</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {orders.length} total orders
        </p>
      </div>

      <div className={`${cardClass} p-3 sm:p-4`}>
        <div className="flex flex-col xl:flex-row items-center gap-4 w-full">
          <div className="w-full xl:w-1/2">
            <InputWithIcon
              icon={Search}
              className="w-full"
              placeholder="Search by product or buyer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="w-full xl:w-1/2 flex flex-wrap items-center justify-start gap-3">
            {STAT_CARDS.map((card) => {
              const count = orders.filter((o) =>
                card.statuses.includes(o.status),
              ).length;
              const total = orders
                .filter((o) => card.statuses.includes(o.status))
                .reduce(
                  (acc, o) => acc + (o.totalAmount ?? o.priceAtOrder ?? o.product?.price ?? 0),
                  0,
                );

              return (
                <div
                  key={card.label}
                  className="rounded-[0.625rem] border border-gray-200 bg-white px-4 py-2 flex items-center justify-between cursor-default flex-1 min-w-[125px] w-full"
                >
                  <div className="flex items-center gap-2 text-gray-900">
                    <span className="text-base font-extrabold leading-none">{count}</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-700">{card.label}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">
                    {formatPrice(total)}
                  </span>
                </div>
              );
            })}

            <div className="w-[100px] shrink-0">
              <CustomSelect
                value={filterStatus}
                onChange={(val) => setFilterStatus(val)}
                options={FILTER_OPTIONS}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className={`${cardClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  "Order ID",
                  "Product",
                  "Buyer",
                  "Price",
                  "Date",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
                      <Package2 className="w-8 h-8 text-gray-300" />
                      <p className="text-sm">No orders yet</p>
                      <p className="text-xs text-gray-400">
                        Orders will appear here once buyers purchase your
                        products.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const orderId = order._id ?? order.id;
                  const product = order.product ?? {};
                  const buyer = order.buyer ?? {};
                  const title = product.title ?? "Unknown Product";
                  const buyerName = buyer.name ?? buyer.email ?? "Unknown Buyer";
                  const price = order.totalAmount ?? order.priceAtOrder ?? product.price ?? 0;
                  const initials = buyerName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2);

                  return (
                    <tr key={orderId} className={tableRowHover}>
                      <td className="px-5 py-4">
                        <code className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                          {String(orderId).slice(-8)}
                        </code>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900 max-w-[180px] truncate">
                          {title}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-gradient-to-r from-brand-500/20 to-indigo-500/20 rounded-full flex items-center justify-center">
                            <span className="text-[10px] font-bold text-gray-900">
                              {initials}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{buyerName}</p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-gray-900">
                          {formatPrice(price)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-xs text-gray-400">
                          {formatDate(order.createdAt)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <CustomSelect
                          value={order.status || "placed"}
                          onChange={(val) => handleStatusChange(orderId, val)}
                          options={[
                            { label: "Placed", value: "placed" },
                            { label: "Completed", value: "completed" }
                          ]}
                          className="w-32"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
