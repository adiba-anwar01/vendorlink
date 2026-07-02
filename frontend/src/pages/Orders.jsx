import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Search, Package2 } from 'lucide-react';
import { getSellerOrders, updateOrderStatus } from '../api/orderApi';
import Badge from '../components/ui/Badge';
import { formatDate } from '../components/utils/dateUtils';
import { formatPrice } from '../components/utils/priceUtils';
import InputWithIcon from '../components/ui/InputWithIcon';

const STATUS_OPTIONS = ['Pending', 'Completed'];

const STATUS_ICONS = { Pending: '⏳', Completed: '✅' };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [updatingIds, setUpdatingIds] = useState(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getSellerOrders();
      const list = res.data?.orders ?? res.data ?? [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleStatusChange(orderId, newStatus) {
    setUpdatingIds((prev) => new Set(prev).add(orderId));
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success(`Status updated to "${newStatus}".`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update status.');
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  }

  const filtered = orders.filter((o) => {
    const product = o.product ?? {};
    const buyer = o.buyer ?? {};
    const title = product.title ?? '';
    const buyerName = buyer.name ?? buyer.email ?? '';
    const matchSearch = title.toLowerCase().includes(search.toLowerCase()) ||
                        buyerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || o.status === filterStatus;
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
      <div className="card p-8 text-center">
        <p className="text-sm text-red-500 font-medium">{error}</p>
        <button onClick={load} className="btn-primary mt-4">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders Received</h1>
        <p className="text-sm text-gray-400 mt-0.5">{orders.length} total orders</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STATUS_OPTIONS.map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          const total = orders
            .filter((o) => o.status === s)
            .reduce((acc, o) => acc + (o.product?.price ?? 0), 0);
          return (
            <div key={s} className="card p-4 hover:-translate-y-1 transition-all duration-200 hover:shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <span>{STATUS_ICONS[s]}</span>
                <Badge status={s} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-400 mt-0.5">{formatPrice(total)} value</p>
            </div>
          );
        })}
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <InputWithIcon
          icon={Search}
          className="flex-1"
          placeholder="Search by product or buyer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field w-auto"
        >
          <option value="All">All Status</option>
          {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Order ID', 'Product', 'Buyer', 'Price', 'Date', 'Status'].map((h) => (
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
                        Orders will appear here once buyers purchase your products.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const orderId = order._id ?? order.id;
                  const product = order.product ?? {};
                  const buyer = order.buyer ?? {};
                  const buyerName = buyer.name ?? buyer.email ?? 'Unknown Buyer';
                  const initials = buyerName.split(' ').map((n) => n[0]).join('').slice(0, 2);
                  const isUpdating = updatingIds.has(orderId);

                  return (
                    <tr key={orderId} className="table-row-hover">
                      <td className="px-5 py-4">
                        <code className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                          {String(orderId).slice(-8)}
                        </code>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900 max-w-[180px] truncate">
                          {product.title ?? 'Unknown Product'}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-[10px] font-bold text-blue-600">{initials}</span>
                          </div>
                          <p className="text-sm text-gray-700">{buyerName}</p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-gray-900">
                          {formatPrice(product.price ?? 0)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={order.status ?? 'Pending'}
                          disabled={isUpdating}
                          onChange={(e) => handleStatusChange(orderId, e.target.value)}
                          className={`input-field text-xs py-1 px-2 w-auto rounded-lg
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${order.status === 'Pending' ? 'border-amber-300' : ''}
                            ${order.status === 'Completed' ? 'border-blue-300' : ''}
              
                          `}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
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
