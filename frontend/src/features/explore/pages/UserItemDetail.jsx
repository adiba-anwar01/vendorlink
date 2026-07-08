import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Image, Tag, User, MapPin, Package, Map } from 'lucide-react';
import { getProduct } from '@/features/products/api/productApi';
import { formatPrice } from '@/utils/priceUtils';
import { normalizeExploreItem } from '@/features/explore/utils/exploreItemUtils';
import OrderModal from '@/features/orders/components/OrderModal';
import { useOrderFlow } from '@/features/orders/hooks/useOrderFlow';
import useAuthStore from '@/features/auth/hooks/useAuthStore';
import { cardClass, btnGhost, btnPrimary, btnSecondary } from '@/utils/theme';
import { getDistanceKm } from '@/utils/geoUtils';

export default function UserItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const { vendor } = useAuthStore();

  const orderFlow = useOrderFlow();

  const vendorCoords = (() => {
    if (!vendor) return null;
    const lat = vendor.latitude ?? vendor.lat ?? (Array.isArray(vendor.location?.coordinates) ? vendor.location.coordinates[1] : null);
    const lng = vendor.longitude ?? vendor.lng ?? (Array.isArray(vendor.location?.coordinates) ? vendor.location.coordinates[0] : null);
    if (lat !== null && lng !== null && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
      return { lat: Number(lat), lng: Number(lng) };
    }
    return null;
  })();

  const distanceKm = (() => {
    if (!item || !vendorCoords || item.lat == null || item.lng == null) return null;
    return getDistanceKm(vendorCoords.lat, vendorCoords.lng, item.lat, item.lng);
  })();

  useEffect(() => {
    let isMounted = true;

    getProduct(id)
      .then((res) => {
        if (!isMounted) return;
        const normalized = normalizeExploreItem(res.data);
        if (isMounted) {
          setItem(normalized.sellerRole === 'user' ? normalized : null);
          setActiveImg(0);
        }
      })
      .catch(() => {
        if (isMounted) {
          setItem(null);
          setActiveImg(0);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [id]);

  const images = item?.images?.length ? item.images : item?.image ? [item.image] : [];

  const categoryColors = {
    Mobile: { bg: 'bg-purple-100', text: 'text-purple-700' },
    Electronics: { bg: 'bg-brand-100', text: 'text-gradient-primary' },
    Furniture: { bg: 'bg-amber-100', text: 'text-amber-700' },
  };
  const catStyle = categoryColors[item?.category] || { bg: 'bg-gray-100', text: 'text-gray-600' };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="animate-pulse text-sm text-gray-400">Loading item...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-gray-500">Item not found.</p>
        <button onClick={() => navigate('/explore-items')} className={btnPrimary}>
          Back to Explore
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <button onClick={() => navigate(-1)} className={`${btnGhost} flex items-center gap-2`}>
        <ArrowLeft className="h-4 w-4 shrink-0" />
        <span>Back</span>
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
            {images.length > 0 ? (
              <img
                src={images[activeImg]}
                alt={item.title}
                className="h-full w-full object-cover transition-all duration-300"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-300">
                <Image className="h-14 w-14" />
                <p className="text-sm">No image available</p>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {images.map((img, index) => (
                <button
                  key={img || index}
                  onClick={() => setActiveImg(index)}
                  className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition-colors ${index === activeImg
                    ? 'border-brand-500 ring-2 ring-brand-200'
                    : 'border-gray-200 hover:border-gray-400'
                    }`}
                >
                  <img src={img} alt={`thumb-${index}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${catStyle.bg} ${catStyle.text}`}>
              {item.category}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${item.condition === 'New' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                }`}
            >
              {item.condition}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`${cardClass} space-y-4 p-6`}>
            <div>
              <h1 className="mb-2 text-xl font-bold leading-snug text-gray-900">{item.title}</h1>
              <p className="text-3xl font-bold text-gradient-primary">{formatPrice(item.price)}</p>
            </div>

            <div className="space-y-2 border-t border-gray-100 pt-3">
              <div className="flex items-start gap-2.5 text-sm text-gray-600">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                <span>Posted by <strong>{item.seller}</strong></span>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-gray-600">
                <Tag className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                <span>Category: <strong>{item.category}</strong></span>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-gray-600">
                <Package className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                <span>Condition: <strong>{item.condition}</strong></span>
              </div>
              {distanceKm !== null && (
                <div className="flex items-start gap-2.5 text-sm text-gray-600">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                  <span>Distance: <strong>{distanceKm.toFixed(1)} km away</strong></span>
                </div>
              )}
              {item.lat != null && item.lng != null && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2.5 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white rounded-full border border-gray-200 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_-4px_rgba(168,85,247,0.15)] hover:-translate-y-0.5 hover:border-brand-300 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-50 text-brand-600 group-hover:bg-brand-100 transition-colors">
                    <Map className="w-2.5 h-2.5 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="group-hover:text-brand-600 transition-colors">View on Map</span>
                </a>
              )}
            </div>

            {item.description && (
              <div className="border-t border-gray-100 pt-3">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Description
                </p>
                <p className="text-sm leading-relaxed text-gray-700">{item.description}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => navigate(-1)}
                className={`${btnSecondary} flex-1 flex items-center justify-center gap-2`}
              >
                Go Back
              </button>
              <button
                onClick={() => orderFlow.openOrderFlow(item.id)}
                className={`${btnPrimary} flex-1 flex items-center justify-center gap-2`}
              >
                <ShoppingCart className="h-4 w-4 shrink-0" />
                <span>Place Order</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {orderFlow.isOpen && (
        <OrderModal
          item={orderFlow.item}
          onClose={orderFlow.closeOrderFlow}
          onConfirm={orderFlow.handleConfirmOrder}
        />
      )}
    </div>
  );
}
