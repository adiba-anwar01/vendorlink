import { Store } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
            <Store className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-gray-800">VendorLink</span>
            <p className="text-[11px] text-gray-400 leading-none mt-0.5">Vendor Marketplace Platform</p>
          </div>
        </div>

        {/* Center text */}
        <p className="text-xs text-gray-400 text-center">
          © 2026 VendorLink · Built for modern vendors
        </p>

        {/* Links */}
        <div className="flex items-center gap-5">
          <a href="#" className="text-xs font-medium text-gray-500 hover:text-blue-500 transition-colors">Privacy</a>
          <a href="#" className="text-xs font-medium text-gray-500 hover:text-blue-500 transition-colors">Terms</a>
          <a href="#" className="text-xs font-medium text-gray-500 hover:text-blue-500 transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
}
