import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button.tsx';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className = 'py-12',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-6 bg-white rounded-xl border border-[#D9C6A5]/40 ${className}`}>
      <div className="p-3 bg-[#F5F0E5] rounded-full text-[#70452D] mb-3 border border-[#D9C6A5]/40">
        {icon || <Inbox className="w-5 h-5 text-[#5C5850]" />}
      </div>
      <h4 className="text-sm font-semibold text-[#24231F]">{title}</h4>
      {description && (
        <p className="mt-1 text-xs text-[#5C5850] max-w-sm">{description}</p>
      )}
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

