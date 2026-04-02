import { useState, useMemo, useEffect } from 'react';
import {
  MessageSquare,
  ShoppingBag,
  Clock,
  ArrowRight,
  ArrowUpDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api/productApi';
import { getMyConversations } from '../api/conversationApi';
import Badge from '../components/ui/Badge';
import UserItemCard from '../components/ui/UserItemCard';
import { formatDistanceToNow } from '../components/utils/dateUtils';
import { formatPrice } from '../components/utils/priceUtils';
import { getUserListedProducts } from '../components/utils/exploreItemUtils';

const heroSlides = [
  {
    img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80',
    title: 'Latest Mobile Deals',
    subtitle: 'Browse top-rated smartphones listed by users near you',
    badge: 'Mobiles',
    cta: 'Electronics & More ->',
    overlay: 'from-blue-900/80 via-blue-800/50 to-transparent',
  },
  {
    img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&auto=format&fit=crop&q=80',
    title: 'Premium Furniture',
    subtitle: 'Find quality second-hand furniture at unbeatable prices',
    badge: 'Furniture',
    cta: 'Shop Furniture ->',
    overlay: 'from-amber-900/80 via-amber-700/50 to-transparent',
  },
  {
    img: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=1200&auto=format&fit=crop&q=80',
    title: 'Top Electronics',
    subtitle: 'Laptops, tablets, gaming gear - all in one place',
    badge: 'Electronics',
    cta: 'Explore Listings ->',
    overlay: 'from-gray-900/80 via-gray-800/50 to-transparent',
  },
];

export default function Dashboard() {
  const [listings, setListings]             = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError]     = useState('');
  const [activeCategory, setActiveCategory]   = useState('All');
  const [sortOrder, setSortOrder]             = useState('newest');
  const [conversations, setConversations]     = useState([]);
  const [orders, setOrders]                   = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadListings() {
      setListingsLoading(true);
      setListingsError('');

      try {
        const res = await getProducts();
        const products = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.products)
            ? res.data.products
            : [];

        if (isMounted) {
          setListings(getUserListedProducts(products));
        }
      } catch (err) {
        if (isMounted) {
          setListingsError(err.response?.data?.message || 'Failed to load user listings.');
        }
      } finally {
        if (isMounted) {
          setListingsLoading(false);
        }
      }
    }

    loadListings();

    // Load conversations + derive orders from accepted ones
    getMyConversations()
      .then((res) => {
        const list = res.data?.conversations ?? res.data ?? [];
        const convArr = Array.isArray(list) ? list : [];
        setConversations(convArr);
        setOrders(
          convArr
            .filter((c) => c.status === 'accepted')
            .map((c) => {
              const latestOffer = [...(c.messages ?? [])].reverse().find(
                (m) => m.messageType === 'offer'
              );
              return {
                id:            c._id ?? c.id,
                product_title: c.product?.title ?? 'Unknown Product',
                buyer_name:    c.buyer?.name ?? c.buyer?.email ?? 'Unknown Buyer',
                price:         latestOffer?.offerPrice ?? c.product?.price ?? 0,
                status:        'Completed',
                date:          c.updatedAt ?? c.createdAt,
              };
            })
        );
      })
      .catch(() => {
        // Silently ignore dashboard widget errors — not critical
      });

    return () => { isMounted = false; };
  }, []);

  const recentActivity = [
    ...conversations.slice(0, 3).map((conv) => {
      const buyerName = conv.buyer?.name ?? conv.buyer?.email ?? 'Someone';
      return {
        type: 'message',
        id:   `msg-${conv._id ?? conv.id}`,
        text: `${buyerName} — ${conv.product?.title ?? 'a product'}`,
        time: conv.updatedAt ?? conv.createdAt,
        label: 'New conversation',
        link: `/conversations/${conv._id ?? conv.id}`,
      };
    }),
    ...orders.slice(0, 3).map((order) => ({
      type:  'order',
      id:    `ord-${order.id}`,
      text:  `Order for ${order.product_title}`,
      time:  order.date,
      label: 'Order received',
      link:  '/orders',
    })),
  ]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 5);

  const PREVIEW_LIMIT = 10;

  const filterCategories = useMemo(
    () => ['All', ...new Set(listings.map((item) => item.category).filter(Boolean))],
    [listings]
  );

  const filteredListings = useMemo(() => {
    const categoryFiltered =
      activeCategory === 'All'
        ? listings
        : listings.filter((item) => item.category === activeCategory);

    return [...categoryFiltered]
      .sort((a, b) =>
        sortOrder === 'newest'
          ? new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0)
          : new Date(a.createdAt ?? 0) - new Date(b.createdAt ?? 0)
      )
      .slice(0, PREVIEW_LIMIT);
  }, [activeCategory, listings, sortOrder]);

  const recentlyAdded = useMemo(
    () =>
      [...listings]
        .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
        .slice(0, 4),
    [listings]
  );

  return (
    <div className="space-y-8">
      <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden shadow-lg">
        {heroSlides.map((slide, index) => (
          <div key={index} className="hero-slide">
            <img src={slide.img} alt={slide.title} className="w-full h-full object-cover" />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlay}`} />
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
              <span
                className="text-xs font-semibold bg-white/20 backdrop-blur-sm text-white
                px-3 py-1 rounded-full w-fit mb-3"
              >
                {slide.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 drop-shadow">
                {slide.title}
              </h2>
              <p className="text-sm text-white/80 mb-4 max-w-md">{slide.subtitle}</p>
              <button
                className="w-fit text-sm font-semibold text-white bg-white/20 backdrop-blur-sm
                hover:bg-white/30 transition-all px-4 py-2 rounded-xl border border-white/30"
              >
                {slide.cta}
              </button>
            </div>
          </div>
        ))}
        <div className="absolute bottom-4 right-6 flex gap-1.5">
          {heroSlides.map((_, index) => (
            <span key={index} className="w-1.5 h-1.5 rounded-full bg-white/60" />
          ))}
        </div>
      </div>

      <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mt-10">
        <div className="flex flex-col items-center text-center gap-1.5 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Browse Listings
          </h2>
          <p className="text-sm text-gray-500">Items listed by users - ready to order</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {filterCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`filter-btn ${activeCategory === cat ? 'active shadow-md scale-105' : ''}`}
              >
                {cat}
              </button>
            ))}
            <span className="filter-btn cursor-default opacity-60 ml-2">
              {filteredListings.length} items
            </span>
          </div>

          <button
            onClick={() => setSortOrder((current) => (current === 'newest' ? 'oldest' : 'newest'))}
            className="flex items-center gap-2 text-sm font-medium text-gray-600
              hover:text-blue-600 bg-gray-50 border border-gray-200 hover:border-blue-300
              px-3.5 py-2 rounded-xl transition-all self-start sm:self-auto"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
          </button>
        </div>

        {listingsLoading ? (
          <div className="card p-12 text-center">
            <p className="text-gray-400">Loading listings...</p>
          </div>
        ) : listingsError ? (
          <div className="card p-12 text-center">
            <p className="text-red-500">{listingsError}</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-400">No listings in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 items-stretch">
            {filteredListings.map((item) => (
              <UserItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

        <div className="flex justify-center mt-6">
          <Link to="/explore-items" className="btn-primary px-8 py-3 text-sm shadow-md">
            View All in Explore Items {'->'}
          </Link>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recently Added</h2>
          <span className="text-xs text-gray-400">Last 4 listings</span>
        </div>

        {listingsLoading ? (
          <div className="card p-8 text-center">
            <p className="text-gray-400">Loading recent listings...</p>
          </div>
        ) : listingsError ? (
          <div className="card p-8 text-center">
            <p className="text-red-500">{listingsError}</p>
          </div>
        ) : recentlyAdded.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-gray-400">No recent user listings available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentlyAdded.map((item) => (
              <div
                key={item.id}
                className="card card-hover overflow-hidden group flex items-center gap-3 p-3"
              >
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
                  <p className="text-sm font-bold text-blue-600 mt-0.5">{formatPrice(item.price)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    item.type === 'message' ? 'bg-blue-50' : 'bg-amber-50'
                  }`}
                >
                  {item.type === 'message' ? (
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                  ) : (
                    <ShoppingBag className="w-4 h-4 text-amber-500" />
                  )}
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

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-gray-400" /> Recent Orders
            </h2>
            <Link
              to="/orders"
              className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 4).map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{order.product_title}</p>
                  <p className="text-[11px] text-gray-400">{order.buyer_name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-gray-900">{formatPrice(order.price)}</p>
                  <Badge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
