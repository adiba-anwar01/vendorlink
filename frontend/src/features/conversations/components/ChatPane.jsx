import { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, Send, Package, IndianRupee, MoreVertical } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getMessages,
  sendMessage,
  acceptConversation,
  deleteConversation,
} from '../api/conversationApi';
import ChatMessageBubble from './ChatMessageBubble';
import useAuthStore from '@/features/auth/hooks/useAuthStore';
import useOfferStateStore from '@/features/orders/hooks/useOfferStateStore';
import { isVendorUser, getDisplayName } from '../utils/chatUtils';
import { getVendorId } from '@/utils/userUtils';
import { onSocketReady } from '@/services/socket';
import { useOrderFlow } from '@/features/orders/hooks/useOrderFlow';
import OrderModal from '@/features/orders/components/OrderModal';
import { PRODUCT_ORDERED_EVENT } from '@/utils/orderEvents';
import { inputField, btnPrimary } from '@/utils/theme';

function normalizeId(value) {
  return value == null ? '' : String(value);
}

function getMessageId(message) {
  return normalizeId(message?._id ?? message?.id);
}

function getSenderId(message) {
  return normalizeId(message?.sender?._id ?? message?.sender?.id ?? message?.sender ?? message?.senderId);
}

export default function ChatPane({
  conversationId,
  conversation,
  onBack,
  onDeleteConversation,
}) {
  const { vendor } = useAuthStore();
  const soldProducts = useOfferStateStore((s) => s.soldProducts);
  const markProductSold = useOfferStateStore((s) => s.markProductSold);

  const orderFlow = useOrderFlow();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [offerMode, setOfferMode] = useState(false);
  const [acting, setActing] = useState(false);
  const [activeConversation, setActiveConversation] = useState(conversation ?? null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const menuRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const hasOpenedConversationRef = useRef(false);

  const [prevConversation, setPrevConversation] = useState(conversation);
  if (conversation !== prevConversation) {
    setPrevConversation(conversation);
    setActiveConversation(conversation ?? null);
  }

  const [prevConversationId, setPrevConversationId] = useState(conversationId);
  if (conversationId !== prevConversationId) {
    setPrevConversationId(conversationId);
    setMenuOpen(false);
    hasOpenedConversationRef.current = false;
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  useEffect(() => {
    if (!conversationId) return;

    let currentSocket = null;

    const handleNewMessage = (newMessage) => {
      const msgConvId = normalizeId(newMessage.conversation?._id ?? newMessage.conversation ?? newMessage.conversationId);
      if (msgConvId && msgConvId !== conversationId) {
        return; // Ignore messages from other conversations
      }
      setMessages((prev) => {
        const msgId = getMessageId(newMessage);
        if (prev.some((m) => getMessageId(m) === msgId)) {
          return prev;
        }
        return [...prev, newMessage];
      });
    };

    const handleOfferUpdated = (updatedConversation) => {
      setActiveConversation(updatedConversation);
    };

    const handleConnect = () => {
      if (currentSocket && conversationId) {
        currentSocket.emit('joinChat', conversationId);
      }
    };

    const cancelReady = onSocketReady((socket) => {
      currentSocket = socket;
      socket.emit('joinChat', conversationId);
      socket.on('newMessage', handleNewMessage);
      socket.on('offerUpdated', handleOfferUpdated);
      socket.on('connect', handleConnect);
    });

    return () => {
      cancelReady();
      if (currentSocket) {
        currentSocket.off('newMessage', handleNewMessage);
        currentSocket.off('offerUpdated', handleOfferUpdated);
        currentSocket.off('connect', handleConnect);
      }
    };
  }, [conversationId]);

  const currentUserId = getVendorId(vendor);
  const product = activeConversation?.product ?? {};
  const productId = normalizeId(product._id ?? product.id);
  const productSoldState = productId ? soldProducts[productId] : null;
  const isVendor = isVendorUser(activeConversation, vendor);

  const chatPartner = isVendor
    ? getDisplayName(activeConversation?.buyer, 'User')
    : getDisplayName(activeConversation?.seller, 'User');

  const isProductSold = Boolean(productSoldState || product.status === 'sold');
  const areNewOffersDisabled = isProductSold;

  useEffect(() => {
    if (areNewOffersDisabled && offerMode) {
      setOfferMode(false);
    }
  }, [areNewOffersDisabled, offerMode]);

  useEffect(() => {
    function handleProductOrdered(e) {
      if (normalizeId(e.detail?.productId) === productId) {
        markProductSold({ productId, conversationId, soldAt: new Date().toISOString() });
      }
    }
    window.addEventListener(PRODUCT_ORDERED_EVENT, handleProductOrdered);
    return () => window.removeEventListener(PRODUCT_ORDERED_EVENT, handleProductOrdered);
  }, [productId, conversationId, markProductSold]);

  const latestOffer = useMemo(
    () => [...messages].reverse().find((m) => m.messageType === 'offer') ?? null,
    [messages]
  );

  const mergedMessages = (!isProductSold || !productId)
    ? messages
    : (() => {
      const systemId = `system-sold-${productId}`;
      if (messages.some((m) => getMessageId(m) === systemId)) return messages;
      return [
        ...messages,
        {
          id: systemId,
          messageType: 'system',
          text: 'Conversation closed because deal is final.',
          createdAt: productSoldState?.soldAt || new Date().toISOString()
        },
      ];
    })();

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const behavior = hasOpenedConversationRef.current ? 'smooth' : 'auto';
    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
    hasOpenedConversationRef.current = true;
  }, [mergedMessages]);

  async function refreshMessages() {
    try {
      const res = await getMessages(conversationId);
      const list = res.data?.messages ?? res.data ?? [];
      setMessages(Array.isArray(list) ? list : []);
    } catch { }
  }

  async function handleSend() {
    if (offerMode) {
      if (isProductSold) {
        toast.error('You cannot send a new offer after the order is placed.');
        return;
      }
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
          setMessages((prev) => {
            const msgId = getMessageId(msg);
            if (prev.some((m) => getMessageId(m) === msgId)) return prev;
            return [...prev, msg];
          });
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
        setMessages((prev) => {
          const msgId = getMessageId(msg);
          if (prev.some((m) => getMessageId(m) === msgId)) return prev;
          return [...prev, msg];
        });
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
      setActiveConversation((prev) => prev ? { ...prev, status: 'accepted' } : prev);
      toast.success('Offer accepted! Waiting for the buyer to place the order.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Accept failed.');
    } finally {
      setActing(false);
    }
  }

  async function handleDeleteConversation() {
    if (!conversationId || deleting) return;

    setDeleting(true);
    try {
      await deleteConversation(conversationId);
      toast.success('Conversation deleted.');
      onDeleteConversation?.(conversationId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete conversation.');
    } finally {
      setDeleting(false);
      setMenuOpen(false);
    }
  }

  const productTitle = product.title ?? 'Unknown Product';
  const areOfferActionsDisabled = acting || isProductSold;

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-brand-50 to-white shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </button>
        )}

        <div className="w-9 h-9 bg-brand-100 rounded-xl flex items-center justify-center text-xs font-bold text-gradient-primary shrink-0">
          {chatPartner.slice(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">{chatPartner}</p>
          <div className="flex items-center gap-1 text-gray-400">
            <Package className="w-3 h-3 shrink-0" />
            <span className="text-xs truncate">{productTitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Conversation actions"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-32 rounded-xl border border-gray-200 bg-white shadow-lg py-1 z-10">
                <button
                  type="button"
                  onClick={handleDeleteConversation}
                  disabled={deleting}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>

          {isVendor && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleAccept}
                disabled={areOfferActionsDisabled}
                className={`${btnPrimary} text-xs py-1.5 px-3 disabled:opacity-50`}
              >
                Accept
              </button>
            </div>
          )}
        </div>

        {isProductSold && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
            Sold
          </span>
        )}
      </div>

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-50/40 scrollbar-thin"
      >
        {loading ? (
          <div className="flex-1 flex items-center justify-center h-full mt-8">
            <p className="text-sm text-gray-400 animate-pulse">Loading messages...</p>
          </div>
        ) : mergedMessages.length === 0 && (
          <p className="text-center text-xs text-gray-400 mt-8">No messages yet — say hello!</p>
        )}

        {mergedMessages.map((message) => {
          const msgId = getMessageId(message);
          let offerStatus = null;
          if (message.messageType === 'offer') {
            if (activeConversation?.status === 'accepted' && msgId === getMessageId(latestOffer)) {
              offerStatus = 'accepted';
            } else if (productSoldState?.offerId && productSoldState.offerId === msgId) {
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
        {activeConversation?.status === 'accepted' && !isProductSold && !isVendor && latestOffer && (
          <div className="flex justify-start mt-2 mb-2">
            <button
              onClick={() => orderFlow.openOrderFlow(productId, latestOffer.offerPrice)}
              className="px-5 py-2.5 bg-gradient-primary text-black rounded-xl text-sm font-bold hover:opacity-90 transition-colors shadow-sm"
            >
              Proceed To Order
            </button>
          </div>
        )}
        <div />
      </div>

      <div className="px-4 py-3 border-t border-gray-100 bg-white shrink-0 space-y-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOfferMode((v) => !v)}
            disabled={loading || areNewOffersDisabled}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-300 ${offerMode
              ? 'bg-gradient-primary border-transparent text-white shadow-sm'
              : `bg-gray-50 border-gray-200 text-gray-500 ${!areNewOffersDisabled ? 'hover:bg-brand-50 hover:border-brand-200 hover:text-brand-600' : ''}`
              } disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap`}
          >
            <IndianRupee className="w-3 h-3" />
            {offerMode ? 'Offer Mode ON' : 'Make Offer'}
          </button>
          {offerMode && (
            <input
              type="number"
              placeholder="Offer price..."
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              disabled={areNewOffersDisabled}
              className={`border border-gray-200 rounded-[0.625rem] px-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all duration-300 w-48 disabled:opacity-50 disabled:cursor-not-allowed`}
            />
          )}
        </div>

        <div className="flex items-end gap-3">
          <textarea
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={loading ? 'Loading...' : (isProductSold ? 'Chat closed (Product sold)' : (offerMode ? 'Sending offer — press Send' : 'Type a message... (Enter to send)'))}
            disabled={loading || isProductSold}
            className={`${inputField} resize-none flex-1 min-h-[40px] max-h-28 disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          <button
            onClick={handleSend}
            disabled={
              loading ||
              isProductSold ||
              sending ||
              (offerMode
                ? areNewOffersDisabled || !offerPrice || Number(offerPrice) <= 0
                : !text.trim())
            }
            className={`${btnPrimary} shrink-0 p-2.5 disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {orderFlow.isOpen && (
        <OrderModal
          item={orderFlow.item}
          onClose={orderFlow.closeOrderFlow}
          onConfirm={orderFlow.handleConfirmOrder}
        />
      )}
    </div>
  );
}
