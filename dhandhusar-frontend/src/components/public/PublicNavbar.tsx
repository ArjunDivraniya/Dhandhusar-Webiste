import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/language-context.ts';
import { useAuth } from '../../context/auth-context.ts';
import {
  Globe,
  Menu,
  X,
  Compass,
  Newspaper,
  Landmark,
  Sparkles,
  PhoneCall,
  UserCheck,
} from 'lucide-react';

export const PublicNavbar: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isGu = language === 'GU';

  const navLinks = [
    { label: t.nav.home, href: '/', icon: Compass },
    { label: t.nav.news, href: '/news', icon: Newspaper },
    { label: t.nav.heritage, href: '/#heritage', icon: Landmark },
    { label: t.nav.places, href: '/#places', icon: Sparkles },
    { label: t.nav.info, href: '/#services', icon: PhoneCall },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    if (href === '/news') return location.pathname.startsWith('/news');
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F0]/95 backdrop-blur-md border-b border-[#D9C6A5]/50 shadow-xs transition-all">
      {/* Top micro-bar for village helpline and state banner */}
      <div className="bg-[#315B3B] text-[#F5F0E5] text-xs py-1 px-4 sm:px-8 flex items-center justify-between font-medium">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            {isGu
              ? 'ગ્રામ પંચાયત ધંધુસર • જૂનાગઢ જિલ્લો (૩૬૨૨૨૦)'
              : 'Gram Panchayat Dhandusar • Dist. Junagadh (362220)'}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-[11px] text-[#FAF7F0]/80">
          <span>{isGu ? 'જય ગિરનારી 🚩' : 'Jai Girnari 🚩'}</span>
          <span>•</span>
          <span>{isGu ? 'સોરઠની પુણ્યભૂમિ' : 'Historic Saurashtra'}</span>
        </div>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Emblem & Name */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#315B3B] text-[#F5F0E5] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <span className="font-serif text-xl font-bold tracking-tight">ધ</span>
          </div>
          <div className="flex flex-col">
            <span
              className={`font-serif text-xl font-bold tracking-tight text-[#24231F] group-hover:text-[#315B3B] transition-colors ${
                isGu ? 'font-gujarati' : ''
              }`}
            >
              {isGu ? 'ધંધુસર દર્શન' : 'Explore Dhandusar'}
            </span>
            <span className="text-xs text-[#5C5850] font-sans">
              {isGu ? 'જૂનાગઢ, ગુજરાત' : 'Junagadh, Gujarat'}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((item) => {
            const active = isActive(item.href);
            return item.href.startsWith('/#') ? (
              <a
                key={item.href}
                href={item.href}
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-[#5C5850] hover:text-[#315B3B] hover:bg-[#F5F0E5]/70 transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                to={item.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'text-[#315B3B] bg-[#315B3B]/10 font-semibold'
                    : 'text-[#5C5850] hover:text-[#315B3B] hover:bg-[#F5F0E5]/70'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D9C6A5] text-xs font-semibold text-[#24231F] hover:bg-[#F5F0E5] transition-colors"
            title="Toggle Gujarati / English"
          >
            <Globe className="w-3.5 h-3.5 text-[#315B3B]" />
            <span>{t.nav.switchLang}</span>
          </button>

          {/* Admin Portal Gateway */}
          <Link
            to={isAuthenticated ? '/admin' : '/login'}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#315B3B] text-[#FAF7F0] text-xs font-semibold hover:bg-[#23432B] shadow-xs transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{isAuthenticated ? t.nav.adminPortal : t.nav.login}</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={toggleLanguage}
            className="p-2 rounded-lg border border-[#D9C6A5] text-xs font-bold text-[#24231F]"
            aria-label="Switch Language"
          >
            {language === 'GU' ? 'EN' : 'ગુ'}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#24231F] hover:bg-[#F5F0E5]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#D9C6A5]/50 bg-[#FAF7F0] px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return item.href.startsWith('/#') ? (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#24231F] hover:bg-[#F5F0E5]"
              >
                <Icon className="w-4 h-4 text-[#315B3B]" />
                <span>{item.label}</span>
              </a>
            ) : (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active
                    ? 'text-[#315B3B] bg-[#315B3B]/10 font-semibold'
                    : 'text-[#24231F] hover:bg-[#F5F0E5]'
                }`}
              >
                <Icon className="w-4 h-4 text-[#315B3B]" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-[#D9C6A5]/40 flex flex-col gap-2">
            <Link
              to={isAuthenticated ? '/admin' : '/login'}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#315B3B] text-white text-sm font-semibold hover:bg-[#23432B]"
            >
              <UserCheck className="w-4 h-4" />
              <span>{isAuthenticated ? t.nav.adminPortal : t.nav.login}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

