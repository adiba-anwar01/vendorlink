import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Package, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getMyConversations,
  getMessages,
  sendMessage,
  acceptConversation,
} from '../api/conversationApi';
import ChatMessageBubble from '../components/conversations/ChatMessageBubble';
import useAuthStore from '../store/useAuthStore';
import useOfferStateStore from '../store/useOfferStateStore';

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

function getVendorId(vendor) {
  return (
    vendor?._id ??
    vendor?.id ??
    vendor?.vendor?._id ??
    vendor?.vendor?.id ??
    vendor?.user?._id ??
    vendor?.user?.id
  )?.toString() ?? '';
}

function getConversationSellerId(conversation) {
  return (
    conversation?.seller?._id ??
    conversation?.seller?.id ??
    conversation?.seller?.vendor?._id ??
    conversation?.seller?.user?._id ??
    conversation?.product?.seller?._id ??
    conversation?.product?.seller?.id ??
    conversation?.product?.vendor?._id ??
    conversation?.product?.vendor?.id ??
    conversation?.seller
  )?.toString() ?? '';
}

export default function ChatPage() {
  const { id: conversationId } = useParams();
  const navigate = useNavigate();
  const { vendor } = useAuthStore();
  const soldProducts = useOfferStateStore((state) => state.soldProducts);
  const markProductSold = useOfferStateStore((state) => state.markProductSold);

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [offerMode, setOfferMode] = useState(false);
  const [acting, setActing] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      try {
        const [conversationsRes, messagesRes] = await Promise.all([
          getMyConversations(),
          getMessages(conversationId),
        ]);

        if (!isMounted) return;

        const conversationList = conversationsRes.data?.conversations ?? conversationsRes.data ?? [];
        const foundConversation = conversationList.find(
          (item) => normalizeId(item._id ?? item.id) === conversationId
        );

        setConversation(foundConversation ?? null);

        const messageList = messagesRes.data?.messages ?? messagesRes.data ?? [];
        setMessages(Array.isArray(messageList) ? messageList : []);
      } catch {
        if (isMounted) toast.error('Could not load chat.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [conversationId]);

  const currentUserId = getVendorId(vendor);
  const conversationSellerId = getConversationSellerId(conversation);
  const buyerName = getConversationPartyName(conversation?.buyer, 'Buyer');
  const product = conversation?.product ?? {};
  const productId = normalizeId(product._id ?? product.id);
  const productSoldState = productId ? soldProducts[productId] : null;

  const isVendor = Boolean(
    currentUserId &&
    conversationSellerId &&
    currentUserId === conversationSellerId
  );

  const backendAccepted = conversation?.status === 'accepted';
  const isProductSold = Boolean(productSoldState || backendAccepted);

  const latestOffer = useMemo(
    () => [...messages].reverse().find((message) => message.messageType === 'offer') ?? null,
    [messages]
  );

  const mergedMessages = useMemo(() => {
    if (!productSoldState || !productId) return messages;

    const systemMessageId = `system-sold-${productId}`;
    const alreadyPresent = messages.some((message) => getMessageId(message) === systemMessageId);
    if (alreadyPresent) return messages;

    return [
      ...messages,
      {
        id: systemMessageId,
        messageType: 'system',
        text: productSoldState.message,
        createdAt: productSoldState.soldAt,
      },
    ];
  }, [messages, productId, productSoldState]);

  const productTitle = product.title ?? 'Unknown Product';
  const areOfferActionsDisabled = acting || isProductSold;
  const isChatDisabled = isProductSold;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mergedMessages]);

  async function refreshMessages() {
    try {
      const res = await getMessages(conversationId);
      const messageList = res.data?.messages ?? res.data ?? [];
      setMessages(Array.isArray(messageList) ? messageList : []);
    } catch {
      // Optimistic UI is already updated when this fails.
    }
  }

  async function handleSend() {
    if (offerMode) {
      const parsedOffer = Number(offerPrice);
      if (!offerPrice || Number.isNaN(parsedOffer) || parsedOffer <= 0) {
        toast.error('Enter a valid offer amount.');
        return;
      }

      const payload = { messageType: 'offer', offerPrice: parsedOffer };

      setSending(true);
      try {
        const res = await sendMessage(conversationId, payload);
        const newMessage = res.data?.message ?? res.data;
        if (newMessage && (newMessage._id || newMessage.id)) {
          setMessages((prev) => [...prev, newMessage]);
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

    const trimmedText = text.trim();
    if (!trimmedText) return;

    const payload = { messageType: 'text', text: trimmedText };

    setSending(true);
    try {
      const res = await sendMessage(conversationId, payload);
      const newMessage = res.data?.message ?? res.data;
      if (newMessage && (newMessage._id || newMessage.id)) {
        setMessages((prev) => [...prev, newMessage]);
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
    if (!isVendor) {
      toast.error('Only the seller can accept this offer.');
      return;
    }

    setActing(true);
    try {
      await acceptConversation(conversationId);

      const offerId = getMessageId(latestOffer);
      const soldAt = new Date().toISOString();

      // markProductSold updates the chat UI to show "Sold" state
      // The order itself is already persisted on the backend via acceptConversation()
      markProductSold({
        productId,
        conversationId,
        offerId,
        soldAt,
      });

      setConversation((prev) => (prev ? { ...prev, status: 'accepted' } : prev));
      toast.success('Offer accepted and order placed.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Accept failed.');
    } finally {
      setActing(false);
    }
  }

  function handleReject() {
    if (isProductSold) return;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400 animate-pulse">Loading chat...</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-red-500 font-medium">Conversation not found.</p>
        <button onClick={() => navigate('/conversations')} className="btn-secondary mt-4">
          Back to Conversations
        </button>
      </div>
    );
  }


  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-blue-50 to-white shrink-0">
        <button
          onClick={() => navigate('/conversations')}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>

        <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
          {buyerName.slice(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">{buyerName}</p>
          <div className="flex items-center gap-1 text-gray-400">
            <Package className="w-3 h-3" />
            <span className="text-xs truncate">{productTitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleReject}
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

      <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-50/50 scrollbar-thin">
        {mergedMessages.length === 0 && (
          <p className="text-center text-xs text-gray-400 mt-8">No messages yet - say hello!</p>
        )}
        {mergedMessages.map((message) => {
          const messageId = getMessageId(message);
          let offerStatus = null;

          if (message.messageType === 'offer') {
            if (productSoldState?.offerId && productSoldState.offerId === messageId) {
              offerStatus = 'accepted';
            } else if (isProductSold) {
              offerStatus = 'sold';
            }
          }

          return (
            <ChatMessageBubble
              key={messageId || `${message.messageType}-${message.createdAt ?? message.timestamp}`}
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
              onClick={() => setOfferMode((value) => !value)}
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
              placeholder={offerMode ? 'Sending offer - press Send' : 'Type a message... (Enter to send)'}
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
          Chat is closed - this conversation is no longer active.
        </div>
      )}
    </div>
  );
}
