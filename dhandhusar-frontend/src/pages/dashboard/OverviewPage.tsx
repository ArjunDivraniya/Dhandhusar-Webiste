import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/auth-context.ts';
import { newsApi } from '../../api/news.api.ts';
import type { NewsArticle } from '../../types/news.types.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { Button } from '../../components/common/Button.tsx';
import { LoadingState } from '../../components/common/LoadingState.tsx';
import { EmptyState } from '../../components/common/EmptyState.tsx';
import {
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  Newspaper,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    drafts: 0,
    pending: 0,
    published: 0,
  });
  const [recentArticles, setRecentArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canCreateNews = hasPermission('news.create');
  const canReviewNews = hasPermission('news.review');

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch recent news articles and count by status
        const [allRes, pendingRes] = await Promise.all([
          newsApi.listAdminArticles({ limit: 100 }), // Get realistic sample to calculate metrics
          newsApi.listPendingReview(1, 1),
        ]);

        if (!isMounted) return;

        const articles = allRes.items || [];
        const draftsCount = articles.filter((a) => a.status === 'DRAFT').length;
        const publishedCount = articles.filter((a) => a.status === 'PUBLISHED').length;

        setStats({
          total: allRes.total || 0,
          drafts: draftsCount,
          pending: pendingRes.total || 0,
          published: publishedCount,
        });

        // Set top 5 recent articles
        setRecentArticles(articles.slice(0, 5));
      } catch (err: unknown) {
        if (!isMounted) return;
        setError((err as { message?: string })?.message || 'Failed to load dashboard metrics.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading editorial overview..." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#D9C6A5]/50 shadow-2xs">
        <div>
          <span className="text-[11px] font-semibold text-[#70452D] uppercase tracking-wider">
            Editorial Management
          </span>
          <h1 className="text-xl font-bold font-serif text-[#24231F] mt-0.5">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-[#5C5850] mt-1 max-w-xl">
            Explore Dhandusar bilingual content publishing system. Author, review, and curate heritage news and announcements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canCreateNews && (
            <Link to="/admin/news/new">
              <Button size="sm" icon={<Plus className="w-4 h-4" />}>
                Create Article
              </Button>
            </Link>
          )}
          {canReviewNews && stats.pending > 0 && (
            <Link to="/admin/review">
              <Button variant="secondary" size="sm" icon={<Clock className="w-4 h-4 text-amber-600" />}>
                Review Queue ({stats.pending})
              </Button>
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total News */}
        <div className="p-5 rounded-xl bg-white border border-[#D9C6A5]/40 shadow-2xs">
          <div className="flex items-center justify-between text-[#5C5850]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total News</span>
            <Newspaper className="w-4 h-4 text-[#70452D]" />
          </div>
          <p className="text-2xl font-bold font-serif text-[#24231F] mt-2">{stats.total}</p>
          <span className="text-[11px] text-[#5C5850] mt-0.5 block">Articles authored</span>
        </div>

        {/* Drafts */}
        <div className="p-5 rounded-xl bg-white border border-[#D9C6A5]/40 shadow-2xs">
          <div className="flex items-center justify-between text-[#5C5850]">
            <span className="text-xs font-semibold uppercase tracking-wider">Drafts</span>
            <FileText className="w-4 h-4 text-[#5C5850]" />
          </div>
          <p className="text-2xl font-bold font-serif text-[#24231F] mt-2">{stats.drafts}</p>
          <span className="text-[11px] text-[#5C5850] mt-0.5 block">Private in-progress</span>
        </div>

        {/* Pending Review */}
        <div className="p-5 rounded-xl bg-white border border-[#D9C6A5]/40 shadow-2xs">
          <div className="flex items-center justify-between text-[#5C5850]">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-serif text-amber-900 mt-2">{stats.pending}</p>
          <span className="text-[11px] text-amber-700 mt-0.5 block">Awaiting approval</span>
        </div>

        {/* Published */}
        <div className="p-5 rounded-xl bg-white border border-[#D9C6A5]/40 shadow-2xs">
          <div className="flex items-center justify-between text-[#5C5850]">
            <span className="text-xs font-semibold uppercase tracking-wider">Published</span>
            <CheckCircle2 className="w-4 h-4 text-[#315B3B]" />
          </div>
          <p className="text-2xl font-bold font-serif text-[#315B3B] mt-2">{stats.published}</p>
          <span className="text-[11px] text-[#315B3B]/80 mt-0.5 block">Live on village portal</span>
        </div>
      </div>

      {/* Recent Articles Section */}
      <div className="bg-white rounded-2xl border border-[#D9C6A5]/50 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-[#D9C6A5]/30 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold font-serif text-[#24231F]">
              Recent News Articles
            </h3>
            <p className="text-xs text-[#5C5850] mt-0.5">
              Latest editorial updates across Gujarati and English
            </p>
          </div>
          <Link
            to="/admin/news"
            className="text-xs font-medium text-[#315B3B] hover:text-[#23432B] flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentArticles.length === 0 ? (
          <EmptyState
            title="No news articles yet"
            description="Start authoring the first village update or announcement."
            actionLabel={canCreateNews ? 'Create Article' : undefined}
            onAction={() => (window.location.href = '/admin/news/new')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#24231F]">
              <thead className="bg-[#FAF7F0] border-b border-[#D9C6A5]/30 text-[#5C5850] font-semibold">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Languages</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9C6A5]/20">
                {recentArticles.map((article) => {
                  const guTrans = article.translations.find((t) => t.languageCode === 'GU');
                  const enTrans = article.translations.find((t) => t.languageCode === 'EN');
                  const displayTitle = guTrans?.title || enTrans?.title || 'Untitled Article';

                  return (
                    <tr key={article.id} className="hover:bg-[#FAF7F0]/60 transition-colors">
                      <td className="py-3 px-4 font-medium text-[#24231F] max-w-xs truncate">
                        {displayTitle}
                      </td>
                      <td className="py-3 px-4 text-[#5C5850]">
                        {article.category?.nameEn || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {guTrans && (
                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-[#F5F0E5] font-semibold text-[#70452D] border border-[#D9C6A5]/50">
                              GU
                            </span>
                          )}
                          {enTrans && (
                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-[#F5F0E5] font-semibold text-[#315B3B] border border-[#D9C6A5]/50">
                              EN
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={article.status} />
                      </td>
                      <td className="py-3 px-4 text-[#5C5850]">
                        {new Date(article.updatedAt || article.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/admin/news/${article.id}`}
                          className="text-[#315B3B] hover:underline font-medium"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
