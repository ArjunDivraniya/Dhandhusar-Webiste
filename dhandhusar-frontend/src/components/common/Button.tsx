import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  icon,
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-lg cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none';

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-[#315B3B] text-white hover:bg-[#27492F] active:bg-[#1E3924] shadow-xs focus:ring-2 focus:ring-[#315B3B]/30',
    secondary:
      'bg-[#F5F0E5] text-[#24231F] hover:bg-[#EAE3D2] border border-[#D9C6A5]/60 focus:ring-2 focus:ring-[#D9C6A5]/40',
    outline:
      'bg-transparent text-[#24231F] hover:bg-[#F5F0E5]/60 border border-[#D9C6A5] focus:ring-2 focus:ring-[#315B3B]/20',
    danger:
      'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 focus:ring-2 focus:ring-red-200',
    ghost:
      'bg-transparent text-[#5C5850] hover:text-[#24231F] hover:bg-[#F5F0E5]/60 focus:ring-2 focus:ring-[#D9C6A5]/20',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};

