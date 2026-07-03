import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Search } from 'lucide-react';
import { getMyConversations } from '../api/conversationApi';
import ConversationListItem from '../components/ConversationListItem';
import ChatPane from '../components/ChatPane';
import { InputWithIcon } from '@/components/ui';
import useAuthStore from '@/features/auth/hooks/useAuthStore';
import LoginPrompt from '@/features/auth/components/LoginPrompt';
import { getChatPartner, getDisplayName } from '../utils/chatUtils';
import { onSocketReady, getSocket } from '@/services/socket';

export default function Conversations() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const vendor = useAuthStore((s) => s.vendor);
  const { id: activeId } = useParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    let currentSocket = null;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await getMyConversations();
        const list = res.data?.conversations ?? res.data ?? [];
        if (isMounted) {
          const arr = Array.isArray(list) ? list : [];
          const sorted = arr.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          setConversations(sorted);

          const socket = getSocket();
          if (socket && socket.connected) {
            sorted.forEach(conv => {
              const id = conv._id ?? conv.id;
              if (id) socket.emit('joinChat', id);
            });
          }
        }
      } catch (err) {
        if (isMounted) setError(err.response?.data?.message || 'Failed to load conversations.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    const handleConnect = () => {
      setConversations(prev => {
        prev.forEach(conv => {
          const id = conv._id ?? conv.id;
          if (id) {
            const socket = getSocket();
            if (socket) socket.emit('joinChat', id);
          }
        });
        return prev;
      });
    };

    const handleNewMessage = (message) => {
      setConversations((prev) => {
        const convId = message.conversation?._id ?? message.conversation ?? message.conversationId;
        const index = prev.findIndex((c) => (c._id ?? c.id) === convId);
        if (index === -1) {
          load();
          return prev;
        }
        const updated = [...prev];
        const conv = { ...updated[index] };
        conv.lastMessage = message.text ?? message.message_text;
        conv.updatedAt = message.createdAt ?? new Date().toISOString();
        updated[index] = conv;
        return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    };

    const cancelReady = onSocketReady((socket) => {
      currentSocket = socket;

      setConversations(prev => {
        prev.forEach(conv => {
          const id = conv._id ?? conv.id;
          if (id) socket.emit('joinChat', id);
        });
        return prev;
      });

      socket.on('newMessage', handleNewMessage);
      socket.on('connect', handleConnect);
    });

    load();
    return () => {
      isMounted = false;
      cancelReady();
      if (currentSocket) {
        currentSocket.off('newMessage', handleNewMessage);
        currentSocket.off('connect', handleConnect);
      }
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <LoginPrompt
        title="Login to View Messages"
        message="You need to be logged in to view your conversations."
      />
    );
  }

  const filtered = conversations.filter((c) => {
    const chatPartner = getChatPartner(c, vendor);
    const partnerName = getDisplayName(chatPartner, '');
    const title = c.product?.title ?? '';
    const q = search.toLowerCase();
    return partnerName.toLowerCase().includes(q) || title.toLowerCase().includes(q);
  });

  const activeConversation = conversations.find((c) => (c._id ?? c.id) === activeId) ?? null;

  function handleConversationDeleted(deletedId) {
    setConversations((prev) =>
      prev.filter((conversation) => (conversation._id ?? conversation.id) !== deletedId)
    );

    if (activeId === deletedId) {
      navigate('/conversations');
    }
  }

  return (
    <div className="-mx-4 sm:-mx-6 -my-6 flex overflow-hidden bg-white" style={{ height: 'calc(100vh - 4rem)' }}>

      <div className={`w-72 xl:w-80 shrink-0 flex flex-col border-r border-gray-100 bg-white ${activeId ? 'hidden md:flex' : 'flex'}`}>
        <div className="px-4 pt-4 pb-3 border-b border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-bold text-gray-900">Messages</h1>
            <span className="text-xs font-semibold text-gradient-primary bg-brand-50 px-2 py-0.5 rounded-full">
              {conversations.length}
            </span>
          </div>
          <InputWithIcon
            icon={Search}
            placeholder="Search by name or product…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-xs text-gray-400 animate-pulse">Loading…</p>
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <p className="text-xs text-red-500">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
              <MessageSquare className="w-8 h-8 text-gray-200" />
              <p className="text-sm text-gray-400">
                {search ? 'No results found' : 'No conversations yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((conv) => (
                <ConversationListItem
                  key={conv._id ?? conv.id}
                  conversation={conv}
                  isActive={(conv._id ?? conv.id) === activeId}
                  onClick={() => navigate(`/conversations/${conv._id ?? conv.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`flex-1 min-w-0 ${activeId ? 'flex' : 'hidden md:flex'} flex-col`}>
        {activeId ? (
          <ChatPane
            key={activeId}
            conversationId={activeId}
            conversation={activeConversation}
            onBack={() => navigate('/conversations')}
            onDeleteConversation={handleConversationDeleted}
          />
        ) : (
          <EmptyState hasConversations={conversations.length > 0} />
        )}
      </div>
    </div>
  );
}

function EmptyState({ hasConversations }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-10 bg-gray-50/60">
      <div className="w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center shadow-sm">
        <MessageSquare className="w-9 h-9 text-brand-300" />
      </div>
      <div>
        <p className="text-base font-semibold text-gray-800">Select a conversation</p>
        <p className="text-sm text-gray-400 mt-1 max-w-xs">
          {hasConversations
            ? 'Choose a conversation from the list to start chatting.'
            : 'No conversations yet. Buyers will reach out through product listings.'}
        </p>
      </div>
    </div>
  );
}
