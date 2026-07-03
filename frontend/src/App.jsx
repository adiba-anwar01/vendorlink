import { Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { DashboardLayout } from "@/components/layout";
import { PageLoader } from "@/components/ui";
import PublicRoute from "@/features/auth/routes/PublicRoute";
import useAuthStore from "@/features/auth/hooks/useAuthStore";
import { initializeSocket, disconnectSocket } from "@/services/socket";

import VendorLogin from "@/features/auth/pages/VendorLogin";
import VendorRegister from "@/features/auth/pages/VendorRegister";
import Dashboard from "@/features/dashboard/pages/Dashboard";
import Products from "@/features/products/pages/Products";
import AddProduct from "@/features/products/pages/AddProduct";
import ProductDetails from "@/features/products/pages/ProductDetails";
import EditProduct from "@/features/products/pages/EditProduct";
import Conversations from "@/features/conversations/pages/Conversations";
import Orders from "@/features/orders/pages/Orders";
import Analytics from "@/features/dashboard/pages/Analytics";
import Profile from "@/features/profile/pages/Profile";
import MyOrders from "@/features/orders/pages/MyOrders";
import ExploreItems from "@/features/explore/pages/ExploreItems";
import UserItemDetail from "@/features/explore/pages/UserItemDetail";

function AppContent() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('token');
      if (token) {
        initializeSocket(token);
      }
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated]);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <VendorLogin />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <VendorRegister />
              </PublicRoute>
            }
          />

          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/add" element={<AddProduct />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/products/:id/edit" element={<EditProduct />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/conversations/:id" element={<Conversations />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/explore-items" element={<ExploreItems />} />
            <Route path="/explore-items/:id" element={<UserItemDetail />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}