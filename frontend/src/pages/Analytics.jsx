import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Eye, MessageSquare, ShoppingBag } from 'lucide-react';
import { monthlyOrders, productViews, inquiriesPerProduct } from '../data/mockData';
import StatCard from '../components/ui/StatCard';
import { formatPrice } from '../components/utils/priceUtils';

const BLUE = '#3b82f6';
const BLUE2 = '#60a5fa';
const GRAY = '#94a3b8';

const tooltipStyle = {
  contentStyle: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  },
  itemStyle: { color: '#1e3a5f' },
};

const ChartCard = ({ title, children }) => (
  <div className="card p-5 hover:shadow-lg transition-shadow duration-200">
    <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
      <span className="w-1 h-4 bg-blue-500 rounded-full inline-block" />
      {title}
    </h3>
    {children}
  </div>
);

export default function Analytics() {
  const totalRevenue = monthlyOrders.reduce((s, m) => s + m.revenue, 0);
  const totalViews = productViews.reduce((s, p) => s + p.views, 0);
  const totalInquiries = inquiriesPerProduct.reduce((s, p) => s + p.inquiries, 0);

  const shortViews = productViews.map((p) => ({ ...p, product: p.product.split(' ').slice(-1)[0] }));
  const shortInquiries = inquiriesPerProduct.map((p) => ({ ...p, product: p.product.split(' ').slice(-1)[0] }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-400 mt-0.5">Performance overview for your store.</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={ShoppingBag} label="Total Revenue" value={formatPrice(totalRevenue)} color="blue" />
        <StatCard icon={Eye} label="Total Views" value={totalViews} color="black" />
        <StatCard icon={MessageSquare} label="Total Inquiries" value={totalInquiries} color="amber" />
        <StatCard icon={TrendingUp} label="Conversion Rate" value="N/A" color="green" />
      </div>

      <ChartCard title="Monthly Orders & Revenue">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={monthlyOrders}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} />
            <Line yAxisId="left" type="monotone" dataKey="orders" stroke={BLUE} strokeWidth={2.5} dot={{ r: 4, fill: BLUE, stroke: '#fff', strokeWidth: 2 }} name="Orders" />
            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke={GRAY} strokeWidth={2} dot={{ r: 4, fill: GRAY, stroke: '#fff', strokeWidth: 2 }} name="Revenue (₹)" strokeDasharray="5 3" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Product Views">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={shortViews} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="product" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="views" fill={BLUE} radius={[8, 8, 0, 0]} name="Views" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Inquiries per Product">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={shortInquiries}>
              <defs>
                <linearGradient id="inqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BLUE} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="product" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="inquiries" stroke={BLUE} strokeWidth={2.5} fill="url(#inqGrad)" name="Inquiries" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
