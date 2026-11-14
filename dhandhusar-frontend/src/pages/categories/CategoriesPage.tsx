import React, { useEffect, useState } from 'react';
import { categoryApi } from '../../api/category.api.ts';
import { useAuth } from '../../context/auth-context.ts';
import type { NewsCategory } from '../../types/news.types.ts';
import { Button } from '../../components/common/Button.tsx';
import { Input } from '../../components/common/Input.tsx';
import { Modal } from '../../components/common/Modal.tsx';
import { LoadingState } from '../../components/common/LoadingState.tsx';
import { EmptyState } from '../../components/common/EmptyState.tsx';
import { FolderTree, Plus, Tag, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const CategoriesPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Category Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nameEn, setNameEn] = useState('');
  const [nameGu, setNameGu] = useState('');
  const [slug, setSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ nameEn?: string; nameGu?: string; slug?: string }>({});

  const canCreateCategory = hasPermission('news.create');

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await categoryApi.listCategories();
      setCategories(data);
    } catch {
      toast.error('Failed to load categories.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!nameEn.trim()) newErrors.nameEn = 'English name is required.';
    if (!nameGu.trim()) newErrors.nameGu = 'Gujarati name is required.';
    if (!slug.trim()) newErrors.slug = 'Slug is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await categoryApi.createCategory({
        nameEn: nameEn.trim(),
        nameGu: nameGu.trim(),
        slug: slug.trim(),
      });
      toast.success('Category created successfully.');
      setIsModalOpen(false);
      setNameEn('');
      setNameGu('');
      setSlug('');
      setErrors({});
      loadCategories();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Failed to create category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D9C6A5]/40">
        <div>
          <h1 className="text-xl font-bold font-serif text-[#24231F] flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-[#315B3B]" />
            News Categories
          </h1>
          <p className="text-xs text-[#5C5850] mt-0.5">
            Bilingual taxonomy for organizing village announcements, agriculture, and civic affairs
          </p>
        </div>

        {canCreateCategory && (
          <Button
            size="sm"
            onClick={() => {
              setErrors({});
              setIsModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            New Category
          </Button>
        )}
      </div>

      {/* Categories Grid / Table */}
      {isLoading ? (
        <LoadingState message="Loading categories..." />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={<Tag className="w-6 h-6 text-[#315B3B]" />}
          title="No Categories Available"
          description="Create categories to help organize village content."
          actionLabel={canCreateCategory ? 'New Category' : undefined}
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-5 bg-white rounded-2xl border border-[#D9C6A5]/50 shadow-2xs space-y-3 hover:border-[#D9C6A5] transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-[#FAF7F0] text-[#315B3B] border border-[#D9C6A5]/40">
                  <Tag className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-mono text-[#70452D] bg-[#F5F0E5] px-2 py-0.5 rounded-full border border-[#D9C6A5]/40">
                  {cat.slug}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#24231F] font-serif">{cat.nameEn}</h3>
                <p className="text-xs font-medium text-[#70452D] mt-0.5">{cat.nameGu}</p>
              </div>

              <div className="pt-2 border-t border-[#D9C6A5]/20 flex items-center justify-between text-[11px] text-[#5C5850]">
                <span>Classification</span>
                <span className="text-[#315B3B] font-semibold">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add News Category"
        description="Define a new bilingual classification for Explore Dhandusar news."
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <Input
            label="English Category Name"
            required
            placeholder="e.g. Village Announcements"
            value={nameEn}
            onChange={(e) => {
              setNameEn(e.target.value);
              if (!slug) setSlug(slugify(e.target.value));
            }}
            error={errors.nameEn}
          />

          <Input
            label="Gujarati Category Name (ગુજરાતી)"
            required
            placeholder="દા.ત. ગામ જાહેરાતો"
            value={nameGu}
            onChange={(e) => setNameGu(e.target.value)}
            error={errors.nameGu}
          />

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#24231F]">
                Slug <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setSlug(slugify(nameEn))}
                className="text-[11px] text-[#315B3B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Auto-generate</span>
              </button>
            </div>
            <Input
              required
              placeholder="village-announcements"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              error={errors.slug}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D9C6A5]/30">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Create Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
