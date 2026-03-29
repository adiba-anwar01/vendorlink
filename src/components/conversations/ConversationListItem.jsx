import { formatDistanceToNow } from '../utils/dateUtils';
import { Package } from 'lucide-react';
import { buyers } from '../../data/mockData';

export default function ConversationListItem({ conversation, productTitle, isActive, onClick }) {
  const buyer   = buyers.find((b) => b.id === conversation.buyer_id);

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
        isActive
          ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      {/* Buyer avatar */}
      <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
        isActive ? 'bg-white/20 dark:bg-gray-900/20 text-white dark:text-gray-900' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
      }`}>
        {buyer?.avatar || '??'}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={`text-xs font-semibold truncate ${isActive ? 'text-white dark:text-gray-900' : 'text-gray-900 dark:text-white'}`}>
            {buyer?.name}
          </p>
          <span className={`text-[10px] shrink-0 ml-1 ${isActive ? 'text-white/70 dark:text-gray-700' : 'text-gray-400'}`}>
            {formatDistanceToNow(conversation.timestamp)}
          </span>
        </div>
        {/* Product reference */}
        <div className={`flex items-center gap-1 mt-0.5 ${isActive ? 'text-white/70 dark:text-gray-700' : 'text-gray-400'}`}>
          <Package className="w-2.5 h-2.5 shrink-0" />
          <span className="text-[10px] truncate">{productTitle}</span>
        </div>
        {/* Last message */}
        <p className={`text-xs mt-0.5 truncate ${isActive ? 'text-white/80 dark:text-gray-800' : 'text-gray-500 dark:text-gray-400'}`}>
          {conversation.lastMessage}
        </p>
      </div>

      {/* Unread badge */}
      {conversation.unread > 0 && !isActive && (
        <span className="w-4 h-4 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center text-[9px] font-bold text-white dark:text-gray-900 shrink-0 mt-1">
          {conversation.unread}
        </span>
      )}
    </button>
  );
}
