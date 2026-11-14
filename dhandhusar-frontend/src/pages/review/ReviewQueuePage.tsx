import React, { useEffect, useState, useCallback } from 'react';
import { newsApi } from '../../api/news.api.ts';
import type { NewsArticle, LanguageCode } from '../../types/news.types.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { Button } from '../../components/common/Button.tsx';
import { Textarea } from '../../components/common/Textarea.tsx';
import { Modal } from '../../components/common/Modal.tsx';
import { LoadingState } from '../../components/common/LoadingState.tsx';
import { EmptyState } from '../../components/common/EmptyState.tsx';
import {
  CheckSquare,
  CheckCircle,
  AlertTriangle,
  XCircle,
  History,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';

export const ReviewQueuePage: React.FC = () => {
  const [pendingArticles, setPendingArticles] = useState<NewsArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [activeLang, setActiveLang] = useState<LanguageCode>('GU');
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Modals state
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [changesModalOpen, setChangesModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  // Feedback input state
  const [publishFeedback, setPublishFeedback] = useState('Approved for live portal release.');
  const [changesFeedback, setChangesFeedback] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const loadPendingQueue = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await newsApi.listPendingReview(1, 50);
      setPendingArticles(data.items || []);

      if (data.items?.length > 0) {
        // Fetch complete details for the first article
        const fullArticle = await newsApi.getAdminArticle(data.items[0].id);
        setSelectedArticle(fullArticle);
      } else {
        setSelectedArticle(null);
      }
    } catch {
      toast.error('Failed to load pending review queue.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPendingQueue();
  }, [loadPendingQueue]);

  const selectArticleForReview = async (id: string) => {
    try {
      const fullArticle = await newsApi.getAdminArticle(id);
      setSelectedArticle(fullArticle);
      // Auto-select available language
      const hasGu = fullArticle.translations.some((t) => t.languageCode === 'GU');
      const hasEn = fullArticle.translations.some((t) => t.languageCode === 'EN');
      if (!hasGu && hasEn) setActiveLang('EN');
      else setActiveLang('GU');
    } catch {
      toast.error('Failed to load article details.');
    }
  };

  // 1. Publish Action
  const handlePublish = async () => {
    if (!selectedArticle) return;
    setIsActionLoading(true);
    try {
      await newsApi.publishArticle(selectedArticle.id, publishFeedback.trim() || undefined);
      toast.success('Article approved and published live.');
      setPublishModalOpen(false);
      loadPendingQueue();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Failed to publish article.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // 2. Request Changes Action
  const handleRequestChanges = async () => {
    if (!selectedArticle) return;
    if (changesFeedback.trim().length < 5) {
      setFeedbackError('Please provide a constructive comment of at least 5 characters.');
      return;
    }
    setFeedbackError(null);
    setIsActionLoading(true);
    try {
      await newsApi.requestChanges(selectedArticle.id, changesFeedback.trim());
      toast.success('Changes requested. Article returned to editor.');
      setChangesModalOpen(false);
      setChangesFeedback('');
      loadPendingQueue();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Failed to request changes.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // 3. Reject Action
  const handleReject = async () => {
    if (!selectedArticle) return;
    if (rejectReason.trim().length < 5) {
      setFeedbackError('Please provide a clear reason of at least 5 characters.');
      return;
    }
    setFeedbackError(null);
    setIsActionLoading(true);
    try {
      await newsApi.rejectArticle(selectedArticle.id, rejectReason.trim());
      toast.success('Article rejected.');
      setRejectModalOpen(false);
      setRejectReason('');
      loadPendingQueue();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Failed to reject article.');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading publisher review queue..." />;
  }

  const currentTranslation = selectedArticle?.translations.find((t) => t.languageCode === activeLang);
  const guTranslation = selectedArticle?.translations.find((t) => t.languageCode === 'GU');
  const enTranslation = selectedArticle?.translations.find((t) => t.languageCode === 'EN');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D9C6A5]/40">
        <div>
          <h1 className="text-xl font-bold font-serif text-[#24231F] flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#315B3B]" />
            Publisher Review Queue
          </h1>
          <p className="text-xs text-[#5C5850] mt-0.5">
            Review submitted news drafts, verify bilingual content, and approve live publication ({pendingArticles.length} awaiting review)
          </p>
        </div>
      </div>

      {pendingArticles.length === 0 ? (
        <EmptyState
          icon={<CheckCircle className="w-6 h-6 text-[#315B3B]" />}
          title="Review Queue is Empty"
          description="There are currently no news articles awaiting editorial review."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: List of items in queue (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C5850] px-1">
              Pending Submissions ({pendingArticles.length})
            </span>

            <div className="space-y-2">
              {pendingArticles.map((article) => {
                const title =
                  article.translations?.[0]?.title || 'Untitled Submission';
                const isSelected = selectedArticle?.id === article.id;

                return (
                  <div
                    key={article.id}
                    onClick={() => selectArticleForReview(article.id)}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white border-[#315B3B] shadow-sm ring-1 ring-[#315B3B]'
                        : 'bg-white border-[#D9C6A5]/50 hover:border-[#D9C6A5] shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#5C5850]">
                      <span className="font-semibold text-[#70452D]">
                        {article.category?.nameEn || 'News'}
                      </span>
                      <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                    </div>

                    <h4 className="font-semibold text-[#24231F] mt-1.5 line-clamp-2 leading-snug">
                      {title}
                    </h4>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#D9C6A5]/20 text-[11px] text-[#5C5850]">
                      <span>By {article.author?.name || 'Editor'}</span>
                      <div className="flex items-center gap-1">
                        {article.translations?.some((t) => t.languageCode === 'GU') && (
                          <span className="px-1 text-[9px] font-bold rounded bg-[#F5F0E5] text-[#70452D]">
                            GU
                          </span>
                        )}
                        {article.translations?.some((t) => t.languageCode === 'EN') && (
                          <span className="px-1 text-[9px] font-bold rounded bg-[#F5F0E5] text-[#315B3B]">
                            EN
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Review Details & Action Panel (8 cols) */}
          {selectedArticle && (
            <div className="lg:col-span-8 space-y-4">
              {/* Action Ribbon */}
              <div className="p-4 bg-white rounded-2xl border border-[#D9C6A5]/50 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#24231F]">
                    Publisher Decisions:
                  </span>
                  <StatusBadge status={selectedArticle.status} />
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setFeedbackError(null);
                      setRejectReason('');
                      setRejectModalOpen(true);
                    }}
                    icon={<XCircle className="w-3.5 h-3.5" />}
                  >
                    Reject
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setFeedbackError(null);
                      setChangesFeedback('');
                      setChangesModalOpen(true);
                    }}
                    icon={<AlertTriangle className="w-3.5 h-3.5 text-orange-600" />}
                  >
                    Request Changes
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setPublishModalOpen(true)}
                    icon={<CheckCircle className="w-3.5 h-3.5" />}
                  >
                    Approve & Publish
                  </Button>
                </div>
              </div>

              {/* Language Switcher */}
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

              {/* Content Preview Card */}
              <div className="bg-white p-6 rounded-2xl border border-[#D9C6A5]/50 shadow-2xs space-y-4">
                {currentTranslation ? (
                  <>
                    <div>
                      <h2 className="text-xl font-bold font-serif text-[#24231F] leading-snug">
                        {currentTranslation.title}
                      </h2>
                      <div className="flex items-center gap-2 mt-2 text-xs text-[#5C5850]">
                        <span className="font-mono text-[#70452D]">slug: {currentTranslation.slug}</span>
                        <span>•</span>
                        <span>Author: {selectedArticle.author?.name}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3 text-[#315B3B]" />
                          {selectedArticle.category?.nameEn}
                        </span>
                      </div>
                    </div>

                    {currentTranslation.summary && (
                      <div className="p-3 bg-[#FAF7F0] rounded-xl border-l-3 border-[#315B3B] text-xs text-[#5C5850]">
                        <strong className="block text-[#24231F] mb-0.5">Excerpt:</strong>
                        {currentTranslation.summary}
                      </div>
                    )}

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

              {/* Review History Audit Trail */}
              {selectedArticle.reviews && selectedArticle.reviews.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-[#D9C6A5]/50 shadow-2xs text-xs space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-[#24231F] border-b border-[#D9C6A5]/30 pb-2">
                    <History className="w-4 h-4 text-[#70452D]" />
                    <span>Prior Editorial Actions</span>
                  </div>
                  <div className="space-y-2">
                    {selectedArticle.reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-3 rounded-lg bg-[#FAF7F0] border border-[#D9C6A5]/30 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] text-[#5C5850]">
                          <span className="font-semibold text-[#24231F]">
                            {rev.reviewer?.name || 'Publisher'}
                          </span>
                          <span>{new Date(rev.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={rev.fromStatus} />
                          <span>→</span>
                          <StatusBadge status={rev.toStatus} />
                        </div>
                        {rev.feedback && (
                          <p className="italic text-[#5C5850] bg-white p-2 rounded border border-[#D9C6A5]/20 mt-1">
                            "{rev.feedback}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 1. Approve & Publish Modal */}
      <Modal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        title="Approve & Publish Article Live"
        description="This article will be immediately published to the public village website."
      >
        <div className="space-y-4">
          <Textarea
            label="Editorial Approval Note (Optional)"
            rows={3}
            value={publishFeedback}
            onChange={(e) => setPublishFeedback(e.target.value)}
            placeholder="Review notes or approval confirmation..."
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPublishModalOpen(false)}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePublish}
              isLoading={isActionLoading}
            >
              Confirm Publication
            </Button>
          </div>
        </div>
      </Modal>

      {/* 2. Request Changes Modal */}
      <Modal
        isOpen={changesModalOpen}
        onClose={() => setChangesModalOpen(false)}
        title="Request Changes from Editor"
        description="The article status will be set to 'Changes Requested'. An editorial note is mandatory."
      >
        <div className="space-y-4">
          <Textarea
            label="Review Feedback"
            required
            rows={3}
            value={changesFeedback}
            onChange={(e) => {
              setChangesFeedback(e.target.value);
              if (feedbackError) setFeedbackError(null);
            }}
            placeholder="Specify what needs correction (e.g. date verification, typo fixes, missing contact details)..."
            error={feedbackError || undefined}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChangesModalOpen(false)}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRequestChanges}
              isLoading={isActionLoading}
            >
              Send Feedback
            </Button>
          </div>
        </div>
      </Modal>

      {/* 3. Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Article Submission"
        description="The article status will be set to 'Rejected'. A reason is mandatory."
      >
        <div className="space-y-4">
          <Textarea
            label="Rejection Reason"
            required
            rows={3}
            value={rejectReason}
            onChange={(e) => {
              setRejectReason(e.target.value);
              if (feedbackError) setFeedbackError(null);
            }}
            placeholder="Explain the reason for rejection (e.g. out of scope, duplicate submission)..."
            error={feedbackError || undefined}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectModalOpen(false)}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleReject}
              isLoading={isActionLoading}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
