import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { newsApi } from '../../api/news.api.ts';
import { categoryApi } from '../../api/category.api.ts';
import type { NewsCategory, LanguageCode } from '../../types/news.types.ts';
import { Button } from '../../components/common/Button.tsx';
import { Input } from '../../components/common/Input.tsx';
import { Textarea } from '../../components/common/Textarea.tsx';
import { Select } from '../../components/common/Select.tsx';
import { RichTextEditor } from '../../components/editor/RichTextEditor.tsx';
import { LoadingState } from '../../components/common/LoadingState.tsx';
import {
  Save,
  Send,
  ArrowLeft,
  Globe,
  Settings,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface TranslationFormState {
  title: string;
  slug: string;
  summary: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
}

const emptyTranslation = (): TranslationFormState => ({
  title: '',
  slug: '',
  summary: '',
  content: '',
  seoTitle: '',
  seoDescription: '',
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const NewsEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  // Active translation tab: Gujarati or English
  const [activeTab, setActiveTab] = useState<LanguageCode>('GU');

  // Translations state
  const [guTranslation, setGuTranslation] = useState<TranslationFormState>(emptyTranslation());
  const [enTranslation, setEnTranslation] = useState<TranslationFormState>(emptyTranslation());

  // Article metadata settings
  const [categoryId, setCategoryId] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [featuredImage, setFeaturedImage] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  // Categories list
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      try {
        const catList = await categoryApi.listCategories();
        setCategories(catList);
        if (catList.length > 0) {
          setCategoryId((prev) => prev || catList[0].id);
        }

        // If editing, load existing article data
        if (id) {
          const article = await newsApi.getAdminArticle(id);
          setCategoryId(article.categoryId);
          setIsPinned(article.isPinned || false);
          setFeaturedImage(article.featuredImage || '');
          setSourceName(article.sourceName || '');
          setSourceUrl(article.sourceUrl || '');
          if (article.expiresAt) {
            setExpiresAt(new Date(article.expiresAt).toISOString().slice(0, 16));
          }

          // Populate translations
          const gu = article.translations.find((t) => t.languageCode === 'GU');
          if (gu) {
            setGuTranslation({
              title: gu.title,
              slug: gu.slug,
              summary: gu.summary || '',
              content: gu.content || '',
              seoTitle: gu.seoTitle || '',
              seoDescription: gu.seoDescription || '',
            });
          }

          const en = article.translations.find((t) => t.languageCode === 'EN');
          if (en) {
            setEnTranslation({
              title: en.title,
              slug: en.slug,
              summary: en.summary || '',
              content: en.content || '',
              seoTitle: en.seoTitle || '',
              seoDescription: en.seoDescription || '',
            });
          }
        }
      } catch {
        toast.error('Failed to load editor data.');
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [id]);

  const currentTranslation = activeTab === 'GU' ? guTranslation : enTranslation;

  const updateCurrentTranslation = (field: keyof TranslationFormState, value: string) => {
    if (activeTab === 'GU') {
      setGuTranslation((prev) => ({ ...prev, [field]: value }));
    } else {
      setEnTranslation((prev) => ({ ...prev, [field]: value }));
    }

    // Auto generate slug if title changed and slug is empty
    if (field === 'title' && !currentTranslation.slug) {
      const generated = slugify(value);
      if (generated) {
        if (activeTab === 'GU') {
          setGuTranslation((prev) => ({ ...prev, slug: generated }));
        } else {
          setEnTranslation((prev) => ({ ...prev, slug: generated }));
        }
      }
    }

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!categoryId) {
      errs.category = 'Please select a news category.';
    }

    // Must have at least ONE non-empty translation (either Gujarati or English)
    const hasGu = guTranslation.title.trim().length > 0;
    const hasEn = enTranslation.title.trim().length > 0;

    if (!hasGu && !hasEn) {
      errs.title = 'At least one translation (Gujarati or English) is required.';
    }

    // If Gujarati is filled, validate its fields
    if (hasGu) {
      if (guTranslation.title.trim().length < 3) {
        errs.gu_title = 'Gujarati title must be at least 3 characters.';
      }
      if (!guTranslation.slug.trim()) {
        errs.gu_slug = 'Gujarati slug is required.';
      }
      if (guTranslation.content.trim().length < 10) {
        errs.gu_content = 'Gujarati article content must be at least 10 characters.';
      }
    }

    // If English is filled, validate its fields
    if (hasEn) {
      if (enTranslation.title.trim().length < 3) {
        errs.en_title = 'English title must be at least 3 characters.';
      }
      if (!enTranslation.slug.trim()) {
        errs.en_slug = 'English slug is required.';
      }
      if (enTranslation.content.trim().length < 10) {
        errs.en_content = 'English article content must be at least 10 characters.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (submitAfterSave = false) => {
    if (!validate()) {
      toast.error('Please resolve the highlighted validation errors.');
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing && id) {
        // Collect updated translations
        const translationsPayload = [];
        if (guTranslation.title.trim()) {
          translationsPayload.push({
            languageCode: 'GU' as LanguageCode,
            title: guTranslation.title.trim(),
            slug: guTranslation.slug.trim(),
            summary: guTranslation.summary.trim() || null,
            content: guTranslation.content.trim(),
            seoTitle: guTranslation.seoTitle.trim() || null,
            seoDescription: guTranslation.seoDescription.trim() || null,
          });
        }
        if (enTranslation.title.trim()) {
          translationsPayload.push({
            languageCode: 'EN' as LanguageCode,
            title: enTranslation.title.trim(),
            slug: enTranslation.slug.trim(),
            summary: enTranslation.summary.trim() || null,
            content: enTranslation.content.trim(),
            seoTitle: enTranslation.seoTitle.trim() || null,
            seoDescription: enTranslation.seoDescription.trim() || null,
          });
        }

        await newsApi.updateArticle(id, {
          categoryId,
          isPinned,
          featuredImage: featuredImage.trim() || null,
          sourceName: sourceName.trim() || null,
          sourceUrl: sourceUrl.trim() || null,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
          translations: translationsPayload,
        });

        if (submitAfterSave) {
          await newsApi.submitForReview(id);
          toast.success('Article updated and submitted for publisher review.');
        } else {
          toast.success('Article updated successfully.');
        }

        navigate(`/admin/news/${id}`);
      } else {
        // Create draft
        const primaryLang = guTranslation.title.trim() ? 'GU' : 'EN';
        const primary = primaryLang === 'GU' ? guTranslation : enTranslation;
        const secondary = primaryLang === 'GU' && enTranslation.title.trim() ? enTranslation : null;

        const created = await newsApi.createDraft({
          categoryId,
          isPinned,
          featuredImage: featuredImage.trim() || null,
          sourceName: sourceName.trim() || null,
          sourceUrl: sourceUrl.trim() || null,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
          initialTranslation: {
            languageCode: primaryLang,
            title: primary.title.trim(),
            slug: primary.slug.trim(),
            summary: primary.summary.trim() || null,
            content: primary.content.trim(),
            seoTitle: primary.seoTitle.trim() || null,
            seoDescription: primary.seoDescription.trim() || null,
          },
          additionalTranslation: secondary
            ? {
                languageCode: 'EN',
                title: secondary.title.trim(),
                slug: secondary.slug.trim(),
                summary: secondary.summary.trim() || null,
                content: secondary.content.trim(),
                seoTitle: secondary.seoTitle.trim() || null,
                seoDescription: secondary.seoDescription.trim() || null,
              }
            : null,
        });

        if (submitAfterSave) {
          await newsApi.submitForReview(created.id);
          toast.success('Draft created and submitted for review.');
        } else {
          toast.success('Draft created successfully.');
        }

        navigate(`/admin/news/${created.id}`);
      }
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Failed to save news article.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading article editor..." />;
  }

  const hasGuContent = Boolean(guTranslation.title.trim());
  const hasEnContent = Boolean(enTranslation.title.trim());

  return (
    <div className="space-y-6">
      {/* Top action header */}
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
            <h1 className="text-xl font-bold font-serif text-[#24231F]">
              {isEditing ? 'Edit News Article' : 'New Article Draft'}
            </h1>
            <p className="text-xs text-[#5C5850] mt-0.5">
              Bilingual Gujarati & English village portal editorial authoring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/news')}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleSave(false)}
            isLoading={isSaving}
            icon={<Save className="w-3.5 h-3.5" />}
          >
            Save Draft
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSave(true)}
            isLoading={isSaving}
            icon={<Send className="w-3.5 h-3.5" />}
          >
            Save & Submit
          </Button>
        </div>
      </div>

      {/* Editor Grid: Main Form (Left 8 cols) + Settings Panel (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Language Tabs & Translation Form */}
        <div className="lg:col-span-8 space-y-4">
          {/* Language Switcher Tabs */}
          <div className="flex items-center justify-between p-1.5 bg-[#FAF7F0] rounded-xl border border-[#D9C6A5]/50">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('GU')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'GU'
                    ? 'bg-[#315B3B] text-white shadow-xs'
                    : 'text-[#5C5850] hover:text-[#24231F] hover:bg-white/50'
                }`}
              >
                <span>ગુજરાતી (Gujarati)</span>
                {hasGuContent && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeTab === 'GU' ? 'bg-[#D9C6A5]' : 'bg-[#315B3B]'
                    }`}
                  />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('EN')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'EN'
                    ? 'bg-[#315B3B] text-white shadow-xs'
                    : 'text-[#5C5850] hover:text-[#24231F] hover:bg-white/50'
                }`}
              >
                <span>English</span>
                {hasEnContent && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeTab === 'EN' ? 'bg-[#D9C6A5]' : 'bg-[#315B3B]'
                    }`}
                  />
                )}
              </button>
            </div>

            <span className="text-[11px] text-[#5C5850] pr-3 hidden sm:inline">
              Editing: <strong className="text-[#24231F]">{activeTab === 'GU' ? 'Gujarati' : 'English'}</strong>
            </span>
          </div>

          {/* Form Fields for Active Language */}
          <div className="bg-white p-5 rounded-2xl border border-[#D9C6A5]/50 shadow-2xs space-y-4">
            {errors.title && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.title}</span>
              </div>
            )}

            {/* Title */}
            <Input
              label={`Article Title (${activeTab === 'GU' ? 'ગુજરાતી' : 'English'})`}
              required
              placeholder={
                activeTab === 'GU'
                  ? 'ધંધુસર ગ્રામ પંચાયત સામાન્ય સભા મળવા બાબત'
                  : 'Dhandusar Gram Panchayat General Assembly Notice'
              }
              value={currentTranslation.title}
              onChange={(e) => updateCurrentTranslation('title', e.target.value)}
              error={activeTab === 'GU' ? errors.gu_title : errors.en_title}
            />

            {/* Slug */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#24231F]">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const gen = slugify(currentTranslation.title);
                    if (gen) updateCurrentTranslation('slug', gen);
                  }}
                  className="text-[11px] text-[#315B3B] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generate from Title</span>
                </button>
              </div>
              <Input
                placeholder="panchayat-meeting-announcement-2026"
                value={currentTranslation.slug}
                onChange={(e) => updateCurrentTranslation('slug', e.target.value)}
                error={activeTab === 'GU' ? errors.gu_slug : errors.en_slug}
                helperText={`Public URL: /api/news/${currentTranslation.slug || ':slug'}?lang=${activeTab}`}
              />
            </div>

            {/* Summary / Excerpt */}
            <Textarea
              label="Summary / Excerpt (Optional)"
              rows={2}
              placeholder="A brief summary for previews, search results, and notification banners..."
              value={currentTranslation.summary}
              onChange={(e) => updateCurrentTranslation('summary', e.target.value)}
              helperText="Displayed in village feed cards and social previews (max 1000 characters)"
            />

            {/* Rich Text Body Content */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#24231F]">
                Main Article Content <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                content={currentTranslation.content}
                onChange={(html) => updateCurrentTranslation('content', html)}
                error={activeTab === 'GU' ? errors.gu_content : errors.en_content}
              />
            </div>

            {/* Collapsible SEO Section */}
            <details className="pt-2 text-xs text-[#5C5850] border-t border-[#D9C6A5]/30">
              <summary className="font-semibold text-[#24231F] cursor-pointer hover:text-[#315B3B] py-1 select-none">
                SEO Metadata (Optional)
              </summary>
              <div className="space-y-3 pt-3">
                <Input
                  label="SEO Title"
                  placeholder="Custom meta title for Google search"
                  value={currentTranslation.seoTitle}
                  onChange={(e) => updateCurrentTranslation('seoTitle', e.target.value)}
                />
                <Textarea
                  label="SEO Description"
                  rows={2}
                  placeholder="Custom meta description for search engines..."
                  value={currentTranslation.seoDescription}
                  onChange={(e) => updateCurrentTranslation('seoDescription', e.target.value)}
                />
              </div>
            </details>
          </div>
        </div>

        {/* Right Column: Article Settings Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[#D9C6A5]/50 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#D9C6A5]/30 text-[#24231F]">
              <Settings className="w-4 h-4 text-[#70452D]" />
              <h3 className="text-xs font-bold uppercase tracking-wider font-serif">
                Article Settings
              </h3>
            </div>

            {/* Category */}
            <Select
              label="Category"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              options={categories.map((c) => ({
                value: c.id,
                label: `${c.nameEn} (${c.nameGu})`,
              }))}
              error={errors.category}
            />

            {/* Featured Image */}
            <Input
              label="Featured Image URL"
              placeholder="https://res.cloudinary.com/..."
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              helperText="Cloudinary delivery URL or external image reference"
            />

            {/* Pinned announcement checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="isPinned"
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="mt-0.5 rounded border-[#D9C6A5] text-[#315B3B] focus:ring-[#315B3B]/30 cursor-pointer"
              />
              <label htmlFor="isPinned" className="text-xs text-[#24231F] cursor-pointer">
                <span className="font-semibold block">Pin as Important Notice</span>
                <span className="text-[#5C5850] text-[11px] block">
                  Pinned articles appear at the top of the village news feed
                </span>
              </label>
            </div>

            {/* Source Information */}
            <div className="pt-2 border-t border-[#D9C6A5]/30 space-y-3">
              <span className="text-[11px] font-bold text-[#5C5850] uppercase tracking-wider block">
                Source Reference
              </span>
              <Input
                label="Source Name (Optional)"
                placeholder="e.g. Junagadh District Collectorate"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
              />
              <Input
                label="Source URL (Optional)"
                type="url"
                placeholder="https://junagadh.nic.in"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
              />
            </div>

            {/* Expiry Date */}
            <div className="pt-2 border-t border-[#D9C6A5]/30 space-y-1">
              <Input
                label="Expiry Date (Optional)"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                helperText="Content is automatically retired from public view after this date"
              />
            </div>

            {/* Language status card */}
            <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#D9C6A5]/40 text-xs space-y-1.5">
              <span className="font-semibold text-[#24231F] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#315B3B]" />
                Translation Coverage
              </span>
              <div className="flex items-center justify-between text-[11px] text-[#5C5850]">
                <span>Gujarati version:</span>
                <strong className={hasGuContent ? 'text-[#315B3B]' : 'text-amber-700'}>
                  {hasGuContent ? 'Ready' : 'Not drafted'}
                </strong>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#5C5850]">
                <span>English version:</span>
                <strong className={hasEnContent ? 'text-[#315B3B]' : 'text-amber-700'}>
                  {hasEnContent ? 'Ready' : 'Not drafted'}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
