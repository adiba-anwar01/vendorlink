import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, PackagePlus, MessageSquare,
  ShoppingBag, BarChart2, User, LogOut, ChevronLeft,
  ChevronRight, Store, X,
} from 'lucide-react';
import useSidebarStore from '../../store/useSidebarStore';
import useAuthStore from '../../store/useAuthStore';

const navItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/products',      icon: Package,          label: 'Products'      },
  { to: '/products/add',  icon: PackagePlus,      label: 'Add Product'   },
  { to: '/conversations', icon: MessageSquare,    label: 'Conversations' },
  { to: '/orders',        icon: ShoppingBag,      label: 'Orders'        },
  { to: '/analytics',     icon: BarChart2,        label: 'Analytics'     },
  { to: '/profile',       icon: User,             label: 'Profile'       },
];

export default function Sidebar() {
  const { isCollapsed, isMobileOpen, toggleCollapsed, closeMobile } = useSidebarStore();
  const { vendor } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    closeMobile();
    navigate('/dashboard');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-100 dark:border-gray-800 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-gray-900 dark:bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
          <Store className="w-4 h-4 text-white dark:text-gray-900" />
        </div>
        {!isCollapsed && (
          <span className="font-bold text-gray-900 dark:text-white text-sm tracking-tight">
            VendorLink
          </span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={closeMobile}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center px-2' : ''}`
            }
            title={isCollapsed ? label : undefined}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Vendor info + Logout */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
        {!isCollapsed && (
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{vendor?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{vendor?.storeName}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`sidebar-link w-full ${isCollapsed ? 'justify-center px-2' : ''} text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-all duration-300 relative shrink-0 ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        <SidebarContent />

        {/* Collapse toggle */}
        <button
          onClick={toggleCollapsed}
          className="absolute -right-3 top-6 w-6 h-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-soft hover:shadow-card transition-shadow z-10"
        >
          {isCollapsed
            ? <ChevronRight className="w-3 h-3 text-gray-500" />
            : <ChevronLeft  className="w-3 h-3 text-gray-500" />
          }
        </button>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-50 lg:hidden transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button */}
        <button
          onClick={closeMobile}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
        <SidebarContent />
      </aside>
    </>
  );
}
