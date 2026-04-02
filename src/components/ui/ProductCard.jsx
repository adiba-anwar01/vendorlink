import { useState } from 'react';
import { Image, Edit2, Trash2, Eye, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Badge from './Badge';
import { formatPrice } from '../utils/priceUtils';
import { startConversation } from '../../api/conversationApi';
import { toast } from 'react-toastify';

export default function ProductCard({ product, onEdit, onDelete }) {
  const navigate = useNavigate();
  const [chatLoading, setChatLoading] = useState(false);

  const productId = product._id ?? product.id;

  async function handleChat() {
    setChatLoading(true);
    try {
      const res  = await startConversation(productId);
      const conv = res.data?.conversation ?? res.data;
      navigate(`/conversations/${conv._id ?? conv.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start conversation.');
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <div className="card card-hover overflow-hidden group flex flex-col h-full">
      {/* Image — fixed height */}
      <div className="relative h-40 bg-gray-100 overflow-hidden shrink-0">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image className="w-8 h-8 text-gray-300" />
          </div>
        )}
        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <Badge status={product.status} />
        </div>
        {/* Hover gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent
          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content — flex grow, buttons pinned to bottom */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug mb-1">
          {product.title}
        </h3>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</span>
          <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
            {product.condition}
          </span>
        </div>

        {/* Actions — always at bottom */}
        <div className="flex flex-col gap-1 pt-2 border-t border-gray-100 mt-auto">
          <button
            onClick={() => navigate(`/products/${product._id ?? product.id}`)}
            className="w-full btn-secondary text-[11px] py-1 px-2 rounded-lg
              hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
          >
            <Eye className="w-3 h-3 shrink-0" />
            <span>View Details</span>
          </button>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate(`/products/${product._id ?? product.id}/edit`)}
              className="flex-1 flex items-center justify-center gap-1.5 btn-secondary text-[11px] py-1 px-2 rounded-lg"
            >
              <Edit2 className="w-3 h-3 shrink-0" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => onDelete?.(product)}
              className="flex-1 flex items-center justify-center gap-1.5 btn-danger text-[11px] py-1 px-2 rounded-lg"
            >
              <Trash2 className="w-3 h-3 shrink-0" />
              <span>Delete</span>
            </button>
            <button
              onClick={handleChat}
              disabled={chatLoading}
              title="Chat about this product"
              className="flex items-center justify-center px-2 py-1 btn-secondary text-[11px] rounded-lg
                hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-50"
            >
              <MessageCircle className="w-3 h-3 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
