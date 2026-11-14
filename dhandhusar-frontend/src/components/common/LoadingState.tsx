import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  className = 'py-16',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center space-y-3 ${className}`}>
      <div className="p-3 bg-[#F5F0E5] rounded-full border border-[#D9C6A5]/50">
        <Loader2 className="w-5 h-5 text-[#315B3B] animate-spin" />
      </div>
      <p className="text-xs font-medium text-[#5C5850]">{message}</p>
    </div>
  );
};

