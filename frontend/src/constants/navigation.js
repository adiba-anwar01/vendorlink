import {
  Home,
  Package,
  MessageSquare,
  BarChart2,
  Compass,
} from 'lucide-react';

export const NAV_ITEMS_LEFT = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/explore-items', icon: Compass, label: 'Explore Items' },
  { to: '/products', icon: Package, label: 'Products' },
];

export const NAV_ITEMS_RIGHT = [
  { to: '/conversations', icon: MessageSquare, label: 'Messages' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
];

export const ORDER_LINKS = [
  { to: '/orders', label: 'Orders Received' },
  { to: '/my-orders', label: 'My Orders' },
];

export const QUICK_LINKS = [
  { label: 'Home', to: '/home' },
  { label: 'My Products', to: '/products' },
  { label: 'Explore Items', to: '/explore-items' },
  { label: 'My Orders', to: '/my-orders' },
  { label: 'Analytics', to: '/analytics' },
  { label: 'Profile', to: '/profile' },
];
