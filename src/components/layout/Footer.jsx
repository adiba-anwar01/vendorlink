import { Store, Mail, Phone, HelpCircle, ShieldCheck, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const quickLinks = [
  { label: 'Dashboard',     to: '/dashboard'     },
  { label: 'My Products',   to: '/products'      },
  { label: 'Explore Items', to: '/explore-items' },
  { label: 'My Orders',     to: '/my-orders'     },
  { label: 'Analytics',     to: '/analytics'     },
  { label: 'Profile',       to: '/profile'       },
];

export default function Footer() {
  return (
    <footer className="bg-gray-300 border-t border-gray-400/50 mt-auto">
      <div className="max-w-screen-xl mx-auto px-6 sm:px-8 py-4">
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-4 border-b border-gray-400/50">

          {/* Column 1 – Brand */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <Store className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <span className="text-sm font-bold text-gray-900">VendorLink</span>
                <p className="text-[11px] text-gray-600 leading-none mt-0.5">Vendor Marketplace Platform</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed max-w-xs">
              A modern marketplace connecting vendors and buyers. List, discover,
              and manage products — all in one place.
            </p>
          </div>

          {/* Column 2 – Quick Links */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-1.5">
              {quickLinks.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 – Support */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Support</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <a href="mailto:support@vendorlink.com" className="hover:text-gray-900 transition-colors">
                  support@vendorlink.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span>+1 (800) 000-0000</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <HelpCircle className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <a href="#" className="hover:text-gray-900 transition-colors">Help Center</a>
              </li>
            </ul>
            <div className="flex items-center gap-4 pt-0.5">
              <a href="#" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors">
                <ShieldCheck className="w-3 h-3 shrink-0" /> Privacy
              </a>
              <a href="#" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors">
                <FileText className="w-3 h-3 shrink-0" /> Terms
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-2.5 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-xs text-gray-500">
          <p>© 2026 VendorLink · Built for modern vendors</p>
          <p>All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
