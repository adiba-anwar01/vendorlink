import { formatTime } from '../utils/dateUtils';

export default function ChatMessageBubble({ message, isVendor }) {
  return (
    <div className={`flex ${isVendor ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-sm xl:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isVendor
            ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 rounded-br-sm'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm'
        }`}
      >
        <p>{message.message_text}</p>
        <p className={`text-[10px] mt-1 ${isVendor ? 'text-white/60 dark:text-gray-600 text-right' : 'text-gray-400'}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}
