import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { newsApi } from '../../api/news.api.ts';
import { categoryApi } from '../../api/category.api.ts';
import { useAuth } from '../../context/auth-context.ts';
import type { NewsArticle, NewsCategory, ContentStatus } from '../../types/news.types.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { Button } from '../../components/common/Button.tsx';
import { Input } from '../../components/common/Input.tsx';
import { Select } from '../../components/common/Select.tsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.tsx';
import { LoadingState } from '../../components/common/LoadingState.tsx';
import { EmptyState } from '../../components/common/EmptyState.tsx';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Send,
  Archive,
  CheckCircle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

export const NewsListPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Confirmation dialogs
  const [archiveTarget, setArchiveTarget] = useState<NewsArticle | null>(null);
  const [submitTarget, setSubmitTarget] = useState<NewsArticle | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const canCreate = hasPermission('news.create');
  const canEdit = hasPermission('news.edit');
  const canSubmitReview = hasPermission('news.submit_review');
  const canPublish = hasPermission('news.publish');
  const canArchive = hasPermission('news.archive');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [newsData, catData] = await Promise.all([
        newsApi.listAdminArticles({
          search: search || undefined,
          status: (statusFilter as ContentStatus) || undefined,
          categoryId: categoryFilter || undefined,
          page,
          limit: 10,
        }),
        categoryApi.listCategories(),
      ]);

      setArticles(newsData.items);
      setTotal(newsData.total);
      setTotalPages(newsData.totalPages || 1);
      setCategories(catData);
    } catch {
      toast.error('Failed to load news articles.');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, categoryFilter, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    setActionLoading(true);
    try {
      await newsApi.archiveArticle(archiveTarget.id);
      toast.success('Article archived successfully.');
      setArchiveTarget(null);
      loadData();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Failed to archive article.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!submitTarget) return;
    setActionLoading(true);
    try {
      await newsApi.submitForReview(submitTarget.id);
      toast.success('Article submitted for review.');
      setSubmitTarget(null);
      loadData();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Failed to submit article for review.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Main Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold font-serif text-[#24231F]">News & Updates</h1>
          <p className="text-xs text-[#5C5850] mt-0.5">
            Manage village announcements, editorial news, and public notices ({total} total)
          </p>
        </div>

        {canCreate && (
          <Link to="/admin/news/new">
            <Button size="sm" icon={<Plus className="w-4 h-4" />}>
              Create Article
            </Button>
          </Link>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 bg-white rounded-xl border border-[#D9C6A5]/50 shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search by title, summary, or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              placeholder="All Statuses"
              options={[
                { value: 'DRAFT', label: 'Draft' },
                { value: 'PENDING_REVIEW', label: 'Pending Review' },
                { value: 'CHANGES_REQUESTED', label: 'Changes Requested' },
                { value: 'PUBLISHED', label: 'Published' },
                { value: 'ARCHIVED', label: 'Archived' },
                { value: 'REJECTED', label: 'Rejected' },
              ]}
            />
          </div>

          <div>
            <Select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              placeholder="All Categories"
              options={categories.map((c) => ({
                value: c.id,
                label: `${c.nameEn} (${c.nameGu})`,
              }))}
            />
          </div>
        </form>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-[#D9C6A5]/50 shadow-2xs overflow-hidden">
        {isLoading ? (
          <LoadingState message="Loading articles list..." />
        ) : articles.length === 0 ? (
          <EmptyState
            title="No news articles found"
            description="Adjust your search filters or create a new article draft."
            actionLabel={canCreate ? 'Create Article' : undefined}
            onAction={() => navigate('/admin/news/new')}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#24231F]">
                <thead className="bg-[#FAF7F0] border-b border-[#D9C6A5]/30 text-[#5C5850] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Language</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Author</th>
                    <th className="py-3 px-4">Updated</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9C6A5]/20">
                  {articles.map((article) => {
                    const guTrans = article.translations?.find((t) => t.languageCode === 'GU');
                    const enTrans = article.translations?.find((t) => t.languageCode === 'EN');
                    const primaryTitle = guTrans?.title || enTrans?.title || 'Untitled Article';
                    const isDraft = article.status === 'DRAFT' || article.status === 'CHANGES_REQUESTED';
                    const isPending = article.status === 'PENDING_REVIEW';
                    const isPublished = article.status === 'PUBLISHED';

                    return (
                      <tr key={article.id} className="hover:bg-[#FAF7F0]/60 transition-colors">
                        <td className="py-3 px-4 font-medium text-[#24231F] max-w-xs">
                          <Link
                            to={`/admin/news/${article.id}`}
                            className="hover:text-[#315B3B] hover:underline truncate block"
                          >
                            {primaryTitle}
                          </Link>
                          {article.isPinned && (
                            <span className="inline-block mt-0.5 text-[10px] text-[#70452D] font-semibold">
                              📌 Pinned Announcement
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[#5C5850]">
                          {article.category?.nameEn || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            {guTrans && (
                              <span
                                title="Gujarati translation available"
                                className="px-1.5 py-0.5 text-[10px] rounded bg-[#F5F0E5] font-semibold text-[#70452D] border border-[#D9C6A5]/50"
                              >
                                GU
                              </span>
                            )}
                            {enTrans && (
                              <span
                                title="English translation available"
                                className="px-1.5 py-0.5 text-[10px] rounded bg-[#F5F0E5] font-semibold text-[#315B3B] border border-[#D9C6A5]/50"
                              >
                                EN
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={article.status} />
                        </td>
                        <td className="py-3 px-4 text-[#5C5850]">
                          {article.author?.name || 'Administrator'}
                        </td>
                        <td className="py-3 px-4 text-[#5C5850]">
                          {new Date(article.updatedAt || article.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="relative inline-flex items-center gap-1">
                            <button
                              type="button"
                              title="View details"
                              onClick={() => navigate(`/admin/news/${article.id}`)}
                              className="p-1 rounded text-[#5C5850] hover:text-[#315B3B] hover:bg-[#F5F0E5]"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {canEdit && (
                              <button
                                type="button"
                                title="Edit article"
                                onClick={() => navigate(`/admin/news/edit/${article.id}`)}
                                className="p-1 rounded text-[#5C5850] hover:text-[#315B3B] hover:bg-[#F5F0E5]"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Secondary Actions Dropdown */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveMenuId(activeMenuId === article.id ? null : article.id)
                                }
                                className="p-1 rounded text-[#5C5850] hover:text-[#24231F] hover:bg-[#F5F0E5]"
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>

                              {activeMenuId === article.id && (
                                <div className="absolute right-0 mt-1 w-44 rounded-lg bg-white shadow-lg border border-[#D9C6A5]/60 z-30 py-1 text-xs">
                                  {isDraft && canSubmitReview && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        setSubmitTarget(article);
                                      }}
                                      className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-[#F5F0E5] text-[#315B3B]"
                                    >
                                      <Send className="w-3.5 h-3.5" />
                                      <span>Submit for Review</span>
                                    </button>
                                  )}

                                  {isPending && canPublish && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        navigate('/admin/review');
                                      }}
                                      className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-[#F5F0E5] text-[#315B3B]"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      <span>Open in Review</span>
                                    </button>
                                  )}

                                  {(isPublished || isDraft) && canArchive && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        setArchiveTarget(article);
                                      }}
                                      className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-red-50 text-red-700"
                                    >
                                      <Archive className="w-3.5 h-3.5" />
                                      <span>Archive Article</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-3 bg-[#FAF7F0] border-t border-[#D9C6A5]/30 flex items-center justify-between text-xs text-[#5C5850]">
                <span>
                  Page {page} of {totalPages} ({total} articles)
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    icon={<ChevronLeft className="w-3.5 h-3.5" />}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    icon={<ChevronRight className="w-3.5 h-3.5" />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleArchive}
        variant="danger"
        title="Archive News Article"
        message={`Are you sure you want to archive "${
          archiveTarget?.translations?.[0]?.title || 'this article'
        }"? It will be removed from public view immediately.`}
        confirmText="Archive Article"
        isLoading={actionLoading}
      />

      <ConfirmDialog
        isOpen={Boolean(submitTarget)}
        onClose={() => setSubmitTarget(null)}
        onConfirm={handleSubmitForReview}
        variant="primary"
        title="Submit Article for Review"
        message="This draft will be sent to the publisher editorial queue for review and approval before publication."
        confirmText="Submit for Review"
        isLoading={actionLoading}
      />
    </div>
  );
};
