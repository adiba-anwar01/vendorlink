import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import DashboardLayout from './components/layout/DashboardLayout';
import PublicRoute from './components/PublicRoute';

import VendorLogin from './pages/VendorLogin';
import VendorRegister from './pages/VendorRegister';

import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import ProductDetails from './pages/ProductDetails';
import EditProduct from './pages/EditProduct';
import Conversations from './pages/Conversations';
import Orders from './pages/Orders';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';
import ExploreItems from './pages/ExploreItems';
import UserItemDetail from './pages/UserItemDetail';

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<PublicRoute><VendorLogin /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><VendorRegister /></PublicRoute>} />

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
    </BrowserRouter>
  );
}
