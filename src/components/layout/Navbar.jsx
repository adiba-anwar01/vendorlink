import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Bell, ChevronDown, User, LogOut, Store, Menu, X,
  LayoutDashboard, Package, ShoppingBag, MessageSquare, BarChart2, Compass,
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

// Desktop Nav links — Orders is handled separately as a dropdown in the middle
const navItemsLeft = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/explore-items', icon: Compass,          label: 'Explore Items' },
  { to: '/products',      icon: Package,          label: 'Products'      },
];
const navItemsRight = [
  { to: '/conversations', icon: MessageSquare,    label: 'Messages'      },
  { to: '/analytics',     icon: BarChart2,        label: 'Analytics'     },
];

const orderLinks = [
  { to: '/orders',    label: 'Orders Received' },
  { to: '/my-orders', label: 'My Orders'       },
];

const notifications = [
  { id: 1, text: 'Sarah Chen sent a message about iPhone 14 Pro', time: '2m ago', unread: true },
  { id: 2, text: 'New order received for MacBook Air M2',          time: '1h ago', unread: true },
  { id: 3, text: 'Priya Patel is asking about shipping to CA',     time: '2h ago', unread: false },
];

const getInitials = (name) =>
  name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'VL';

export default function Navbar() {
  const { vendor, logout, isAuthenticated } = useAuthStore();
  const navigate   = useNavigate();
  const location   = useLocation();

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully.');
    navigate('/login', { replace: true });
  };
  const [dropOpen,    setDropOpen]    = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [ordersOpen,  setOrdersOpen]  = useState(false);

  const dropRef   = useRef(null);
  const notifRef  = useRef(null);
  const ordersRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const isOrdersActive = location.pathname === '/orders' || location.pathname === '/my-orders';

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current   && !dropRef.current.contains(e.target))   setDropOpen(false);
      if (notifRef.current  && !notifRef.current.contains(e.target))  setNotifOpen(false);
      if (ordersRef.current && !ordersRef.current.contains(e.target)) setOrdersOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNavClick = () => { setMobileOpen(false); setOrdersOpen(false); };

  return (
    <>
      <header
        className="sticky top-0 z-50 bg-white border-b border-gray-200"
        style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <NavLink to="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-base tracking-tight hidden sm:block">
              VendorLink
            </span>
          </NavLink>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-4 flex-1 justify-center">
            {navItemsLeft.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </NavLink>
            ))}

            {/* Orders dropdown */}
            <div className="relative" ref={ordersRef}>
              <button
                onClick={() => setOrdersOpen((v) => !v)}
                className={`nav-link flex items-center gap-1.5 ${
                  isOrdersActive ? 'active' : ''
                }`}
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                Orders
                <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${ordersOpen ? 'rotate-180' : ''}`} />
              </button>

              {ordersOpen && (
                <div className="absolute top-12 left-0 w-52 card shadow-xl z-50 animate-slide-down overflow-hidden"
                  style={{ border: '1px solid #e4e4e7' }}>
                  {orderLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setOrdersOpen(false)}
                      className={({ isActive }) =>
                        `flex flex-col px-4 py-3 text-sm transition-colors hover:bg-blue-50
                        ${ isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700' }`
                      }
                    >
                      <span className="font-bold">{link.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            {navItemsRight.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2 shrink-0">

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => { setNotifOpen((v) => !v); setDropOpen(false); }}
                    className="relative p-2 rounded-xl hover:bg-blue-50 transition-colors"
                  >
                    <Bell className="w-5 h-5 text-gray-500" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </button>

                  {notifOpen && (
                    <div
                      className="absolute right-0 top-14 w-80 card shadow-xl z-50 animate-slide-down overflow-hidden"
                      style={{ border: '1px solid #e4e4e7' }}
                    >
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">Notifications</p>
                        {unreadCount > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-600 font-semibold px-2 py-0.5 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto scrollbar-thin">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`px-4 py-3 cursor-pointer transition-colors hover:bg-blue-50 ${
                              n.unread ? 'bg-blue-50/60' : ''
                            }`}
                          >
                            <div className="flex gap-3">
                              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                n.unread ? 'bg-blue-500' : 'bg-gray-300'
                              }`} />
                              <div>
                                <p className={`text-xs leading-relaxed ${
                                  n.unread ? 'text-gray-900 font-medium' : 'text-gray-500'
                                }`}>
                                  {n.text}
                                </p>
                                <p className="text-[11px] text-gray-400 mt-0.5">{n.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropRef}>
                  <button
                    onClick={() => { setDropOpen((v) => !v); setNotifOpen(false); }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-blue-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-[11px] font-bold text-white">
                        {getInitials(vendor?.name)}
                      </span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-semibold text-gray-800 leading-tight">
                        {vendor?.name?.split(' ')[0]}
                      </p>
                      <p className="text-[10px] text-gray-400 leading-tight">Store</p>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {dropOpen && (
                    <div
                      className="absolute right-0 top-14 w-52 card shadow-xl z-50 animate-slide-down overflow-hidden"
                      style={{ border: '1px solid #e4e4e7' }}
                    >
                      {/* User info header */}
                      <div className="px-4 py-3 bg-gradient-to-br from-blue-50 to-white border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{vendor?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{vendor?.email}</p>
                      </div>
                      <div className="p-1.5">
                        <DropItem
                          icon={User}
                          label="Profile"
                          onClick={() => { navigate('/profile'); setDropOpen(false); }}
                        />
                        <DropItem
                          icon={LogOut}
                          label="Logout"
                          onClick={handleLogout}
                          danger
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Login button — shown when no vendor session exists */
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-xl hover:bg-blue-600 transition-colors"
              >
                <User className="w-4 h-4" />
                Login
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {mobileOpen
                ? <X className="w-5 h-5 text-gray-600" />
                : <Menu className="w-5 h-5 text-gray-600" />
              }
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileOpen && (
          <div
            className="lg:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1 animate-slide-down"
          >
            {[...navItemsLeft, ...navItemsRight].map(({ to, icon: Icon, label }) => {
              if (label === 'Messages') {
                return (
                  <div key="orders-mobile-group" className="space-y-1">
                    {orderLinks.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={handleNavClick}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`
                        }
                      >
                        <ShoppingBag className="w-4 h-4" />
                        {link.label}
                      </NavLink>
                    ))}
                    <NavLink
                      to={to}
                      onClick={handleNavClick}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </NavLink>
                  </div>
                );
              }

              return (
                <NavLink
                  key={to}
                  to={to}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              );
            })}
          </div>
        )}
      </header>
    </>
  );
}

function DropItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        danger
          ? 'text-red-500 hover:bg-red-50'
          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
