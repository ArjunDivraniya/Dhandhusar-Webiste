import React from 'react';
import { Menu, Globe } from 'lucide-react';
import { useAuth } from '../../context/auth-context.ts';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, title }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-[#D9C6A5]/40 h-14 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded-lg text-[#5C5850] hover:text-[#24231F] hover:bg-[#F5F0E5]"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && (
          <h2 className="text-sm font-semibold text-[#24231F] tracking-tight">
            {title}
          </h2>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Bilingual Content System Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5F0E5] border border-[#D9C6A5]/50 text-[#5C5850] text-xs">
          <Globe className="w-3.5 h-3.5 text-[#315B3B]" />
          <span className="font-medium text-[#24231F]">GU</span>
          <span className="text-[#D9C6A5]">•</span>
          <span className="font-medium text-[#24231F]">EN</span>
        </div>

        {/* Small avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#D9C6A5]/40">
          <div className="w-7 h-7 rounded-full bg-[#315B3B] text-white flex items-center justify-center text-xs font-semibold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="hidden sm:inline text-xs font-medium text-[#24231F]">
            {user?.name?.split(' ')[0]}
          </span>
        </div>
      </div>
    </header>
  );
};
