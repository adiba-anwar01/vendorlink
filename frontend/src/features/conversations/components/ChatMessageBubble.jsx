import { formatTime } from '@/utils/dateUtils';
import { formatPrice } from '@/utils/priceUtils';

export default function ChatMessageBubble({ message, isSelf, offerStatus }) {
  const isOffer = message.messageType === 'offer';
  const isSystem = message.messageType === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="max-w-md px-4 py-2 rounded-full bg-brand-50 border border-brand-200 text-xs font-medium text-gradient-primary">
          {message.text ?? message.message_text}
        </div>
      </div>
    );
  }

  if (isOffer) {
    return (
      <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
        <div
          className={`max-w-[180px] lg:max-w-[200px] px-2.5 py-2 rounded-xl text-xs leading-snug border ${isSelf
              ? 'bg-gradient-to-r from-brand-500/10 to-indigo-500/10 border-brand-500/30 rounded-br-sm'
              : 'bg-gradient-to-r from-brand-500/10 to-indigo-500/10 border-brand-500/20 rounded-bl-sm'
            }`}
        >
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wide">
              {isSelf ? "Your Offer" : "Their Offer"}
            </span>
          </div>
          <p className="text-sm font-bold text-brand-800 leading-none mb-1">
            {formatPrice(message.offerPrice ?? 0)}
          </p>
          {message.text && (
            <p className="text-[11px] text-brand-700 mt-1 leading-snug">{message.text}</p>
          )}
        </div>
        <p className={`text-[10px] mt-1 px-1 ${isSelf ? 'text-gray-500' : 'text-gray-400'}`}>
          {formatTime(message.createdAt ?? message.timestamp)}
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-xs lg:max-w-sm xl:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isSelf
            ? 'bg-gradient-to-r from-brand-500/10 to-indigo-500/10 text-gray-900 rounded-br-sm'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm'
          }`}
      >
        <p>{message.text ?? message.message_text}</p>
      </div>
      <p className={`text-[10px] mt-1 px-1 ${isSelf ? 'text-gray-500' : 'text-gray-400'}`}>
        {formatTime(message.createdAt ?? message.timestamp)}
      </p>
    </div>
  );
}
