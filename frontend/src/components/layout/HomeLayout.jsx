import { useLocation, Outlet } from 'react-router-dom';
import { useEffect, Suspense } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { PageLoader } from '@/components/ui';

export default function HomeLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 py-6 min-h-[calc(100vh-180px)]">
        <Suspense fallback={<PageLoader />}>
          <div key={location.pathname} className="animate-page-enter">
            <Outlet />
          </div>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
