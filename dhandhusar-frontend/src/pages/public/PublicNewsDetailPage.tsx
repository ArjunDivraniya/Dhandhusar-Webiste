import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/language-context.ts';
import { publicApi } from '../../api/public.api.ts';
import type { NewsArticle } from '../../types/news.types.ts';
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Building2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

export const PublicNewsDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language, setLanguage, t } = useLanguage();
  const isGu = language === 'GU';
  const navigate = useNavigate();

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (!slug) return;
    const articleSlug = slug;

    async function loadArticle() {
      try {
        setLoading(true);
        setNotFound(false);
        const data = await publicApi.fetchNewsBySlug(articleSlug, language);

        if (isMounted) {
          setArticle(data);

          // Fetch related articles from same or general category
          try {
            const related = await publicApi.fetchPublishedNews({
              lang: language,
              limit: 3,
            });
            if (isMounted) {
              setRelatedArticles(
                (related.items || []).filter((item) => item.id !== data.id).slice(0, 3)
              );
            }
          } catch {
            // Ignore related news error
          }
        }
      } catch (err: unknown) {
        console.error('Failed to load article detail:', err);
        if (isMounted) {
          setNotFound(true);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadArticle();
    return () => {
      isMounted = false;
    };
  }, [slug, language]);

  // Handle Share to WhatsApp
  const handleWhatsAppShare = () => {
    const url = window.location.href;
    const title = article?.translations?.[0]?.title || 'Explore Dhandusar';
    const text = `${title}\n\n${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Handle Copy Link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success(t.newsDetail.copied);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-6">
        <div className="h-6 bg-gray-200 rounded w-1/4" />
        <div className="h-10 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-80 bg-gray-200 rounded-2xl" />
        <div className="space-y-3 pt-4">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#FAF7F0] border border-[#D9C6A5] text-[#5C5850] flex items-center justify-center mx-auto">
          <Building2 className="w-8 h-8 text-[#315B3B]" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-[#24231F]">
          {isGu ? 'સમાચાર મળ્યા નથી' : 'Article Not Found'}
        </h1>
        <p className="text-sm text-[#5C5850]">
          {isGu
            ? 'આ સમાચાર અસ્તિત્વમાં નથી અથવા હજુ સુધી પ્રકાશિત થયેલ નથી.'
            : 'The requested article could not be found or has not been published yet.'}
        </p>
        <div className="pt-2">
          <Link
            to="/news"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#315B3B] text-white text-xs font-semibold hover:bg-[#23432B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.newsDetail.backToNews}</span>
          </Link>
        </div>
      </div>
    );
  }

  // Active translation
  const tr =
    article.translations?.find((t) => t.languageCode === language) ||
    article.translations?.[0];

  const title = tr?.title || 'Announcement';
  const content = tr?.content || '';
  const summary = tr?.summary;
  const categoryName = isGu ? article.category?.nameGu : article.category?.nameEn;

  // Check alternative language translation
  const otherLang = language === 'GU' ? 'EN' : 'GU';
  const otherTr = article.translations?.find((t) => t.languageCode === otherLang);

  // Reading time estimate (approx 200 words per minute)
  const wordCount = content.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <article className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Breadcrumbs Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#5C5850]">
        <Link to="/" className="hover:text-[#315B3B] transition-colors">
          {t.nav.home}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#D9C6A5]" />
        <Link to="/news" className="hover:text-[#315B3B] transition-colors">
          {t.nav.news}
        </Link>
        {categoryName && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-[#D9C6A5]" />
            <span className="text-[#24231F] font-medium">{categoryName}</span>
          </>
        )}
      </nav>

      {/* Back Button */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/news')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C5850] hover:text-[#315B3B] transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>{t.newsDetail.backToNews}</span>
        </button>
      </div>

      {/* Article Header */}
      <header className="space-y-4">
        {/* Category Tag & Meta Information */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#5C5850]">
          {categoryName && (
            <span className="px-3 py-1 rounded-full bg-[#315B3B]/10 text-[#315B3B] font-semibold">
              {categoryName}
            </span>
          )}

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#315B3B]" />
            <span>
              {article.publishedAt
                ? new Date(article.publishedAt).toLocaleDateString(
                    isGu ? 'gu-IN' : 'en-IN',
                    { day: 'numeric', month: 'long', year: 'numeric' }
                  )
                : ''}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#315B3B]" />
            <span>
              {readingTime} {t.newsDetail.minRead}
            </span>
          </div>
        </div>

        {/* Title */}
        <h1
          className={`font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#24231F] leading-tight ${
            isGu ? 'font-gujarati' : ''
          }`}
        >
          {title}
        </h1>

        {/* Summary Excerpt Callout */}
        {summary && (
          <p className="text-base sm:text-lg text-[#5C5850] font-medium italic border-l-3 border-[#315B3B] pl-4 py-1 bg-[#FAF7F0] rounded-r-xl">
            {summary}
          </p>
        )}

        {/* Social Share & Action Bar */}
        <div className="flex items-center justify-between border-y border-[#D9C6A5]/60 py-3 text-xs">
          <div className="text-[#5C5850] font-medium">
            {article.author?.name ? `${article.author.name}` : 'Gram Panchayat Dhandusar'}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/10 text-[#128C7E] font-semibold hover:bg-[#25D366]/20 transition-colors"
              title={t.newsDetail.shareWhatsApp}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D9C6A5] text-[#24231F] font-semibold hover:bg-[#FAF7F0] transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isGu ? 'કોપી થઈ!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#5C5850]" />
                  <span>{t.newsDetail.copyLink}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Alternative Language Notice Banner */}
      {otherTr && (
        <div className="p-3.5 rounded-xl bg-[#F5F0E5] border border-[#D9C6A5] flex items-center justify-between text-xs">
          <span className="text-[#5C5850]">{t.newsDetail.alternateLangAvailable}</span>
          <button
            type="button"
            onClick={() => setLanguage(otherLang)}
            className="font-bold text-[#315B3B] hover:underline"
          >
            {t.newsDetail.readInOtherLang}
          </button>
        </div>
      )}

      {/* Featured Image */}
      {article.featuredImage && (
        <div className="rounded-2xl overflow-hidden shadow-sm border border-[#D9C6A5]/60 max-h-[500px]">
          <img
            src={article.featuredImage}
            alt={title}
            className="w-full h-full object-cover"
          />
          {article.sourceName && (
            <div className="p-2 text-right bg-[#FAF7F0] text-[11px] text-[#5C5850] border-t border-[#D9C6A5]/40">
              <span>{isGu ? 'સ્રોત:' : 'Source:'} </span>
              {article.sourceUrl ? (
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#315B3B] hover:underline inline-flex items-center gap-1"
                >
                  {article.sourceName}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="font-medium text-[#24231F]">{article.sourceName}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Rich Body Content */}
      <section
        className="prose prose-lg max-w-none text-[#24231F] leading-relaxed pt-2 font-sans"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Related News Strip */}
      {relatedArticles.length > 0 && (
        <div className="pt-12 border-t border-[#D9C6A5]/60 space-y-6">
          <h2 className="font-serif text-2xl font-bold text-[#24231F]">
            {t.newsDetail.relatedNews}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedArticles.map((rel) => {
              const relTr = rel.translations?.[0];
              const relSlug = relTr?.slug || rel.id;
              return (
                <Link
                  key={rel.id}
                  to={`/news/${relSlug}`}
                  className="p-4 rounded-xl bg-white border border-[#D9C6A5]/60 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <h3 className="font-serif text-sm font-bold text-[#24231F] group-hover:text-[#315B3B] transition-colors line-clamp-2">
                    {relTr?.title || 'Announcement'}
                  </h3>
                  <div className="pt-3 text-[11px] text-[#5C5850]">
                    {rel.publishedAt
                      ? new Date(rel.publishedAt).toLocaleDateString(
                          isGu ? 'gu-IN' : 'en-IN',
                          { day: 'numeric', month: 'short', year: 'numeric' }
                        )
                      : ''}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
};
