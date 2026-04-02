import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Search } from 'lucide-react';
import { getMyConversations } from '../api/conversationApi';
import ConversationListItem from '../components/conversations/ConversationListItem';
import InputWithIcon from '../components/ui/InputWithIcon';

export default function Conversations() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [search, setSearch]               = useState('');

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const res  = await getMyConversations();
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
    const buyerName = c.buyer?.name ?? c.buyer?.email ?? '';
    const title     = c.product?.title ?? '';
    const q         = search.toLowerCase();
    return buyerName.toLowerCase().includes(q) || title.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400 animate-pulse">Loading conversations…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-red-500 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary mt-4"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search */}
      <InputWithIcon
        icon={Search}
        placeholder="Search by buyer or product…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card p-16 flex flex-col items-center gap-3 text-center">
          <MessageSquare className="w-10 h-10 text-gray-200" />
          <p className="text-sm text-gray-500 font-medium">No conversations yet</p>
          <p className="text-xs text-gray-400">
            Start a conversation from a product listing to begin negotiating.
          </p>
        </div>
      ) : (
        <div className="card divide-y divide-gray-50 overflow-hidden">
          {filtered.map((conv) => (
            <ConversationListItem
              key={conv._id ?? conv.id}
              conversation={conv}
              onClick={() => navigate(`/conversations/${conv._id ?? conv.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
