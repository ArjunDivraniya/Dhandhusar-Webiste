import { createContext, useContext } from 'react';
import type { LanguageCode } from '../types/news.types.ts';

export interface Translations {
  nav: {
    home: string;
    news: string;
    heritage: string;
    places: string;
    info: string;
    adminPortal: string;
    login: string;
    switchLang: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    exploreNews: string;
    villageHeritage: string;
    statDistrict: string;
    statTaluka: string;
    statPin: string;
    statRegion: string;
  };
  announcements: {
    noticeTitle: string;
    viewDetails: string;
    pinnedBadge: string;
  };
  pillars: {
    sectionTitle: string;
    sectionSubtitle: string;
    templesTitle: string;
    templesDesc: string;
    farmingTitle: string;
    farmingDesc: string;
    panchayatTitle: string;
    panchayatDesc: string;
    cultureTitle: string;
    cultureDesc: string;
  };
  newsSection: {
    title: string;
    subtitle: string;
    viewAll: string;
    readMore: string;
    noNews: string;
    publishedOn: string;
  };
  directory: {
    title: string;
    subtitle: string;
    panchayat: string;
    panchayatTiming: string;
    health: string;
    healthDesc: string;
    school: string;
    schoolDesc: string;
    electricity: string;
    electricityDesc: string;
    transport: string;
    transportDesc: string;
  };
  newsPage: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    allCategories: string;
    sortNewest: string;
    sortOldest: string;
    noArticles: string;
    noArticlesDesc: string;
    resetFilters: string;
    page: string;
    of: string;
    prev: string;
    next: string;
  };
  newsDetail: {
    backToNews: string;
    shareArticle: string;
    shareWhatsApp: string;
    copyLink: string;
    copied: string;
    minRead: string;
    relatedNews: string;
    alternateLangAvailable: string;
    readInOtherLang: string;
  };
  footer: {
    aboutTitle: string;
    aboutDesc: string;
    quickLinks: string;
    servicesTitle: string;
    addressTitle: string;
    address: string;
    rights: string;
  };
}

export interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  toggleLanguage: () => void;
  t: Translations;
}

export const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

