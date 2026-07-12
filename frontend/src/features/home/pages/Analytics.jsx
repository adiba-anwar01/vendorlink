import { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { getSellerOrders } from '@/features/orders/api/orderApi';
import { formatPrice } from '@/utils/priceUtils';
import useAuthStore from '@/features/auth/hooks/useAuthStore';
import LoginPrompt from '@/features/auth/components/LoginPrompt';
import {
  ANALYTICS_CATEGORIES,
  ANALYTICS_CATEGORY_LABELS,
  ANALYTICS_CATEGORY_COLORS,
  MONTHS,
} from '@/constants/order';

const LINE_TOOLTIP = {
  contentStyle: {
    background: '#fff',
    border: '1px solid #e4e4e7',
    borderRadius: 12,
    fontSize: 12,
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    padding: '10px 14px',
  },
  itemStyle: { color: '#3f3f46', fontWeight: 500 },
  labelStyle: { color: '#18181b', fontWeight: 700, marginBottom: 4 },
};

function SummaryCard({ icon: Icon, label, value, iconGradient, accentColor }) {
  return (
    <div className="bg-white rounded-[0.875rem] border border-[#e9e9ec] shadow-[0_1px_4px_rgba(0,0,0,0.05)] hover:-translate-y-[3px] hover:shadow-[0_10px_24px_-4px_rgba(0,0,0,0.1)] transition-all duration-200 flex flex-col items-center justify-center gap-1.5 py-3 px-4 overflow-hidden relative text-center">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 z-10"
        style={{ background: iconGradient }}
      >
        <Icon size={16} color="#fff" strokeWidth={2.2} />
      </div>
      <div className="z-10">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="mt-0.5 text-2xl font-extrabold leading-none tracking-tight" style={{ color: accentColor }}>
          {value}
        </p>
      </div>
      <div
        className="absolute top-0 right-0 w-full h-full pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${accentColor}12, transparent 65%)` }}
      />
    </div>
  );
}

function ChartShell({ title, subtitle, right, children }) {
  return (
    <div className="bg-white rounded-[0.875rem] border border-[#e9e9ec] shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-5 pb-6">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-5">
        <div>
          <p className="text-[0.9375rem] font-bold text-gradient-primary">{title}</p>
          {subtitle && <p className="mt-0.5 text-[0.8rem] text-gray-400">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function MonthPicker({ year, month, onChange }) {
  const now = new Date();
  const atMax = year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth());
  const prev = () => month === 0 ? onChange(year - 1, 11) : onChange(year, month - 1);
  const next = () => { if (!atMax) month === 11 ? onChange(year + 1, 0) : onChange(year, month + 1); };
  return (
    <div className="flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-full px-2 py-1">
      <button
        className="flex items-center justify-center bg-transparent border-none text-gray-600 cursor-pointer rounded-full p-1 hover:bg-gray-200 transition-colors"
        onClick={prev}
      >
        <ChevronLeft size={14} />
      </button>
      <span className="text-[0.8125rem] font-bold text-gray-900 min-w-[76px] text-center">
        {MONTHS[month]} {year}
      </span>
      <button
        className={`flex items-center justify-center bg-transparent border-none text-gray-600 rounded-full p-1 transition-colors ${atMax ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-200'}`}
        onClick={next}
        disabled={atMax}
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

function DonutCenter({ viewBox, total, label, formatter }) {
  const { cx, cy } = viewBox;
  return (
    <>
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#18181b"
        style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Inter,sans-serif' }}>
        {formatter ? formatter(total) : total}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#a1a1aa"
        style={{ fontSize: 11, fontWeight: 500, fontFamily: 'Inter,sans-serif' }}>
        {label}
      </text>
    </>
  );
}

function DonutTooltip({ active, payload, formatter }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 shadow-lg text-xs">
      <p className="font-semibold text-gray-900">{name}</p>
      <p className="mt-0.5 text-gray-700">{formatter ? formatter(value) : value}</p>
    </div>
  );
}

function CatLegend({ data }) {
  return (
    <div className="flex flex-col gap-[0.45rem] mt-4 w-full">
      {ANALYTICS_CATEGORY_LABELS.map((lbl, i) => (
        <div key={lbl} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: ANALYTICS_CATEGORY_COLORS[i] }} />
          <span className="flex-1 text-[0.8rem] text-gray-600">{lbl}</span>
          <span className="text-[0.8rem] font-semibold text-gray-900">{data[i]?.value ?? 0}</span>
        </div>
      ))}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3.5">
      <div className="w-8 h-8 rounded-full border-[3px] border-gray-200 border-t-brand-500 animate-spin" />
      <p className="text-[13px] text-gray-400">Loading analytics…</p>
    </div>
  );
}

export default function Analytics() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const vendor = useAuthStore((s) => s.vendor);
  const currentVendorId = vendor?._id ?? vendor?.id ?? null;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState(null);

  const now = new Date();
  const [selYear, setSelYear] = useState(now.getFullYear());
  const [selMonth, setSelMonth] = useState(now.getMonth());

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadOrders = async () => {
      setLoading(true);
      const res = await getSellerOrders();
      const list = res.data?.orders ?? res.data ?? [];
      setOrders(Array.isArray(list) ? list : []);
    };

    loadOrders()
      .catch(() => setFetchErr('Could not load orders. Please refresh.'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, currentVendorId]);

  const active = useMemo(() => orders, [orders]);

  const totalRevenue = useMemo(() => active.reduce((s, o) => s + (o.totalAmount ?? o.priceAtOrder ?? o.product?.price ?? 0), 0), [active]);
  const totalOrders = active.length;

  const monthlyData = useMemo(() => {
    const map = MONTHS.map((m) => ({ month: m, orders: 0, revenue: 0 }));
    active.forEach((o) => {
      const d = new Date(o.createdAt);
      if (d.getFullYear() === selYear) {
        map[d.getMonth()].orders += 1;
        map[d.getMonth()].revenue += o.totalAmount ?? o.priceAtOrder ?? o.product?.price ?? 0;
      }
    });
    return map;
  }, [active, selYear]);

  const hasMonthlyData = useMemo(
    () => monthlyData.some((d) => d.orders > 0 || d.revenue > 0),
    [monthlyData]
  );

  const catRevData = useMemo(() => {
    const acc = Object.fromEntries(ANALYTICS_CATEGORIES.map((c, i) => [c, { name: ANALYTICS_CATEGORY_LABELS[i], value: 0 }]));
    active.forEach((o) => {
      const d = new Date(o.createdAt);
      if (d.getFullYear() === selYear && d.getMonth() === selMonth) {
        const cat = (o.product?.category || 'other').toLowerCase();
        const key = ANALYTICS_CATEGORIES.includes(cat) ? cat : 'other';
        acc[key].value += o.totalAmount ?? o.priceAtOrder ?? o.product?.price ?? 0;
      }
    });
    return ANALYTICS_CATEGORIES.map((c) => acc[c]);
  }, [active, selYear, selMonth]);

  const catOrdData = useMemo(() => {
    const acc = Object.fromEntries(ANALYTICS_CATEGORIES.map((c, i) => [c, { name: ANALYTICS_CATEGORY_LABELS[i], value: 0 }]));
    active.forEach((o) => {
      const d = new Date(o.createdAt);
      if (d.getFullYear() === selYear && d.getMonth() === selMonth) {
        const cat = (o.product?.category || 'other').toLowerCase();
        const key = ANALYTICS_CATEGORIES.includes(cat) ? cat : 'other';
        acc[key].value += 1;
      }
    });
    return ANALYTICS_CATEGORIES.map((c) => acc[c]);
  }, [active, selYear, selMonth]);

  const totalCatRev = catRevData.reduce((s, d) => s + d.value, 0);
  const totalCatOrd = catOrdData.reduce((s, d) => s + d.value, 0);

  const safeRev = totalCatRev > 0 ? catRevData : [{ name: 'No data', value: 1, ghost: true }];
  const safeOrd = totalCatOrd > 0 ? catOrdData : [{ name: 'No data', value: 1, ghost: true }];

  if (!isAuthenticated) return (
    <LoginPrompt
      title="Login to View Analytics"
      message="You need to be logged in to view your store analytics."
    />
  );
  if (loading) return <Spinner />;
  if (fetchErr) return (
    <div className="bg-red-50 rounded-[0.875rem] border border-red-200 shadow-[0_1px_4px_rgba(0,0,0,0.05)] px-6 py-5">
      <p className="text-red-500 font-semibold text-sm">{fetchErr}</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-5 pb-10 page-enter">

      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-gray-400">Revenue &amp; order insights for your store</p>
        </div>
        <span className="self-center bg-gray-100 border border-gray-200 rounded-full px-4 py-1.5 text-[0.8125rem] font-semibold text-gray-600">
          {selYear}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto w-full">
        <SummaryCard
          icon={TrendingUp}
          label="Total Revenue"
          value={formatPrice(totalRevenue)}
          iconGradient="linear-gradient(90deg, #A855F7 0%, #8B5CF6 50%, #6366F1 100%)"
          accentColor="#8b5cf6"
        />
        <SummaryCard
          icon={ShoppingBag}
          label="Total Orders"
          value={totalOrders.toLocaleString()}
          iconGradient="linear-gradient(90deg, #A855F7 0%, #8B5CF6 50%, #6366F1 100%)"
          accentColor="#8b5cf6"
        />
      </div>

      <ChartShell
        title="Monthly Performance"
        subtitle={`Revenue & orders month-by-month in ${selYear}`}
      >
        <ResponsiveContainer width="100%" height={268}>
          <LineChart data={monthlyData} margin={{ top: 8, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
              <linearGradient id="ordLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="l" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} width={32} allowDecimals={false}
              {...(!hasMonthlyData && { domain: [0, 1], ticks: [0] })} />
            <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} width={60}
              tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
              {...(!hasMonthlyData && { domain: [0, 1], ticks: [0] })} />
            <Tooltip {...LINE_TOOLTIP} formatter={(v, n) => n === 'Revenue (₹)' ? [formatPrice(v), n] : [v, n]} />
            <Legend iconType="circle" iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingTop: 14, color: '#52525b' }} />
            <Line yAxisId="l" type="monotone" dataKey="orders" name="Orders"
              stroke="url(#ordLine)" strokeWidth={2.5}
              dot={{ r: 3.5, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 5.5 }} />
            <Line yAxisId="r" type="monotone" dataKey="revenue" name="Revenue (₹)"
              stroke="url(#revLine)" strokeWidth={2.5}
              dot={{ r: 3.5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 5.5 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartShell>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-base font-bold text-gray-900">Category Distribution</p>
          <p className="mt-0.5 text-[0.8rem] text-gray-400">Orders &amp; revenue per category for the selected month</p>
        </div>
        <MonthPicker
          year={selYear} month={selMonth}
          onChange={(y, m) => { setSelYear(y); setSelMonth(m); }}
        />
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>

        <ChartShell title="Revenue by Category" subtitle={`${MONTHS[selMonth]} ${selYear}`}>
          <div className="flex flex-col items-center">
            <PieChart width={220} height={220}>
              <Pie data={safeRev} dataKey="value" cx="50%" cy="50%"
                innerRadius={64} outerRadius={100} paddingAngle={totalCatRev > 0 ? 2 : 0}
                strokeWidth={0} isAnimationActive>
                {safeRev.map((_, i) =>
                  <Cell key={i}
                    fill={_.ghost ? '#e4e4e7' : ANALYTICS_CATEGORY_COLORS[i % ANALYTICS_CATEGORY_COLORS.length]}
                    opacity={_.ghost ? 0.6 : 1} />
                )}
                <DonutCenter
                  viewBox={{ cx: 110, cy: 110 }}
                  total={totalCatRev}
                  label={totalCatRev > 0 ? 'revenue' : 'no data'}
                  formatter={totalCatRev > 0 ? formatPrice : () => '₹0'}
                />
              </Pie>
              <Tooltip content={<DonutTooltip formatter={formatPrice} />} />
            </PieChart>
            {!totalCatRev && <p className="mt-2 text-[0.8rem] text-gray-400 text-center">No revenue data available yet</p>}
          </div>
          <CatLegend data={catRevData} />
        </ChartShell>

        <ChartShell title="Orders by Category" subtitle={`${MONTHS[selMonth]} ${selYear}`}>
          <div className="flex flex-col items-center">
            <PieChart width={220} height={220}>
              <Pie data={safeOrd} dataKey="value" cx="50%" cy="50%"
                innerRadius={64} outerRadius={100} paddingAngle={totalCatOrd > 0 ? 2 : 0}
                strokeWidth={0} isAnimationActive>
                {safeOrd.map((_, i) =>
                  <Cell key={i}
                    fill={_.ghost ? '#e4e4e7' : ANALYTICS_CATEGORY_COLORS[i % ANALYTICS_CATEGORY_COLORS.length]}
                    opacity={_.ghost ? 0.6 : 1} />
                )}
                <DonutCenter
                  viewBox={{ cx: 110, cy: 110 }}
                  total={totalCatOrd}
                  label={totalCatOrd > 0 ? 'orders' : 'no data'}
                />
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
            {!totalCatOrd && <p className="mt-2 text-[0.8rem] text-gray-400 text-center">No orders data available yet</p>}
          </div>
          <CatLegend data={catOrdData} />
        </ChartShell>

      </div>
    </div>
  );
}
