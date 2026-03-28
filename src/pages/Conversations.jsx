import { useState, useRef } from 'react';
import { Search, Send, Package, MessageSquare } from 'lucide-react';
import { conversations as initialConvs, buyers, products } from '../data/mockData';
import ConversationListItem from '../components/conversations/ConversationListItem';
import ChatMessageBubble from '../components/conversations/ChatMessageBubble';
import useAuthStore from '../store/useAuthStore';

export default function Conversations() {
  const { vendor } = useAuthStore();
  const [convs, setConvs]       = useState(initialConvs);
  const [activeId, setActiveId] = useState(convs[0]?.conversation_id);
  const [search, setSearch]     = useState('');
  const [message, setMessage]   = useState('');
  const messagesEndRef = useRef(null);

  const activeConv    = convs.find((c) => c.conversation_id === activeId);
  const activeBuyer   = buyers.find((b) => b.id === activeConv?.buyer_id);
  const activeProduct = products.find((p) => p.id === activeConv?.product_id);

  const filtered = convs.filter((c) => {
    const buyer = buyers.find((b) => b.id === c.buyer_id);
    return buyer?.name.toLowerCase().includes(search.toLowerCase());
  });

  const sendMessage = () => {
    if (!message.trim() || !activeConv) return;
    const newMsg = {
      id: `m${Date.now()}`,
      sender_id: vendor.id,
      message_text: message.trim(),
      timestamp: new Date().toISOString(),
    };
    setConvs((prev) =>
      prev.map((c) =>
        c.conversation_id === activeId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: newMsg.message_text, timestamp: newMsg.timestamp }
          : c
      )
    );
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex gap-4">
      {/* Conversation List */}
      <div className="w-72 shrink-0 card overflow-hidden flex flex-col">
        {/* List header */}
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-bold text-gray-900">Conversations</h2>
            {convs.filter(c => c.unread > 0).length > 0 && (
              <span className="ml-auto text-xs bg-blue-500 text-white font-semibold px-2 py-0.5 rounded-full">
                {convs.filter(c => c.unread > 0).length} new
              </span>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search buyers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-8 py-2 text-xs"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {filtered.map((conv) => (
            <ConversationListItem
              key={conv.conversation_id}
              conversation={conv}
              isActive={conv.conversation_id === activeId}
              onClick={() => setActiveId(conv.conversation_id)}
            />
          ))}
        </div>
      </div>

      {/* Chat Window */}
      {activeConv ? (
        <div className="flex-1 card overflow-hidden flex flex-col min-w-0">
          {/* Chat Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-blue-50 to-white">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
              {activeBuyer?.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">{activeBuyer?.name}</p>
              <div className="flex items-center gap-1 text-gray-400">
                <Package className="w-3 h-3" />
                <span className="text-xs truncate">{activeProduct?.title}</span>
              </div>
            </div>
            {activeProduct?.images?.[0] && (
              <img
                src={activeProduct.images[0]}
                alt=""
                className="w-10 h-10 rounded-xl object-cover shrink-0 border-2 border-white shadow-sm"
              />
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-thin bg-gray-50/50">
            {activeConv.messages.map((msg) => (
              <ChatMessageBubble
                key={msg.id}
                message={msg}
                isVendor={msg.sender_id === vendor.id}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-100 flex items-end gap-3 bg-white">
            <textarea
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send)"
              className="input-field resize-none flex-1 min-h-[40px] max-h-28"
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim()}
              className="btn-primary shrink-0 p-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 card flex flex-col items-center justify-center gap-3 text-gray-400">
          <MessageSquare className="w-10 h-10 text-gray-200" />
          <p className="text-sm">Select a conversation to start chatting</p>
        </div>
      )}
    </div>
  );
}
