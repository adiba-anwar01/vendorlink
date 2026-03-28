import { useState } from 'react';
import { Search, Package2 } from 'lucide-react';
import { orders as initialOrders } from '../data/mockData';
import Badge from '../components/ui/Badge';
import { formatDate } from '../components/utils/dateUtils';
import { formatPrice } from '../components/utils/priceUtils';
import InputWithIcon from '../components/ui/InputWithIcon';

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Completed'];

const statusColors = {
  Pending:   'bg-amber-50  border-l-4 border-amber-400',
  Confirmed: 'bg-blue-50   border-l-4 border-blue-400',
  Completed: 'bg-emerald-50 border-l-4 border-emerald-400',
};

export default function Orders() {
  const [orders, setOrders]           = useState(initialOrders);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filtered = orders.filter((o) => {
    const matchSearch = o.product_title.toLowerCase().includes(search.toLowerCase()) ||
                        o.buyer_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const updateStatus = (id, newStatus) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: newStatus } : o));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-400 mt-0.5">{orders.length} total orders</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {STATUS_OPTIONS.map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          const total = orders.filter((o) => o.status === s).reduce((acc, o) => acc + o.price, 0);
          const icons = { Pending: '⏳', Confirmed: '✅', Completed: '🏁' };
          return (
            <div key={s} className={`card p-4 hover:-translate-y-1 transition-all duration-200 hover:shadow-lg`}>
              <div className="flex items-center gap-2 mb-2">
                <span>{icons[s]}</span>
                <Badge status={s} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-400 mt-0.5">{formatPrice(total)} total value</p>
            </div>
          );
        })}
      </div>

      {/* Search + Filter */}
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

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Order ID', 'Product', 'Buyer', 'Price', 'Status', 'Date', 'Update Status'].map((h) => (
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
                  <td colSpan={7}>
                    <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
                      <Package2 className="w-8 h-8 text-gray-300" />
                      <p className="text-sm">No orders found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="table-row-hover">
                    <td className="px-5 py-4">
                      <code className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{order.id}</code>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-900 max-w-[180px] truncate">
                        {order.product_title}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-[10px] font-bold text-blue-600">
                            {order.buyer_name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{order.buyer_name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-gray-900">{formatPrice(order.price)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <Badge status={order.status} />
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-gray-400">{formatDate(order.date)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="input-field py-1.5 text-xs w-36"
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
