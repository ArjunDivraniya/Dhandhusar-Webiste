import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar.tsx';
import { Header } from './Header.tsx';
import { useAuth } from '../../context/auth-context.ts';
import { newsApi } from '../../api/news.api.ts';

export const AdminLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const { hasPermission } = useAuth();
  const location = useLocation();

  const getPageTitle = (pathname: string): string => {
    if (pathname === '/admin') return 'Overview';
    if (pathname === '/admin/news') return 'News & Announcements';
    if (pathname === '/admin/news/new') return 'Create Article';
    if (pathname.startsWith('/admin/news/edit')) return 'Edit Article';
    if (pathname.startsWith('/admin/news/')) return 'Article Details';
    if (pathname === '/admin/review') return 'Review Queue';
    if (pathname === '/admin/categories') return 'News Categories';
    return 'Admin Portal';
  };

  useEffect(() => {
    if (hasPermission('news.review')) {
      newsApi
        .listPendingReview(1, 1)
        .then((res) => setPendingCount(res.total || 0))
        .catch(() => {});
    }
  }, [hasPermission, location.pathname]);

  return (
    <div className="min-h-screen bg-[#F8F6F0]">
      {/* Sidebar */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        pendingCount={pendingCount}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          title={getPageTitle(location.pathname)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
