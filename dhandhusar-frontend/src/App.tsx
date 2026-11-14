import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { ProtectedRoute } from './components/routing/ProtectedRoute.tsx';

// Layouts
import { AdminLayout } from './components/layout/AdminLayout.tsx';
import { PublicLayout } from './components/public/PublicLayout.tsx';

// Public Pages
import { HomePage } from './pages/public/HomePage.tsx';
import { PublicNewsListPage } from './pages/public/PublicNewsListPage.tsx';
import { PublicNewsDetailPage } from './pages/public/PublicNewsDetailPage.tsx';
import { NotFoundPage } from './pages/public/NotFoundPage.tsx';

// Admin Pages
import { LoginPage } from './pages/auth/LoginPage.tsx';
import { OverviewPage } from './pages/dashboard/OverviewPage.tsx';
import { NewsListPage } from './pages/news/NewsListPage.tsx';
import { NewsEditorPage } from './pages/news/NewsEditorPage.tsx';
import { NewsDetailPage } from './pages/news/NewsDetailPage.tsx';
import { ReviewQueuePage } from './pages/review/ReviewQueuePage.tsx';
import { CategoriesPage } from './pages/categories/CategoriesPage.tsx';

import { Toaster } from 'sonner';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <Toaster position="top-right" richColors closeButton />
          <Routes>
            {/* ========================================================
                Public Website Routes
                ======================================================== */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/news" element={<PublicNewsListPage />} />
              <Route path="/news/:slug" element={<PublicNewsDetailPage />} />
              {/* Fallback 404 for Public Routes */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* ========================================================
                Admin Authentication
                ======================================================== */}
            <Route path="/login" element={<LoginPage />} />

            {/* ========================================================
                Protected Admin Portal Routes
                ======================================================== */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard Overview */}
              <Route index element={<OverviewPage />} />

              {/* News Articles Management */}
              <Route path="news" element={<NewsListPage />} />
              <Route
                path="news/new"
                element={
                  <ProtectedRoute requiredPermission="news.create">
                    <NewsEditorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="news/edit/:id"
                element={
                  <ProtectedRoute requiredPermission="news.edit">
                    <NewsEditorPage />
                  </ProtectedRoute>
                }
              />
              <Route path="news/:id" element={<NewsDetailPage />} />

              {/* Publisher Review Queue */}
              <Route
                path="review"
                element={
                  <ProtectedRoute requiredPermission="news.review">
                    <ReviewQueuePage />
                  </ProtectedRoute>
                }
              />

              {/* Categories */}
              <Route path="categories" element={<CategoriesPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;
