import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  ShoppingBag,
  Clock,
  ArrowRight,
  ArrowUpDown,
} from "lucide-react";
import { getProducts } from "@/features/products/api/productApi";
import { getMyConversations } from "@/features/conversations/api/conversationApi";
import { getSellerOrders } from "@/features/orders/api/orderApi";
import { UserItemCard } from "@/components/ui";
import { formatDistanceToNow } from "@/utils/dateUtils";
import { formatPrice } from "@/utils/priceUtils";
import { getUserListedProducts } from "@/features/explore/utils/exploreItemUtils";
import { PRODUCT_ORDERED_EVENT } from "@/utils/orderEvents";
import useAuthStore from "@/features/auth/hooks/useAuthStore";
import { ALL_CATEGORIES } from "@/constants/product";

import mobileImg from "@/assets/mobile.png";
import sofaImg from "@/assets/sofa.png";
import laptopImg from "@/assets/laptop.png";

const heroSlides = [
  {
    img: mobileImg,
    title: "Latest Mobile Deals",
    subtitle: "Browse top-rated smartphones listed by users near you",
    badge: "Mobiles",
    cta: "Electronics & More ->",
    overlay: "from-brand-900/40 via-brand-800/10 to-transparent",
  },
  {
    img: sofaImg,
    title: "Premium Furniture",
    subtitle: "Find quality second-hand furniture at unbeatable prices",
    badge: "Furniture",
    cta: "Shop Furniture ->",
    overlay: "from-amber-900/80 via-amber-700/50 to-transparent",
  },
  {
    img: laptopImg,
    title: "Top Electronics",
    subtitle: "Laptops, tablets, gaming gear - all in one place",
    badge: "Electronics",
    cta: "Explore Listings ->",
    overlay: "from-gray-900/80 via-gray-800/50 to-transparent",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { vendor } = useAuthStore();

  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [conversations, setConversations] = useState([]);
  const [orders, setOrders] = useState([]);
  const loadOrdersRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadListings() {
      setListingsLoading(true);
      setListingsError("");

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
          setListingsError(
            err.response?.data?.message || "Failed to load user listings.",
          );
        }
      } finally {
        if (isMounted) {
          setListingsLoading(false);
        }
      }
    }

    async function loadOrders() {
      try {
        const res = await getSellerOrders();
        if (isMounted) {
          const list = Array.isArray(res.data) ? res.data : [];
          setOrders(list.map(order => ({
            id: order._id,
            product_title: order.product?.title || "Unknown Product",
            buyer_name: order.buyer?.name || order.buyer?.email || "Unknown Buyer",
            price: order.totalAmount ?? order.priceAtOrder ?? order.product?.price ?? 0,
            status: order.status,
            date: order.createdAt,
          })));
        }
      } catch {
        if (isMounted) setOrders([]);
      }
    }

    loadListings();
    loadOrders();

    getMyConversations()
      .then((res) => {
        const list = res.data?.conversations ?? res.data ?? [];
        if (isMounted) setConversations(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (isMounted) setConversations([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleProductOrdered(event) {
      const orderedProductId = String(event.detail?.productId ?? "");
      if (!orderedProductId) return;

      setListings((current) =>
        current.filter(
          (item) => String(item.id ?? item._id) !== orderedProductId,
        ),
      );
    }

    window.addEventListener(PRODUCT_ORDERED_EVENT, handleProductOrdered);
    return () =>
      window.removeEventListener(PRODUCT_ORDERED_EVENT, handleProductOrdered);
  }, []);

  const refreshOrders = async () => {
    try {
      const res = await getMyConversations();
      const list = res.data?.conversations ?? res.data ?? [];
      setConversations(Array.isArray(list) ? list : []);

      const ordersRes = await getSellerOrders();
      const ordersList = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      setOrders(ordersList.map(order => ({
        id: order._id,
        product_title: order.product?.title || "Unknown Product",
        buyer_name: order.buyer?.name || order.buyer?.email || "Unknown Buyer",
        price: order.price,
        status: order.status,
        date: order.createdAt,
      })));
    } catch {
    }
  };

  useEffect(() => {
    loadOrdersRef.current = refreshOrders;
  }, [refreshOrders]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && loadOrdersRef.current) {
        loadOrdersRef.current();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const recentActivity = [
    ...conversations.slice(0, 3).map((conv) => {
      const isMeBuyer = conv.buyer?._id === vendor?.id || conv.buyer === vendor?.id;
      const buyerName = isMeBuyer ? "You" : (conv.buyer?.name ?? conv.buyer?.email ?? "Someone");
      return {
        type: "message",
        id: `msg-${conv._id ?? conv.id}`,
        text: `${buyerName} — ${conv.product?.title ?? "a product"}`,
        time: conv.updatedAt ?? conv.createdAt,
        label: isMeBuyer ? "You sent a message" : "New conversation",
        link: `/conversations/${conv._id ?? conv.id}`,
      };
    }),
    ...orders.slice(0, 3).map((order) => ({
      type: "order",
      id: `ord-${order.id}`,
      text: `Order for ${order.product_title}`,
      time: order.date,
      label: "Order received",
      link: "/orders",
    })),
  ]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 5);

  const PREVIEW_LIMIT = 10;

  const filteredListings = useMemo(() => {
    const categoryFiltered =
      activeCategory === "All"
        ? listings
        : listings.filter(
          (item) =>
            (item.category ?? "").toLowerCase() ===
            activeCategory.toLowerCase(),
        );

    return [...categoryFiltered]
      .sort((a, b) =>
        sortOrder === "newest"
          ? new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0)
          : new Date(a.createdAt ?? 0) - new Date(b.createdAt ?? 0),
      )
      .slice(0, PREVIEW_LIMIT);
  }, [activeCategory, listings, sortOrder]);

  const recentlyAdded = useMemo(
    () =>
      [...listings]
        .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
        .slice(0, 4),
    [listings],
  );

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8">
      <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden shadow-lg">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 hero-slide transition-opacity duration-500 ease-in-out ${index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
          >
            <img
              src={slide.img}
              alt={slide.title}
              className={`w-full h-full object-cover ${slide.imgClass || ""}`}
            />
            <div
              className={`absolute inset-0 bg-gradient-to-r ${slide.overlay}`}
            />
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
              <p className="text-sm text-white/80 mb-4 max-w-md">
                {slide.subtitle}
              </p>
              <button
                onClick={() =>
                  navigate(`/explore-items?category=${slide.badge}`)
                }
                className="w-fit text-sm font-semibold text-white bg-white/20 backdrop-blur-sm
                hover:bg-white/30 transition-all px-4 py-2 rounded-xl border border-white/30 hover:scale-105 duration-200"
              >
                {slide.cta}
              </button>
            </div>
          </div>
        ))}
        <div className="absolute bottom-4 right-6 flex gap-1.5 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${index === currentSlide
                ? "bg-white scale-125"
                : "bg-white/60 hover:bg-white/80"
                }`}
            />
          ))}
        </div>
      </div>

      <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col items-center text-center gap-1.5 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Browse Listings
          </h2>
          <p className="text-sm text-gray-500">
            Items listed by users - ready to order
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${activeCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-gradient-primary text-white border border-brand-500 shadow-[0_2px_8px_rgba(168,85,247,0.28)] scale-105"
                  : "bg-gray-100 text-gray-600 border border-transparent hover:bg-brand-50 hover:text-gradient-primary hover:border-brand-200"
                  }`}
              >
                {cat}
              </button>
            ))}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-gray-100 text-gray-600 border border-transparent cursor-default opacity-60 ml-2">
              {filteredListings.length} items
            </span>
          </div>

          <button
            onClick={() =>
              setSortOrder((current) =>
                current === "newest" ? "oldest" : "newest",
              )
            }
            className="flex items-center gap-2 text-sm font-medium text-gray-600
              hover:text-gradient-primary bg-gray-50 border border-gray-200 hover:border-brand-300
              px-3.5 py-2 rounded-xl transition-all self-start sm:self-auto"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortOrder === "newest" ? "Newest First" : "Oldest First"}
          </button>
        </div>

        {listingsLoading ? (
          <div className="bg-white rounded-lg border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-12 text-center">
            <p className="text-gray-400">Loading listings...</p>
          </div>
        ) : listingsError ? (
          <div className="bg-white rounded-lg border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-12 text-center">
            <p className="text-red-500">{listingsError}</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-12 text-center">
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
          <Link
            to="/explore-items"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-primary text-white text-sm font-medium shadow-sm hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            Explore Items {"->"}
          </Link>
        </div>
      </section>

      <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recently Added</h2>
            <p className="text-xs text-gray-500 mt-1">Last 4 user listings</p>
          </div>
        </div>

        {listingsLoading ? (
          <div className="bg-white rounded-lg border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-8 text-center">
            <p className="text-gray-400">Loading recent listings...</p>
          </div>
        ) : listingsError ? (
          <div className="bg-white rounded-lg border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-8 text-center">
            <p className="text-red-500">{listingsError}</p>
          </div>
        ) : recentlyAdded.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-8 text-center">
            <p className="text-gray-400">No recent user listings available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentlyAdded.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden group flex items-center gap-3 p-3"
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
                  <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-400">{item.category}</p>
                  <p className="text-sm font-bold text-gradient-primary mt-0.5 w-fit">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[0.875rem] border border-[#e9e9ec] shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">
              Recent Activity
            </h2>
          </div>
          <div className="space-y-1">
            {recentActivity.slice(0, 5).map((item) => (
              <Link
                to={item.link}
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.type === "message" ? "bg-brand-50" : "bg-amber-50"
                    }`}
                >
                  {item.type === "message" ? (
                    <MessageSquare className="w-4 h-4 text-brand-500" />
                  ) : (
                    <ShoppingBag className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.text}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(item.time)}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-brand-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[0.875rem] border border-[#e9e9ec] shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-gray-400" /> Recent Orders
            </h2>
            <Link
              to="/orders"
              className="text-xs text-gradient-primary hover:opacity-80 font-medium transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {orders.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                No orders yet.
              </p>
            ) : (
              orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {order.product_title}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {order.buyer_name}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-gradient-primary">
                      {formatPrice(order.price)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
