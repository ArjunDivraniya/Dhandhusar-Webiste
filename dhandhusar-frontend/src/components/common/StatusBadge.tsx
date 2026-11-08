import React from 'react';
import type { ContentStatus } from '../../types/news.types.ts';

interface StatusBadgeProps {
  status: ContentStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<
  ContentStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  DRAFT: {
    label: 'Draft',
    bg: 'bg-[#F5F0E5]',
    text: 'text-[#5C5850]',
    border: 'border-[#D9C6A5]',
    dot: 'bg-[#5C5850]',
  },
  PENDING_REVIEW: {
    label: 'Pending Review',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  CHANGES_REQUESTED: {
    label: 'Changes Requested',
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
  },
  PUBLISHED: {
    label: 'Published',
    bg: 'bg-[#315B3B]/10',
    text: 'text-[#23432B]',
    border: 'border-[#315B3B]/30',
    dot: 'bg-[#315B3B]',
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
  ARCHIVED: {
    label: 'Archived',
    bg: 'bg-stone-100',
    text: 'text-stone-600',
    border: 'border-stone-300',
    dot: 'bg-stone-400',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const config = statusConfig[status] || statusConfig.DRAFT;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};
