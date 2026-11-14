import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/language-context.ts';
import { publicApi } from '../../api/public.api.ts';
import type { NewsArticle, NewsCategory } from '../../types/news.types.ts';
import {
  Search,
  Calendar,
  ArrowRight,
  Filter,
  ArrowUpDown,
  BookOpen,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const PublicNewsListPage: React.FC = () => {
  const { language, t } = useLanguage();
  const isGu = language === 'GU';
  const [searchParams, setSearchParams] = useSearchParams();

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Read URL query parameters
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = (searchParams.get('sort') as 'newest' | 'oldest') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(currentSearch);

  // Load categories once
  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await publicApi.fetchCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load news categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Sync search input when URL changes
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Load published articles whenever filters or language change
  useEffect(() => {
    let active = true;
    publicApi
      .fetchPublishedNews({
        lang: language,
        category: currentCategory || undefined,
        search: currentSearch || undefined,
        sort: currentSort,
        page: currentPage,
        limit: 9,
      })
      .then((res) => {
        if (active) {
          setArticles(res.items || []);
          setTotal(res.total || 0);
          setTotalPages(res.totalPages || 1);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load published news:', err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [language, currentCategory, currentSearch, currentSort, currentPage]);

  // Handlers for filter updates
  const updateFilter = (newParams: Record<string, string | null>) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === '') {
        updated.delete(key);
      } else {
        updated.set(key, val);
      }
    });
    // Reset to page 1 on filter changes (unless page itself is changing)
    if (!('page' in newParams)) {
      updated.delete('page');
    }
    setSearchParams(updated);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter({ search: searchInput.trim() || null });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#315B3B]/10 text-xs font-semibold text-[#315B3B]">
          <span>{isGu ? 'ધંધુસર ગ્રામ સમાચાર' : 'Village Dispatches & Notices'}</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#24231F] tracking-tight">
          {t.newsPage.title}
        </h1>
        <p className="text-[#5C5850] text-sm sm:text-base leading-relaxed">
          {t.newsPage.subtitle}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#D9C6A5]/60 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-[#5C5850] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t.newsPage.searchPlaceholder}
              className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-[#D9C6A5] text-sm bg-[#FAF7F0]/40 focus:outline-none focus:ring-2 focus:ring-[#315B3B]/30 focus:border-[#315B3B] transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#315B3B] text-white text-xs font-semibold hover:bg-[#23432B] transition-colors"
            >
              {isGu ? 'શોધો' : 'Search'}
            </button>
          </form>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-end md:self-auto text-xs text-[#5C5850]">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#315B3B]" />
            <select
              value={currentSort}
              onChange={(e) => updateFilter({ sort: e.target.value })}
              className="px-3 py-2 rounded-lg border border-[#D9C6A5] bg-white text-xs font-medium text-[#24231F] focus:outline-none focus:border-[#315B3B]"
            >
              <option value="newest">{t.newsPage.sortNewest}</option>
              <option value="oldest">{t.newsPage.sortOldest}</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => updateFilter({ category: null })}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-colors shrink-0 ${
              !currentCategory
                ? 'bg-[#315B3B] text-white shadow-xs'
                : 'bg-[#FAF7F0] text-[#5C5850] border border-[#D9C6A5] hover:border-[#315B3B]'
            }`}
          >
            {t.newsPage.allCategories}
          </button>

          {categories.map((cat) => {
            const isSelected = currentCategory === cat.slug;
            const label = isGu ? cat.nameGu : cat.nameEn;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => updateFilter({ category: cat.slug })}
                className={`px-3.5 py-1.5 rounded-full font-semibold transition-colors shrink-0 ${
                  isSelected
                    ? 'bg-[#315B3B] text-white shadow-xs'
                    : 'bg-[#FAF7F0] text-[#5C5850] border border-[#D9C6A5] hover:border-[#315B3B]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filter Indicators */}
      {(currentCategory || currentSearch) && (
        <div className="flex items-center justify-between text-xs text-[#5C5850] px-1">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#315B3B]" />
            <span>
              {isGu ? 'પરિણામ:' : 'Showing results for'}
              {currentSearch && ` "${currentSearch}"`}
            </span>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-[#70452D] hover:underline font-semibold"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t.newsPage.resetFilters}</span>
          </button>
        </div>
      )}

      {/* Articles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="rounded-2xl bg-white border border-[#D9C6A5]/40 h-80 animate-pulse p-4 space-y-3"
            >
              <div className="h-44 bg-gray-200 rounded-xl" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-5 bg-gray-200 rounded w-4/5" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => {
            const tr = article.translations?.[0];
            const title = tr?.title || 'Announcement';
            const summary = tr?.summary || '';
            const slug = tr?.slug || article.id;
            const categoryName = isGu
              ? article.category?.nameGu
              : article.category?.nameEn;

            return (
              <article
                key={article.id}
                className="group rounded-2xl bg-white border border-[#D9C6A5]/60 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-[#FAF7F0] overflow-hidden">
                    {article.featuredImage ? (
                      <img
                        src={article.featuredImage}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#315B3B]/10 to-[#D9C6A5]/30">
                        <span className="font-serif text-3xl font-bold text-[#315B3B]/40">
                          ધંધુસર
                        </span>
                      </div>
                    )}
                    {categoryName && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#FAF7F0] text-[#315B3B] text-[11px] font-semibold shadow-xs">
                        {categoryName}
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-[#5C5850]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {article.publishedAt
                          ? new Date(article.publishedAt).toLocaleDateString(
                              isGu ? 'gu-IN' : 'en-IN',
                              { day: 'numeric', month: 'short', year: 'numeric' }
                            )
                          : ''}
                      </span>
                    </div>

                    <h2 className="font-serif text-lg font-bold text-[#24231F] group-hover:text-[#315B3B] transition-colors line-clamp-2 leading-snug">
                      {title}
                    </h2>

                    {summary && (
                      <p className="text-xs sm:text-sm text-[#5C5850] line-clamp-3 leading-relaxed">
                        {summary}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    to={`/news/${slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#315B3B] group-hover:text-[#23432B]"
                  >
                    <span>{t.newsSection.readMore}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 rounded-2xl bg-white border border-[#D9C6A5]/60 max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F0] text-[#5C5850] flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6 text-[#315B3B]" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#24231F]">
            {t.newsPage.noArticles}
          </h3>
          <p className="text-xs sm:text-sm text-[#5C5850] leading-relaxed">
            {t.newsPage.noArticlesDesc}
          </p>
          {(currentCategory || currentSearch) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#315B3B] text-white text-xs font-semibold hover:bg-[#23432B] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.newsPage.resetFilters}</span>
            </button>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#D9C6A5]/60 pt-6">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => updateFilter({ page: (currentPage - 1).toString() })}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#D9C6A5] text-xs font-semibold text-[#24231F] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t.newsPage.prev}</span>
          </button>

          <span className="text-xs text-[#5C5850]">
            {t.newsPage.page} <strong className="text-[#24231F]">{currentPage}</strong>{' '}
            {t.newsPage.of} {totalPages} ({total} {isGu ? 'સમાચારો' : 'articles'})
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => updateFilter({ page: (currentPage + 1).toString() })}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#D9C6A5] text-xs font-semibold text-[#24231F] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>{t.newsPage.next}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
