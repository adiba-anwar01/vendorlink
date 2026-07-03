import { formatDistanceToNow } from '@/utils/dateUtils';
import { Package } from 'lucide-react';
import useAuthStore from '@/features/auth/hooks/useAuthStore';
import { getChatPartner, getDisplayName } from '../utils/chatUtils';

const statusColors = {
  active: 'bg-emerald-100 text-emerald-700',
  accepted: 'bg-brand-100 text-gradient-primary',
  rejected: 'bg-red-100 text-red-600',
};

export default function ConversationListItem({ conversation, onClick, isActive = false }) {
  const { vendor } = useAuthStore();
  const chatPartner = getChatPartner(conversation, vendor);
  const partnerName = getDisplayName(chatPartner);
  const productTitle = conversation.product?.title ?? 'Unknown Product';
  const initials = partnerName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const status = conversation.status ?? 'active';
  const statusClass = statusColors[status] ?? 'bg-gray-100 text-gray-600';

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors border-l-2 ${
        isActive
          ? 'bg-brand-50/50 border-l-brand-500'
          : 'border-l-transparent hover:bg-gray-50'
      }`}
    >
      <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold bg-brand-100 text-gradient-primary">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className={`text-sm font-semibold truncate ${isActive ? 'text-gradient-primary' : 'text-gray-900'}`}>
            {partnerName}
          </p>
          <span className="text-[10px] text-gray-400 shrink-0">
            {formatDistanceToNow(conversation.updatedAt ?? conversation.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-1 text-gray-400 mb-0.5">
          <Package className="w-2.5 h-2.5 shrink-0" />
          <span className="text-[10px] truncate">{productTitle}</span>
        </div>

        {conversation.lastMessage && (
          <p className="text-xs text-gray-500 truncate">{conversation.lastMessage}</p>
        )}
      </div>

      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 mt-1 ${statusClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </button>
  );
}
