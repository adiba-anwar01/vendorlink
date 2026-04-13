import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Image, ShoppingCart, Eye, MessageCircle } from "lucide-react";
import { placeOrder } from "../../api/orderApi";
import { formatPrice } from "../utils/priceUtils";
import { startConversation } from "../../api/conversationApi";
import { toast } from "react-toastify";
import OrderModal from "./OrderModal";

export default function UserItemCard({ item }) {
  const navigate = useNavigate();
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  const productId = item._id ?? item.id;

  async function handleChat() {
    setChatLoading(true);
    try {
      const res = await startConversation(productId);
      const conv = res.data?.conversation ?? res.data;
      const convId = conv._id ?? conv.id;
      navigate(`/conversations/${convId}`);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Could not start conversation.",
      );
    } finally {
      setChatLoading(false);
    }
  }

  async function handleConfirmOrder({
    buyerName,
    phoneNumber,
    deliveryAddress,
    notes,
  }) {
    setOrdering(true);

    try {
      const finalNotes = notes
        ? `Buyer Name: ${buyerName}\n${notes}`
        : `Buyer Name: ${buyerName}`;

      await placeOrder(productId, {
        phoneNumber,
        deliveryAddress,
        notes: finalNotes,
      });
      setOrderSuccess(true);
      setOrderModalOpen(false);
      toast.success("Order placed! Check My Orders.");
      setTimeout(() => setOrderSuccess(false), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order.");
    } finally {
      setOrdering(false);
    }
  }

  const categoryColors = {
    Mobile: { bg: "bg-purple-100", text: "text-purple-700" },
    Electronics: { bg: "bg-blue-100", text: "text-blue-700" },
    Furniture: { bg: "bg-amber-100", text: "text-amber-700" },
  };
  const catStyle = categoryColors[item.category] || {
    bg: "bg-gray-100",
    text: "text-gray-600",
  };

  return (
    <div className="card card-hover group flex h-full flex-col overflow-hidden">
      <div className="relative h-40 shrink-0 overflow-hidden bg-gray-100">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Image className="h-8 w-8 text-gray-300" />
          </div>
        )}

        <div className="absolute left-2 top-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${catStyle.bg} ${catStyle.text}`}
          >
            {item.category}
          </span>
        </div>

        <div className="absolute right-2 top-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              item.condition === "New"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {item.condition}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="mb-0.5 line-clamp-2 text-xs font-semibold leading-snug text-gray-900">
          {item.title}
        </h3>
        <p className="mb-1 truncate text-[11px] text-gray-400">
          By {item.seller}
        </p>

        <span className="mb-1 text-sm font-bold text-gray-900">
          {formatPrice(item.price)}
        </span>

        {orderSuccess && (
          <div className="mb-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-center text-[10px] font-medium text-emerald-700">
            Ordered! Check My Orders.
          </div>
        )}

        <div className="mt-auto flex flex-col gap-2 border-t border-gray-100 pt-2.5">
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => navigate(`/explore-items/${item.id}`)}
              className="btn-secondary rounded-lg px-2 py-2 text-[11px] flex items-center justify-center gap-1 whitespace-nowrap"
              title="View details"
            >
              <Eye className="h-3 w-3 shrink-0" />
              <span>Details</span>
            </button>
            <button
              onClick={() => setOrderModalOpen(true)}
              disabled={ordering}
              className="btn-primary rounded-lg px-2 py-2 text-[11px] disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-1 whitespace-nowrap"
              title="Place order"
            >
              <ShoppingCart className="h-3 w-3 shrink-0" />
              <span>{ordering ? "..." : "Order"}</span>
            </button>
            <button
              onClick={handleChat}
              disabled={chatLoading}
              title="Chat with seller"
              className="btn-secondary rounded-lg px-2 py-2 text-[11px] disabled:opacity-50 flex items-center justify-center gap-1 whitespace-nowrap hover:bg-blue-50 active:scale-95"
            >
              <MessageCircle className="h-3 w-3" />
              <span>Chat</span>
            </button>
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
