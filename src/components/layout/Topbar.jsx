import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useSidebarStore from '../../store/useSidebarStore';

export default function Topbar() {
  const { vendor } = useAuthStore();
  const { toggleMobile } = useSidebarStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getInitials = (name) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'V';

  const notifications = [
    { id: 1, text: 'Sarah Chen sent a message about iPhone 14 Pro', time: '2m ago', unread: true },
    { id: 2, text: 'New order received for MacBook Air M2', time: '1h ago', unread: true },
    { id: 3, text: 'Priya Patel is asking about shipping to CA', time: '2h ago', unread: false },
  ];
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Hamburger – mobile only */}
        <button
          onClick={toggleMobile}
          className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Store name */}
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{vendor?.storeName}</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen((v) => !v); setDropdownOpen(false); }}
            className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gray-900 dark:bg-white rounded-full" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 card shadow-lg z-50 animate-fade-in overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</p>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${n.unread ? 'bg-gray-50/60 dark:bg-gray-800/40' : ''}`}
                  >
                    <p className={`text-xs leading-relaxed ${n.unread ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                      {n.text}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => { setDropdownOpen((v) => !v); setNotifOpen(false); }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="w-7 h-7 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-[11px] font-bold text-white dark:text-gray-900">
                {getInitials(vendor?.name)}
              </span>
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
              {vendor?.name?.split(' ')[0]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-48 card shadow-lg z-50 animate-fade-in overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{vendor?.name}</p>
                <p className="text-[11px] text-gray-500 truncate">{vendor?.email}</p>
              </div>
              <div className="p-1">
                <DropItem icon={User}     label="Profile"  onClick={() => { navigate('/profile');  setDropdownOpen(false); }} />
                <DropItem icon={Settings} label="Settings" onClick={() => { setDropdownOpen(false); }} />
                <DropItem icon={LogOut}   label="Logout"   onClick={() => { setDropdownOpen(false); }} danger />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function DropItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
        danger
          ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
