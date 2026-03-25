import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
