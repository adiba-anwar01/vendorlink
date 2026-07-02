import { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, Send, Package, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';
import { getMessages, sendMessage, acceptConversation } from '../../api/conversationApi';
import ChatMessageBubble from './ChatMessageBubble';
import useAuthStore from '../../store/useAuthStore';
import useOfferStateStore from '../../store/useOfferStateStore';
import { getVendorId, isVendorUser } from '../utils/chatUtils';

function normalizeId(value) {
  return value == null ? '' : String(value);
}

function getMessageId(message) {
  return normalizeId(message?._id ?? message?.id);
}

function getSenderId(message) {
  return normalizeId(message?.sender?._id ?? message?.sender?.id ?? message?.sender ?? message?.senderId);
}

function getConversationPartyName(entity, fallback) {
  if (typeof entity === 'string' && entity.trim()) return entity;
  return entity?.name ?? entity?.email ?? fallback;
}

export default function ChatPane({ conversationId, conversation, onBack }) {
  const { vendor } = useAuthStore();
  const soldProducts = useOfferStateStore((s) => s.soldProducts);
  const markProductSold = useOfferStateStore((s) => s.markProductSold);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [offerMode, setOfferMode] = useState(false);
  const [acting, setActing] = useState(false);
  const [activeConversation, setActiveConversation] = useState(conversation ?? null);

  const bottomRef = useRef(null);

  useEffect(() => {
    setActiveConversation(conversation ?? null);
  }, [conversation]);

  useEffect(() => {
    if (!conversationId) return;
    let isMounted = true;

    async function load() {
      setLoading(true);
      setText('');
      setOfferPrice('');
      setOfferMode(false);
      try {
        const res = await getMessages(conversationId);
        if (!isMounted) return;
        const list = res.data?.messages ?? res.data ?? [];
        setMessages(Array.isArray(list) ? list : []);
      } catch {
        if (isMounted) toast.error('Could not load messages.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => { isMounted = false; };
  }, [conversationId]);

  const currentUserId = getVendorId(vendor);
  const product = activeConversation?.product ?? {};
  const productId = normalizeId(product._id ?? product.id);
  const productSoldState = productId ? soldProducts[productId] : null;
  const isVendor = isVendorUser(activeConversation, vendor);

  const chatPartner = isVendor
    ? getConversationPartyName(activeConversation?.buyer, 'User')
    : getConversationPartyName(activeConversation?.seller, 'User');

  const isProductSold = Boolean(productSoldState || activeConversation?.status === 'accepted');

  const latestOffer = useMemo(
    () => [...messages].reverse().find((m) => m.messageType === 'offer') ?? null,
    [messages]
  );

  const mergedMessages = useMemo(() => {
    if (!productSoldState || !productId) return messages;
    const systemId = `system-sold-${productId}`;
    if (messages.some((m) => getMessageId(m) === systemId)) return messages;
    return [
      ...messages,
      { id: systemId, messageType: 'system', text: productSoldState.message, createdAt: productSoldState.soldAt },
    ];
  }, [messages, productId, productSoldState]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mergedMessages]);

  async function refreshMessages() {
    try {
      const res = await getMessages(conversationId);
      const list = res.data?.messages ?? res.data ?? [];
      setMessages(Array.isArray(list) ? list : []);
    } catch {}
  }

  async function handleSend() {
    if (offerMode) {
      const parsed = Number(offerPrice);
      if (!offerPrice || Number.isNaN(parsed) || parsed <= 0) {
        toast.error('Enter a valid offer amount.');
        return;
      }
      setSending(true);
      try {
        const res = await sendMessage(conversationId, { messageType: 'offer', offerPrice: parsed });
        const msg = res.data?.message ?? res.data;
        if (msg && (msg._id || msg.id)) {
          setMessages((prev) => [...prev, msg]);
        } else {
          await refreshMessages();
        }
        setOfferPrice('');
        setOfferMode(false);
        setText('');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to send offer.');
      } finally {
        setSending(false);
      }
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) return;

    setSending(true);
    try {
      const res = await sendMessage(conversationId, { messageType: 'text', text: trimmed });
      const msg = res.data?.message ?? res.data;
      if (msg && (msg._id || msg.id)) {
        setMessages((prev) => [...prev, msg]);
      } else {
        await refreshMessages();
      }
      setText('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleAccept() {
    if (!latestOffer || !productId || isProductSold) return;
    if (!isVendor) { toast.error('Only the seller can accept this offer.'); return; }
    setActing(true);
    try {
      await acceptConversation(conversationId);
      markProductSold({ productId, conversationId, offerId: getMessageId(latestOffer), soldAt: new Date().toISOString() });
      setActiveConversation((prev) => prev ? { ...prev, status: 'accepted' } : prev);
      toast.success('Offer accepted and order placed.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Accept failed.');
    } finally {
      setActing(false);
    }
  }

  const productTitle = product.title ?? 'Unknown Product';
  const areOfferActionsDisabled = acting || isProductSold;
  const isChatDisabled = isProductSold;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-gray-400 animate-pulse">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-blue-50 to-white shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </button>
        )}

        <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
          {chatPartner.slice(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">{chatPartner}</p>
          <div className="flex items-center gap-1 text-gray-400">
            <Package className="w-3 h-3 shrink-0" />
            <span className="text-xs truncate">{productTitle}</span>
          </div>
        </div>

        {isVendor && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              disabled={areOfferActionsDisabled}
              className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-50"
            >
              Reject
            </button>
            <button
              onClick={handleAccept}
              disabled={areOfferActionsDisabled}
              className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50"
            >
              Accept
            </button>
          </div>
        )}

        {isProductSold && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
            Sold
          </span>
        )}
      </div>

      {isProductSold && (
        <div className="mx-4 mt-3 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 font-medium text-center shrink-0">
          This product has been sold.
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-50/40 scrollbar-thin">
        {mergedMessages.length === 0 && (
          <p className="text-center text-xs text-gray-400 mt-8">No messages yet — say hello!</p>
        )}
        {mergedMessages.map((message) => {
          const msgId = getMessageId(message);
          let offerStatus = null;
          if (message.messageType === 'offer') {
            if (productSoldState?.offerId && productSoldState.offerId === msgId) {
              offerStatus = 'accepted';
            } else if (isProductSold) {
              offerStatus = 'sold';
            }
          }
          return (
            <ChatMessageBubble
              key={msgId || `${message.messageType}-${message.createdAt ?? message.timestamp}`}
              message={message}
              isSelf={getSenderId(message) === currentUserId}
              offerStatus={offerStatus}
              productSold={isProductSold && message.messageType !== 'system'}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>

      {!isChatDisabled ? (
        <div className="px-4 py-3 border-t border-gray-100 bg-white shrink-0 space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOfferMode((v) => !v)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                offerMode
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-amber-300 hover:text-amber-600'
              }`}
            >
              <DollarSign className="w-3 h-3" />
              {offerMode ? 'Offer Mode ON' : 'Make Offer'}
            </button>
            {offerMode && (
              <input
                type="number"
                placeholder="Offer price..."
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                className="input-field w-36 text-sm py-1.5"
              />
            )}
          </div>

          <div className="flex items-end gap-3">
            <textarea
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={offerMode ? 'Sending offer — press Send' : 'Type a message... (Enter to send)'}
              className="input-field resize-none flex-1 min-h-[40px] max-h-28"
            />
            <button
              onClick={handleSend}
              disabled={sending || (offerMode ? (!offerPrice || Number(offerPrice) <= 0) : !text.trim())}
              className="btn-primary shrink-0 p-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-center text-xs text-gray-400 shrink-0">
          This conversation is closed.
        </div>
      )}
    </div>
  );
}
