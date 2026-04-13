import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Search } from 'lucide-react';
import { getMyConversations } from '../api/conversationApi';
import ConversationListItem from '../components/conversations/ConversationListItem';
import ChatPane from '../components/conversations/ChatPane';
import InputWithIcon from '../components/ui/InputWithIcon';

export default function Conversations() {
  const { id: activeId } = useParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await getMyConversations();
        const list = res.data?.conversations ?? res.data ?? [];
        if (isMounted) setConversations(Array.isArray(list) ? list : []);
      } catch (err) {
        if (isMounted) setError(err.response?.data?.message || 'Failed to load conversations.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => { isMounted = false; };
  }, []);

  const filtered = conversations.filter((c) => {
    const buyer = c.buyer?.name ?? c.buyer?.email ?? '';
    const title = c.product?.title ?? '';
    const q = search.toLowerCase();
    return buyer.toLowerCase().includes(q) || title.toLowerCase().includes(q);
  });

  const activeConversation = conversations.find((c) => (c._id ?? c.id) === activeId) ?? null;

  return (
    <div className="-mx-4 sm:-mx-6 -my-6 flex overflow-hidden bg-white" style={{ height: 'calc(100vh - 4rem)' }}>

      <div className={`w-72 xl:w-80 shrink-0 flex flex-col border-r border-gray-100 bg-white ${activeId ? 'hidden md:flex' : 'flex'}`}>
        <div className="px-4 pt-4 pb-3 border-b border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-bold text-gray-900">Messages</h1>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
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
      <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center shadow-sm">
        <MessageSquare className="w-9 h-9 text-blue-300" />
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
