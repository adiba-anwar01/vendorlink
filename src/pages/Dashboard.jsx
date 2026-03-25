import { useState, useMemo } from 'react';
import {
  MessageSquare, ShoppingBag,
  Clock, ArrowRight, TrendingUp, ArrowUpDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { products, orders, conversations, userListings } from '../data/mockData';
import Badge from '../components/ui/Badge';
import UserItemCard from '../components/ui/UserItemCard';
import { formatDistanceToNow } from '../components/utils/dateUtils';

// Hero carousel slides (purely visual - CSS animation)
const heroSlides = [
  {
    img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80',
    title: 'Latest Mobile Deals',
    subtitle: 'Browse top-rated smartphones listed by users near you',
    badge: '📱 Mobiles',
    cta: 'Electronics & More →',
    overlay: 'from-blue-900/80 via-blue-800/50 to-transparent',
  },
  {
    img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&auto=format&fit=crop&q=80',
    title: 'Premium Furniture',
    subtitle: 'Find quality second-hand furniture at unbeatable prices',
    badge: '🪑 Furniture',
    cta: 'Shop Furniture →',
    overlay: 'from-amber-900/80 via-amber-700/50 to-transparent',
  },
  {
    img: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=1200&auto=format&fit=crop&q=80',
    title: 'Top Electronics',
    subtitle: 'Laptops, tablets, gaming gear — all in one place',
    badge: '💻 Electronics',
    cta: 'Explore Listings →',
    overlay: 'from-gray-900/80 via-gray-800/50 to-transparent',
  },
];

const FILTER_CATS = ['All', 'Mobile', 'Electronics', 'Furniture'];

export default function Dashboard() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');

  const activeProducts = products.filter((p) => p.status === 'Active').length;

  // Recent activity: merge last messages + last orders
  const recentActivity = [
    ...conversations.map((c) => {
      const lastMsg = c.messages[c.messages.length - 1];
      return {
        type: 'message', id: `msg-${c.conversation_id}`,
        text: lastMsg.message_text, time: lastMsg.timestamp,
        label: 'New message', link: '/conversations',
      };
    }),
    ...orders.slice(0, 3).map((o) => ({
      type: 'order', id: `ord-${o.id}`,
      text: `Order for ${o.product_title}`, time: o.date,
      label: 'Order received', link: '/orders',
    })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

  const PREVIEW_LIMIT = 10; // 4 columns, 3 rows max (showing 10 total)

  // Filter + sort user listings (preview only — limited to PREVIEW_LIMIT items)
  const filteredListings = useMemo(() => {
    let list = activeCategory === 'All'
      ? userListings
      : userListings.filter((i) => i.category === activeCategory);

    return [...list]
      .sort((a, b) =>
        sortOrder === 'newest'
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt)
      )
      .slice(0, PREVIEW_LIMIT);
  }, [activeCategory, sortOrder]);

  const recentlyAdded = [...userListings]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  return (
    <div className="space-y-8">

      {/* ── Hero Carousel ───────────────────────────────────────────────── */}
      <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden shadow-lg">
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            className="hero-slide"
          >
            <img
              src={slide.img}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlay}`} />
            {/* Text content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
              <span className="text-xs font-semibold bg-white/20 backdrop-blur-sm text-white
                px-3 py-1 rounded-full w-fit mb-3">
                {slide.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 drop-shadow">
                {slide.title}
              </h2>
              <p className="text-sm text-white/80 mb-4 max-w-md">
                {slide.subtitle}
              </p>
              <button className="w-fit text-sm font-semibold text-white bg-white/20 backdrop-blur-sm
                hover:bg-white/30 transition-all px-4 py-2 rounded-xl border border-white/30">
                {slide.cta}
              </button>
            </div>
          </div>
        ))}
        {/* Slide indicators */}
        <div className="absolute bottom-4 right-6 flex gap-1.5">
          {heroSlides.map((_, i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/60" />
          ))}
        </div>
      </div>

      {/* ── Category Filter + User Listed Items ──────────────────────── */}
      <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mt-10">
        {/* Section header */}
        <div className="flex flex-col items-center text-center gap-1.5 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Browse Listings</h2>
          <p className="text-sm text-gray-500">Items listed by users — ready to order</p>
        </div>

        {/* Filters & Sort row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2">
            {FILTER_CATS.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`filter-btn ${activeCategory === cat ? 'active shadow-md scale-105' : ''}`}
              >
                {cat === 'Mobile' && '📱 '}
                {cat === 'Electronics' && '💻 '}
                {cat === 'Furniture' && '🪑 '}
                {cat === 'All' && '✨ '}
                {cat}
              </button>
            ))}
            <span className="filter-btn cursor-default opacity-60 ml-2">
              {filteredListings.length} items
            </span>
          </div>

          {/* Sort toggle */}
          <button
            onClick={() => setSortOrder((s) => s === 'newest' ? 'oldest' : 'newest')}
            className="flex items-center gap-2 text-sm font-medium text-gray-600
              hover:text-blue-600 bg-gray-50 border border-gray-200 hover:border-blue-300
              px-3.5 py-2 rounded-xl transition-all self-start sm:self-auto"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
          </button>
        </div>

        {/* Items grid */}
        {filteredListings.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-400">No listings in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredListings.map((item) => (
              <UserItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* View All button */}
        <div className="flex justify-center mt-6">
          <Link
            to="/explore-items"
            className="btn-primary px-8 py-3 text-sm shadow-md"
          >
            View All in Explore Items →
          </Link>
        </div>
      </section>

      {/* ── Recently Added ──────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recently Added</h2>
          <span className="text-xs text-gray-400">Last 4 listings</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentlyAdded.map((item) => (
            <div key={item.id} className="card card-hover overflow-hidden group flex items-center gap-3 p-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.title}</p>
                <p className="text-xs text-gray-400">{item.category}</p>
                <p className="text-sm font-bold text-blue-600 mt-0.5">${item.price.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Recent Activity + Orders ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="space-y-1">
            {recentActivity.map((item) => (
              <Link
                to={item.link}
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.type === 'message' ? 'bg-blue-50' : 'bg-amber-50'
                  }`}>
                  {item.type === 'message'
                    ? <MessageSquare className="w-4 h-4 text-blue-500" />
                    : <ShoppingBag className="w-4 h-4 text-amber-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{item.text}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-400">{formatDistanceToNow(item.time)}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-gray-400" /> Recent Orders
            </h2>
            <Link to="/orders" className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 4).map((order) => (
              <div key={order.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{order.product_title}</p>
                  <p className="text-[11px] text-gray-400">{order.buyer_name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-gray-900">${order.price}</p>
                  <Badge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Top Products ────────────────────────────────────────────────── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500 " /> Top Products by Views
          </h2>
          <Link to="/products" className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors">
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {[...products].sort((a, b) => b.views - a.views).slice(0, 4).map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-700"
                      style={{ width: `${Math.round((p.views / 305) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-gray-400 shrink-0">{p.views} views</span>
                </div>
              </div>
              <Badge status={p.status} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
