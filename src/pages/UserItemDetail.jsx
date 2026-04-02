import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, ShoppingCart, Image, Tag, User, MapPin, Package } from 'lucide-react';
import { getProduct } from '../api/productApi';
import { placeOrder } from '../api/orderApi';
import { formatPrice } from '../components/utils/priceUtils';
import { normalizeExploreItem } from '../components/utils/exploreItemUtils';
import OrderModal from '../components/ui/OrderModal';

export default function UserItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ordering, setOrdering] = useState(false);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getProduct(id)
      .then((res) => {
        if (!isMounted) return;
        const normalized = normalizeExploreItem(res.data);
        setItem(normalized.sellerRole === 'user' ? normalized : null);
      })
      .catch(() => {
        if (isMounted) setItem(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    setActiveImg(0);
  }, [item?.id]);

  const images = item?.images?.length ? item.images : item?.image ? [item.image] : [];

  const categoryColors = {
    Mobile: { bg: 'bg-purple-100', text: 'text-purple-700' },
    Electronics: { bg: 'bg-blue-100', text: 'text-blue-700' },
    Furniture: { bg: 'bg-amber-100', text: 'text-amber-700' },
  };
  const catStyle = categoryColors[item?.category] || { bg: 'bg-gray-100', text: 'text-gray-600' };

  async function handleConfirmOrder({ buyerName, phoneNumber, deliveryAddress, notes }) {
    setOrdering(true);

    try {
      const finalNotes = notes
        ? `Buyer Name: ${buyerName}\n${notes}`
        : `Buyer Name: ${buyerName}`;

      // FIX: the detail-page order flow now posts req.body with deliveryAddress/phoneNumber/notes from the modal.
      await placeOrder(item.id, { phoneNumber, deliveryAddress, notes: finalNotes });
      setOrderSuccess(true);
      setOrderModalOpen(false);
      toast.success('Order placed! Check My Orders.');
      setTimeout(() => setOrderSuccess(false), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to place order.';
      toast.error(msg);
    } finally {
      setOrdering(false);
    }
  }

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
        <button onClick={() => navigate('/explore-items')} className="btn-primary">
          Back to Explore
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <button onClick={() => navigate(-1)} className="btn-ghost flex items-center gap-2">
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
                  className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition-colors ${
                    index === activeImg
                      ? 'border-blue-500 ring-2 ring-blue-200'
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
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                item.condition === 'New' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {item.condition}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card space-y-4 p-6">
            <div>
              <h1 className="mb-2 text-xl font-bold leading-snug text-gray-900">{item.title}</h1>
              <p className="text-3xl font-bold text-gray-900">{formatPrice(item.price)}</p>
            </div>

            <div className="space-y-2 border-t border-gray-100 pt-3">
              <div className="flex items-start gap-2.5 text-sm text-gray-600">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                <span>
                  Posted by <strong>{item.seller}</strong>
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-gray-600">
                <Tag className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                <span>
                  Category: <strong>{item.category}</strong>
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-gray-600">
                <Package className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                <span>
                  Condition: <strong>{item.condition}</strong>
                </span>
              </div>
              {item.lat !== null && item.lng !== null && (
                <div className="flex items-start gap-2.5 text-sm text-gray-600">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                  <span>
                    Nearby ({item.lat.toFixed(3)}°, {item.lng.toFixed(3)}°)
                  </span>
                </div>
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

            {orderSuccess && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700">
                Order placed! Check My Orders.
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => navigate(-1)}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                Go Back
              </button>
              <button
                onClick={() => setOrderModalOpen(true)}
                disabled={ordering}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ShoppingCart className="h-4 w-4 shrink-0" />
                <span>{ordering ? 'Placing...' : 'Place Order'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {orderModalOpen && (
        <OrderModal
          item={item}
          onClose={() => setOrderModalOpen(false)}
          onConfirm={handleConfirmOrder}
        />
      )}
    </div>
  );
}
