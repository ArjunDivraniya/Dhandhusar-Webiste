import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Newspaper,
  CheckSquare,
  FolderTree,
  Images,
  LogOut,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/auth-context.ts';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  pendingCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, pendingCount = 0 }) => {
  const { user, logout, hasPermission } = useAuth();

  const canReview = hasPermission('news.review');

  const navItems = [
    {
      label: 'Overview',
      path: '/admin',
      icon: <LayoutDashboard className="w-4 h-4" />,
      end: true,
    },
    {
      label: 'News & Updates',
      path: '/admin/news',
      icon: <Newspaper className="w-4 h-4" />,
      end: false,
    },
    ...(canReview
      ? [
          {
            label: 'Review Queue',
            path: '/admin/review',
            icon: <CheckSquare className="w-4 h-4" />,
            badge: pendingCount > 0 ? pendingCount : undefined,
            end: false,
          },
        ]
      : []),
    {
      label: 'Categories',
      path: '/admin/categories',
      icon: <FolderTree className="w-4 h-4" />,
      end: false,
    },
    {
      label: 'Gallery',
      path: '#',
      icon: <Images className="w-4 h-4" />,
      disabled: true,
      tag: 'Soon',
      end: false,
    },
  ];

  const primaryRole = user?.roles[0]?.replace('_', ' ') || 'Admin';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#24231F] text-[#F5F0E5] select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#315B3B] flex items-center justify-center font-serif text-white font-bold text-sm shadow-sm">
            ED
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-white font-serif">
              Explore Dhandusar
            </h1>
            <p className="text-[10px] text-[#D9C6A5] tracking-wider uppercase">
              Admin Portal
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden p-1 rounded-md text-[#D9C6A5] hover:text-white hover:bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] font-semibold text-[#D9C6A5]/60 tracking-wider uppercase">
          Management
        </p>

        {navItems.map((item) => {
          if (item.disabled) {
            return (
              <div
                key={item.label}
                className="flex items-center justify-between px-3 py-2 text-xs text-[#D9C6A5]/40 rounded-lg cursor-not-allowed"
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.tag && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-[#D9C6A5]/50 border border-white/10">
                    {item.tag}
                  </span>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors duration-150 ${
                  isActive
                    ? 'bg-[#315B3B] text-white shadow-xs font-semibold'
                    : 'text-[#F5F0E5]/80 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500 text-[#24231F]">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-white/10 bg-black/20">
        <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#70452D] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.name}</p>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5 text-[#D9C6A5]" />
                <p className="text-[10px] text-[#D9C6A5] tracking-wide capitalize truncate">
                  {primaryRole}
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            title="Sign out"
            onClick={logout}
            className="p-1.5 rounded-md text-[#D9C6A5] hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-30 shadow-md">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-[#24231F]/60 backdrop-blur-xs"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 w-64 shadow-xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
