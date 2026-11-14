import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { newsApi } from '../../api/news.api.ts';
import { useAuth } from '../../context/auth-context.ts';
import type { NewsArticle, LanguageCode } from '../../types/news.types.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { Button } from '../../components/common/Button.tsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.tsx';
import { LoadingState } from '../../components/common/LoadingState.tsx';
import {
  ArrowLeft,
  Edit,
  Send,
  Archive,
  CheckCircle,
  Clock,
  History,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';

export const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [activeLang, setActiveLang] = useState<LanguageCode>('GU');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  const canEdit = hasPermission('news.edit');
  const canSubmit = hasPermission('news.submit_review');
  const canReview = hasPermission('news.review');
  const canArchive = hasPermission('news.archive');

  const loadArticle = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await newsApi.getAdminArticle(id);
      setArticle(data);
      // Auto-select available language
      const hasGu = data.translations.some((t) => t.languageCode === 'GU');
      const hasEn = data.translations.some((t) => t.languageCode === 'EN');
      if (!hasGu && hasEn) setActiveLang('EN');
    } catch {
      toast.error('Failed to load article details.');
      navigate('/admin/news');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadArticle();
  }, [loadArticle]);

  const handleSubmitForReview = async () => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await newsApi.submitForReview(id);
      toast.success('Article submitted for publisher review.');
      loadArticle();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Failed to submit article.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async () => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await newsApi.archiveArticle(id);
      toast.success('Article archived.');
      setShowArchiveConfirm(false);
      loadArticle();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Failed to archive article.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !article) {
    return <LoadingState message="Loading article details & audit history..." />;
  }

  const currentTranslation = article.translations.find((t) => t.languageCode === activeLang);
  const guTranslation = article.translations.find((t) => t.languageCode === 'GU');
  const enTranslation = article.translations.find((t) => t.languageCode === 'EN');

  const isDraft = article.status === 'DRAFT' || article.status === 'CHANGES_REQUESTED';
  const isPending = article.status === 'PENDING_REVIEW';
  const isPublished = article.status === 'PUBLISHED';

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9C6A5]/40">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/news')}
            className="p-1.5 rounded-lg text-[#5C5850] hover:text-[#24231F] hover:bg-white border border-[#D9C6A5]/40 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <StatusBadge status={article.status} />
              {article.isPinned && (
                <span className="text-[10px] font-semibold text-[#70452D] px-2 py-0.5 rounded-full bg-[#F5F0E5] border border-[#D9C6A5]/50">
                  📌 Pinned
                </span>
              )}
            </div>
            <h1 className="text-lg font-bold font-serif text-[#24231F] mt-1 line-clamp-1">
              {currentTranslation?.title || 'Untitled Article'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <Link to={`/admin/news/edit/${article.id}`}>
              <Button variant="secondary" size="sm" icon={<Edit className="w-3.5 h-3.5" />}>
                Edit
              </Button>
            </Link>
          )}

          {isDraft && canSubmit && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitForReview}
              isLoading={isSubmitting}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              Submit for Review
            </Button>
          )}

          {isPending && canReview && (
            <Link to="/admin/review">
              <Button
                variant="primary"
                size="sm"
                icon={<CheckCircle className="w-3.5 h-3.5" />}
              >
                Review in Queue
              </Button>
            </Link>
          )}

          {(isPublished || isDraft) && canArchive && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowArchiveConfirm(true)}
              icon={<Archive className="w-3.5 h-3.5" />}
            >
              Archive
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: Content (8 cols) + Meta & Review History (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Localized Content Preview */}
        <div className="lg:col-span-8 space-y-4">
          {/* Language Toggle */}
          <div className="flex items-center gap-2 p-1.5 bg-[#FAF7F0] rounded-xl border border-[#D9C6A5]/50 w-fit">
            <button
              type="button"
              disabled={!guTranslation}
              onClick={() => setActiveLang('GU')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                activeLang === 'GU'
                  ? 'bg-[#315B3B] text-white shadow-xs'
                  : 'text-[#5C5850] hover:text-[#24231F]'
              }`}
            >
              ગુજરાતી (GU)
            </button>

            <button
              type="button"
              disabled={!enTranslation}
              onClick={() => setActiveLang('EN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                activeLang === 'EN'
                  ? 'bg-[#315B3B] text-white shadow-xs'
                  : 'text-[#5C5850] hover:text-[#24231F]'
              }`}
            >
              English (EN)
            </button>
          </div>

          {/* Article View Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#D9C6A5]/50 shadow-2xs space-y-5">
            {currentTranslation ? (
              <>
                <div>
                  <h2 className="text-xl font-bold font-serif text-[#24231F] leading-snug">
                    {currentTranslation.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-2 text-xs text-[#5C5850]">
                    <span className="font-mono text-[#70452D]">slug: {currentTranslation.slug}</span>
                    <span>•</span>
                    <span>Language: {activeLang === 'GU' ? 'Gujarati' : 'English'}</span>
                  </div>
                </div>

                {currentTranslation.summary && (
                  <div className="p-3.5 bg-[#FAF7F0] rounded-xl border-l-3 border-[#315B3B] text-xs text-[#5C5850] leading-relaxed">
                    <strong className="block text-[#24231F] mb-0.5">Summary Excerpt:</strong>
                    {currentTranslation.summary}
                  </div>
                )}

                {/* Rendered Body HTML */}
                <div
                  className="prose max-w-none text-sm text-[#24231F] leading-relaxed tiptap pt-3 border-t border-[#D9C6A5]/30"
                  dangerouslySetInnerHTML={{ __html: currentTranslation.content }}
                />
              </>
            ) : (
              <p className="text-xs text-[#5C5850] italic py-8 text-center">
                No translation drafted for {activeLang === 'GU' ? 'Gujarati' : 'English'}.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Metadata & Review Audit Trail */}
        <div className="lg:col-span-4 space-y-4">
          {/* Metadata Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#D9C6A5]/50 shadow-2xs space-y-3.5 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider font-serif text-[#24231F] pb-2 border-b border-[#D9C6A5]/30">
              Article Information
            </h3>

            <div>
              <span className="text-[11px] text-[#5C5850] block">Category</span>
              <span className="font-semibold text-[#24231F] flex items-center gap-1.5 mt-0.5">
                <Tag className="w-3.5 h-3.5 text-[#315B3B]" />
                {article.category?.nameEn} ({article.category?.nameGu})
              </span>
            </div>

            <div>
              <span className="text-[11px] text-[#5C5850] block">Author</span>
              <span className="font-medium text-[#24231F] block mt-0.5">
                {article.author?.name} ({article.author?.email})
              </span>
            </div>

            <div>
              <span className="text-[11px] text-[#5C5850] block">Created Date</span>
              <span className="text-[#24231F] block mt-0.5">
                {new Date(article.createdAt).toLocaleString()}
              </span>
            </div>

            {article.publishedAt && (
              <div>
                <span className="text-[11px] text-[#5C5850] block">Published Live Date</span>
                <span className="text-[#315B3B] font-semibold block mt-0.5">
                  {new Date(article.publishedAt).toLocaleString()}
                </span>
              </div>
            )}

            {article.featuredImage && (
              <div>
                <span className="text-[11px] text-[#5C5850] block mb-1">Featured Image</span>
                <img
                  src={article.featuredImage}
                  alt="Featured banner"
                  className="w-full h-32 object-cover rounded-lg border border-[#D9C6A5]/50"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {article.sourceUrl && (
              <div>
                <span className="text-[11px] text-[#5C5850] block">Source Reference</span>
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#315B3B] hover:underline flex items-center gap-1 mt-0.5 truncate"
                >
                  <span>{article.sourceName || article.sourceUrl}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            )}
          </div>

          {/* Editorial Review Audit History */}
          <div className="bg-white p-5 rounded-2xl border border-[#D9C6A5]/50 shadow-2xs space-y-3.5 text-xs">
            <div className="flex items-center gap-1.5 pb-2 border-b border-[#D9C6A5]/30 text-[#24231F]">
              <History className="w-4 h-4 text-[#70452D]" />
              <h3 className="text-xs font-bold uppercase tracking-wider font-serif">
                Review History ({article.reviews?.length || 0})
              </h3>
            </div>

            {!article.reviews || article.reviews.length === 0 ? (
              <p className="text-[#5C5850] text-[11px] italic">
                No formal review actions recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {article.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3 rounded-xl bg-[#FAF7F0] border border-[#D9C6A5]/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[#24231F]">
                        {rev.reviewer?.name || 'Publisher'}
                      </span>
                      <span className="text-[#5C5850] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px]">
                      <StatusBadge status={rev.fromStatus} />
                      <span className="text-[#5C5850]">→</span>
                      <StatusBadge status={rev.toStatus} />
                    </div>

                    {rev.feedback && (
                      <p className="text-[11px] text-[#5C5850] bg-white p-2 rounded-lg border border-[#D9C6A5]/30 mt-1 italic">
                        "{rev.feedback}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={showArchiveConfirm}
        onClose={() => setShowArchiveConfirm(false)}
        onConfirm={handleArchive}
        variant="danger"
        title="Archive News Article"
        message="Archiving this article will remove it from the public village feed immediately."
        confirmText="Archive Article"
        isLoading={isSubmitting}
      />
    </div>
  );
};
