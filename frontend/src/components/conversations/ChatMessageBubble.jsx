import { formatTime } from '../utils/dateUtils';
import { DollarSign } from 'lucide-react';
import { formatPrice } from '../utils/priceUtils';

const OFFER_STATUS_STYLES = {
  accepted: 'bg-emerald-100 text-emerald-700',
  sold: 'bg-blue-100 text-blue-700',
};

export default function ChatMessageBubble({ message, isSelf, offerStatus, productSold }) {
  const isOffer = message.messageType === 'offer';
  const isSystem = message.messageType === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="max-w-md px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-xs font-medium text-blue-700">
          {message.text ?? message.message_text}
        </div>
      </div>
    );
  }

  if (isOffer) {
    return (
      <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`max-w-xs lg:max-w-sm px-4 py-3 rounded-2xl text-sm leading-relaxed border-2 ${
            isSelf
              ? 'bg-amber-50 border-amber-300 rounded-br-sm'
              : 'bg-amber-50 border-amber-200 rounded-bl-sm'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shrink-0">
              <DollarSign className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Offer</span>
          </div>
          <p className="text-lg font-bold text-amber-800 leading-none mb-1">
            {formatPrice(message.offerPrice ?? 0)}
          </p>
          {message.text && (
            <p className="text-xs text-amber-700 mt-1 leading-snug">{message.text}</p>
          )}
          {productSold && (
            <p className="mt-2 text-[11px] font-medium text-blue-700">Product has been sold.</p>
          )}
          {offerStatus && (
            <div className="mt-2 flex justify-end">
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  OFFER_STATUS_STYLES[offerStatus] ?? 'bg-gray-100 text-gray-600'
                }`}
              >
                {offerStatus === 'accepted' ? 'Accepted' : 'Sold'}
              </span>
            </div>
          )}
          <p className={`text-[10px] mt-1.5 ${isSelf ? 'text-amber-500 text-right' : 'text-amber-400'}`}>
            {formatTime(message.createdAt ?? message.timestamp)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-sm xl:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isSelf
            ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 rounded-br-sm'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm'
        }`}
      >
        <p>{message.text ?? message.message_text}</p>
        {productSold && (
          <p className={`text-[11px] mt-2 font-medium ${isSelf ? 'text-blue-200' : 'text-blue-700'}`}>
            Product has been sold.
          </p>
        )}
        <p className={`text-[10px] mt-1 ${isSelf ? 'text-white/60 dark:text-gray-600 text-right' : 'text-gray-400'}`}>
          {formatTime(message.createdAt ?? message.timestamp)}
        </p>
      </div>
    </div>
  );
}
