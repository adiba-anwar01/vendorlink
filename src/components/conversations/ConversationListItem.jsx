import { formatDistanceToNow } from '../utils/dateUtils';
import { Package } from 'lucide-react';

const statusColors = {
  active:   'bg-emerald-100 text-emerald-700',
  accepted: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-600',
};

export default function ConversationListItem({ conversation, onClick }) {
  const buyer        = conversation.buyer;
  const buyerName    = buyer?.name ?? buyer?.email ?? 'Unknown Buyer';
  const productTitle = conversation.product?.title ?? 'Unknown Product';
  const initials     = buyerName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const status       = conversation.status ?? 'active';
  const statusClass  = statusColors[status] ?? 'bg-gray-100 text-gray-600';

  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors group"
    >
      {/* Buyer avatar */}
      <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold bg-blue-100 text-blue-600">
        {initials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className="text-sm font-semibold text-gray-900 truncate">{buyerName}</p>
          <span className="text-[10px] text-gray-400 shrink-0">
            {formatDistanceToNow(conversation.updatedAt ?? conversation.createdAt)}
          </span>
        </div>

        {/* Product reference */}
        <div className="flex items-center gap-1 text-gray-400 mb-0.5">
          <Package className="w-2.5 h-2.5 shrink-0" />
          <span className="text-[10px] truncate">{productTitle}</span>
        </div>

        {/* Last message preview */}
        {conversation.lastMessage && (
          <p className="text-xs text-gray-500 truncate">{conversation.lastMessage}</p>
        )}
      </div>

      {/* Status chip */}
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 mt-1 ${statusClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </button>
  );
}
