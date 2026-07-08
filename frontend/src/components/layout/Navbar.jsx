import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Bell,
  ChevronDown,
  User,
  LogOut,
  Store,
  Menu,
  X,
  ShoppingBag,
} from "lucide-react";
import useAuthStore from "@/features/auth/hooks/useAuthStore";
import { getInitials } from "@/utils/userUtils";
import { NAV_ITEMS_LEFT, NAV_ITEMS_RIGHT, ORDER_LINKS } from "@/constants/navigation";

export default function Navbar() {
  const { vendor, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully.");
    navigate("/login", { replace: true });
  };

  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);

  const dropRef = useRef(null);
  const ordersRef = useRef(null);

  const isOrdersActive =
    location.pathname === "/orders" || location.pathname === "/my-orders";

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setDropOpen(false);
      if (ordersRef.current && !ordersRef.current.contains(e.target))
        setOrdersOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNavClick = () => {
    setMobileOpen(false);
    setOrdersOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <NavLink
            to="/home"
            className="flex items-center gap-2.5 shrink-0"
          >
            <div className="w-8 h-8 bg-gradient-primary rounded-xl flex items-center justify-center shadow-sm">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gradient-primary text-lg tracking-tight hidden sm:block">
              VendorLink
            </span>
          </NavLink>

          <nav className="hidden lg:flex items-center gap-4 flex-1 justify-center">
            {NAV_ITEMS_LEFT.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => 
                  `group inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-brand-600"
                      : "text-gray-600 hover:bg-brand-50/50"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-brand-600" : "group-hover:text-brand-600"}`} />
                    <span className={isActive ? "text-gradient-primary font-semibold" : "group-hover:text-gradient-primary"}>
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}

            <div className="relative" ref={ordersRef}>
              <button
                onClick={() => setOrdersOpen((v) => !v)}
                className={`group inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isOrdersActive
                    ? "text-brand-600"
                    : "text-gray-600 hover:bg-brand-50/50"
                }`}
              >
                <ShoppingBag className={`w-4 h-4 shrink-0 ${isOrdersActive ? "text-brand-600" : "group-hover:text-brand-600"}`} />
                <span className={isOrdersActive ? "text-gradient-primary font-semibold" : "group-hover:text-gradient-primary"}>
                  Orders
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 shrink-0 transition-transform ${ordersOpen ? "rotate-180" : ""} ${isOrdersActive ? "text-brand-600" : "group-hover:text-brand-600"}`}
                />
              </button>

              {ordersOpen && (
                <div className="absolute top-12 left-0 w-52 bg-white rounded-lg border border-gray-100 shadow-xl z-50 animate-slide-down overflow-hidden">
                  {ORDER_LINKS.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setOrdersOpen(false)}
                      className={({ isActive }) =>
                        `group flex flex-col px-4 py-3 text-sm transition-colors hover:bg-brand-50/50 ${
                          isActive
                            ? "bg-transparent text-brand-600"
                            : "text-gray-700"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <span className={`font-bold ${isActive ? "text-gradient-primary" : "group-hover:text-gradient-primary"}`}>
                          {link.label}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            {NAV_ITEMS_RIGHT.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => 
                  `group inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-brand-600"
                      : "text-gray-600 hover:bg-brand-50/50"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-brand-600" : "group-hover:text-brand-600"}`} />
                    <span className={isActive ? "text-gradient-primary font-semibold" : "group-hover:text-gradient-primary"}>
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {isAuthenticated ? (
              <>
                <div className="p-2 rounded-xl hover:bg-brand-50/50 transition-colors cursor-default group">
                  <Bell className="w-5 h-5 text-gray-400 group-hover:text-brand-500 transition-colors" />
                </div>

                <div className="relative" ref={dropRef}>
                  <button
                    onClick={() => setDropOpen((v) => !v)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-brand-50/50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-primary rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-[11px] font-bold text-white">
                        {getInitials(vendor?.name)}
                      </span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-semibold text-gray-800 leading-tight">
                        {vendor?.name?.split(" ")[0]}
                      </p>
                      <p className="text-[10px] text-gray-400 leading-tight">
                        Store
                      </p>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dropOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {dropOpen && (
                    <div className="absolute right-0 top-14 w-52 bg-white rounded-lg border border-gray-100 shadow-xl z-50 animate-slide-down overflow-hidden">
                      <div className="px-4 py-3 bg-gradient-to-br from-brand-50 to-white border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {vendor?.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {vendor?.email}
                        </p>
                      </div>
                      <div className="p-1.5">
                        <DropItem
                          icon={User}
                          label="Profile"
                          onClick={() => {
                            navigate("/profile");
                            setDropOpen(false);
                          }}
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
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-primary text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-colors"
              >
                <User className="w-4 h-4" />
                Login
              </button>
            )}

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {mobileOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1 animate-slide-down">
            {[...NAV_ITEMS_LEFT, ...NAV_ITEMS_RIGHT].map(
              ({ to, icon: Icon, label }) => {
                if (label === "Messages") {
                  return (
                    <div key="orders-mobile-group" className="space-y-1">
                      {ORDER_LINKS.map((link) => (
                        <NavLink
                          key={link.to}
                          to={link.to}
                          onClick={handleNavClick}
                          className={({ isActive }) =>
                            `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                              isActive
                                ? "bg-brand-50 text-brand-600"
                                : "text-gray-600 hover:bg-gray-50"
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <ShoppingBag className={`w-4 h-4 ${isActive ? "text-brand-600" : "group-hover:text-brand-600"}`} />
                              <span className={isActive ? "text-gradient-primary font-bold" : "group-hover:text-gradient-primary"}>
                                {link.label}
                              </span>
                            </>
                          )}
                        </NavLink>
                      ))}
                      <NavLink
                        to={to}
                        onClick={handleNavClick}
                        className={({ isActive }) =>
                          `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-brand-50 text-brand-600"
                              : "text-gray-600 hover:bg-gray-50"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Icon className={`w-4 h-4 ${isActive ? "text-brand-600" : "group-hover:text-brand-600"}`} />
                            <span className={isActive ? "text-gradient-primary font-bold" : "group-hover:text-gradient-primary"}>
                              {label}
                            </span>
                          </>
                        )}
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
                      `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-brand-50 text-brand-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`w-4 h-4 ${isActive ? "text-brand-600" : "group-hover:text-brand-600"}`} />
                        <span className={isActive ? "text-gradient-primary font-bold" : "group-hover:text-gradient-primary"}>
                          {label}
                        </span>
                      </>
                    )}
                  </NavLink>
                );
              },
            )}
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
      className={`group w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        danger
          ? "text-red-500 hover:bg-red-50"
          : "text-gray-700 hover:bg-brand-50/50"
      }`}
    >
      <Icon className={`w-4 h-4 ${danger ? "" : "group-hover:text-brand-600"}`} />
      <span className={danger ? "" : "group-hover:text-gradient-primary"}>{label}</span>
    </button>
  );
}
