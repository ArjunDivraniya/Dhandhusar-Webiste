import React, { useState, useEffect, useMemo } from 'react';
import type { LanguageCode } from '../types/news.types.ts';
import {
  LanguageContext,
  type LanguageContextValue,
  type Translations,
} from './language-context.ts';

const translationsData: Record<LanguageCode, Translations> = {
  GU: {
    nav: {
      home: 'મુખપૃષ્ઠ',
      news: 'સમાચાર & અપડેટ્સ',
      heritage: 'વારસો',
      places: 'તીર્થસ્થાનો',
      info: 'ગામ પરિચય',
      adminPortal: 'વહીવટી પોર્ટલ',
      login: 'લૉગિન',
      switchLang: 'English',
    },
    hero: {
      badge: '🌿 જૂનાગઢ જિલ્લાનું પવિત્ર અને સમૃદ્ધ ગામ',
      title: 'ધંધુસર ગામની ડિજિટલ ઓળખમાં આપનું સ્વાગત છે',
      subtitle:
        'ગીરનારની પુણ્યછત્રછાયામાં વસેલું ભક્તિ, સંસ્કૃતિ, કેસર કેરીના આંબાવાડિયાં અને એકતાનું ગૌરવવંતુ ધંધુસર ગામ.',
      exploreNews: 'ગામના તાજા સમાચાર',
      villageHeritage: 'ઐતિહાસિક વારસો',
      statDistrict: 'જિલ્લો: જૂનાગઢ',
      statTaluka: 'તાલુકો: વંથલી',
      statPin: 'પિન કોડ: ૩૬૨૨૨૦',
      statRegion: 'પ્રદેશ: સોરઠ (સૌરાષ્ટ્ર)',
    },
    announcements: {
      noticeTitle: 'ગ્રામ પંચાયત અગત્યની જાહેરાત',
      viewDetails: 'સંપૂર્ણ વાંચો',
      pinnedBadge: 'વિશેષ જાહેરાત',
    },
    pillars: {
      sectionTitle: 'ધંધુસર ગામના મુખ્ય સ્તંભો',
      sectionSubtitle:
        'ભક્તિ, ફળદ્રુપ કૃષિ, સુગ્રથિત વહીવટ અને જીવંત સૌરાષ્ટ્રી સંસ્કૃતિનો અનોખો સમન્વય.',
      templesTitle: 'પવિત્ર મંદિરો અને આસ્થા',
      templesDesc:
        'શ્રી રામ મંદિર, શિવ મંદિર અને આઈ ખોડિયાર માતાજીના દિવ્ય સાનિધ્યમાં ગામની આસ્થા અને શાંતિ સચવાયેલી છે.',
      farmingTitle: 'ફળદ્રુપ કૃષિ & કેસર કેરી',
      farmingDesc:
        'વિશ્વપ્રસિદ્ધ ગીરની કેસર કેરી, મગફળી, કપાસ અને ઘઉંની સમૃદ્ધ ઉપજ આપતી સોરઠની ફળદ્રુપ કાળી જમીન.',
      panchayatTitle: 'પંચાયત & ગામ વિકાસ',
      panchayatDesc:
        'પારદર્શક વહીવટ, ભૂગર્ભ ગટર વ્યવસ્થા, પાકા સીસી રોડ, શુદ્ધ પીવાનું પાણી અને આધુનિક ડિજિટલ સેવાઓ.',
      cultureTitle: 'ઉત્સવો અને સૌરાષ્ટ્રી આતિથ્ય',
      cultureDesc:
        'નવરાત્રિના ભવ્ય રાસ-ગરબા, જન્માષ્ટમી શોભાયાત્રા અને લોકડાયરા દ્વારા સદીઓ જૂની પરંપરા જીવંત રહે છે.',
    },
    newsSection: {
      title: 'તાજા સમાચાર અને જાહેરાતો',
      subtitle: 'ગ્રામ પંચાયત, ખેતીવાડી, તહેવારો અને વિકાસ કાર્યોની અધિકૃત વિગતો',
      viewAll: 'બધા સમાચાર જુઓ',
      readMore: 'સંપૂર્ણ સમાચાર વાંચો',
      noNews: 'હાલમાં કોઈ પ્રકાશિત સમાચાર ઉપલબ્ધ નથી.',
      publishedOn: 'પ્રકાશિત તારીખ',
    },
    directory: {
      title: 'મહત્વની સેવાઓ અને માળખાગત સુવિધાઓ',
      subtitle: 'ગામના નાગરિકો અને મુલાકાતીઓ માટે જરૂરી સંપર્ક તેમજ સુવિધાઓની માહિતી',
      panchayat: 'ગ્રામ પંચાયત ભવન',
      panchayatTiming: 'સોમવારથી શનિવાર: સવારે ૧૦:૩૦ થી સાંજે ૦૫:૩૦',
      health: 'પ્રાથમિક આરોગ્ય કેન્દ્ર (PHC)',
      healthDesc: '૨૪ કલાક ઇમરજન્સી અને મફત પ્રાથમિક સારવાર સેવા',
      school: 'સરકારી પ્રાથમિક શાળા',
      schoolDesc: 'ગુણવત્તાયુક્ત શિક્ષણ અને સુવિધાયુક્ત સ્માર્ટ ક્લાસ',
      electricity: 'PGVCL વીજ પેટા વિભાગ',
      electricityDesc: 'ખેતીવાડી અને ઘરેલું ૨૪×૭ વીજ પુરવઠો સહાયતા',
      transport: 'વાહનવ્યવહાર અને કનેક્ટિવિટી',
      transportDesc: 'જૂનાગઢ સ્ટેશનથી ૧૫ કિમી અંતરે, નિયમિત એસ.ટી. બસ સુવિધા',
    },
    newsPage: {
      title: 'ગામના સમાચાર અને જાહેરાતો',
      subtitle: 'ધંધુસર ગામ પંચાયત, કૃષિ સહાય, ઉત્સવો અને લોકકલ્યાણ યોજનાઓની સત્તાવાર માહિતી',
      searchPlaceholder: 'સમાચાર અથવા જાહેરાત શોધો...',
      allCategories: 'બધા સમાચાર',
      sortNewest: 'સૌથી નવા પહેલા',
      sortOldest: 'સૌથી જૂના પહેલા',
      noArticles: 'કોઈ સમાચાર મળ્યા નથી',
      noArticlesDesc: 'તમે પસંદ કરેલ માપદંડો મુજબ કોઈ સમાચાર ઉપલબ્ધ નથી. કૃપા કરીને અન્ય શોધ અથવા ફિલ્ટર અજમાવો.',
      resetFilters: 'ફિલ્ટર રીસેટ કરો',
      page: 'પૃષ્ઠ',
      of: 'માંથી',
      prev: 'પાછળ',
      next: 'આગળ',
    },
    newsDetail: {
      backToNews: 'સમાચાર યાદી પર પાછા જાઓ',
      shareArticle: 'આ સમાચાર શેર કરો',
      shareWhatsApp: 'વોટ્સએપ પર શેર કરો',
      copyLink: 'લિંક કોપી કરો',
      copied: 'લિંક ક્લિપબોર્ડમાં કોપી થઈ ગઈ!',
      minRead: 'મિનિટ વાંચન',
      relatedNews: 'અન્ય તાજા સમાચાર',
      alternateLangAvailable: 'આ લેખ અંગ્રેજીમાં પણ ઉપલબ્ધ છે',
      readInOtherLang: 'Switch to English version',
    },
    footer: {
      aboutTitle: 'ધંધુસર દર્શન',
      aboutDesc:
        'ધંધુસર ગામની પવિત્ર સંસ્કૃતિ, ઐતિહાસિક સ્થાનો અને આધુનિક વિકાસને એક તાંતણે બાંધતું સત્તાવાર લોક ઉપયોગી પોર્ટલ.',
      quickLinks: 'ઝડપી લિંક્સ',
      servicesTitle: 'નાગરિક સેવાઓ',
      addressTitle: 'સરનામું અને સંપર્ક',
      address: 'ગ્રામ પંચાયત ભવન, મુ. ધંધુસર, તા. વંથલી, જિ. જૂનાગઢ, ગુજરાત - ૩૬૨૨૨૦',
      rights: 'સર્વ હક સુરક્ષિત. Explore Dhandusar Village Portal.',
    },
  },
  EN: {
    nav: {
      home: 'Home',
      news: 'News & Updates',
      heritage: 'Heritage',
      places: 'Sacred Places',
      info: 'Village Info',
      adminPortal: 'Admin Portal',
      login: 'Login',
      switchLang: 'ગુજરાતી',
    },
    hero: {
      badge: '🌿 A Historic Heritage Village of Saurashtra, Gujarat',
      title: 'Welcome to the Digital Heritage of Dhandusar',
      subtitle:
        'Nestled in the sacred foothills of Mount Girnar — celebrated for devotion, renowned Kesar mango orchards, fertile agriculture, and community harmony.',
      exploreNews: 'Latest Village News',
      villageHeritage: 'Village Heritage',
      statDistrict: 'District: Junagadh',
      statTaluka: 'Taluka: Vanthali',
      statPin: 'PIN Code: 362220',
      statRegion: 'Region: Sorath (Saurashtra)',
    },
    announcements: {
      noticeTitle: 'Gram Panchayat Official Notice',
      viewDetails: 'Read Details',
      pinnedBadge: 'Important Notice',
    },
    pillars: {
      sectionTitle: 'Pillars of Dhandusar',
      sectionSubtitle:
        'A harmonious blend of spirituality, fertile agriculture, dedicated local governance, and vibrant Saurashtrian culture.',
      templesTitle: 'Sacred Temples & Shrines',
      templesDesc:
        'Historic places of worship including Ram Mandir, Shiva Temple, and Khodiyar Mata Mandir inspiring peace and devotion.',
      farmingTitle: 'Fertile Farmlands & Kesar Mango',
      farmingDesc:
        'Renowned Gir Kesar mango orchards, groundnut, cotton, and rich black soil cultivated by hardworking farming families.',
      panchayatTitle: 'Panchayat & Rural Progress',
      panchayatDesc:
        'Transparent civic administration, paved roads, drainage infrastructure, pure water supply, and digital governance.',
      cultureTitle: 'Festivals & Saurashtra Hospitality',
      cultureDesc:
        'Vibrant Navratri Raas-Garba, Janmashtami celebrations, folk music (Dayro), and warm traditional Saurashtrian hospitality.',
    },
    newsSection: {
      title: 'Latest News & Announcements',
      subtitle: 'Official updates from Gram Panchayat, agriculture advisories, and village events',
      viewAll: 'View All News',
      readMore: 'Read Full Story',
      noNews: 'No published news articles available at the moment.',
      publishedOn: 'Published on',
    },
    directory: {
      title: 'Key Facilities & Civic Services',
      subtitle: 'Essential contact numbers and infrastructure details for citizens and visitors',
      panchayat: 'Gram Panchayat Bhavan',
      panchayatTiming: 'Monday to Saturday: 10:30 AM to 05:30 PM',
      health: 'Primary Health Center (PHC)',
      healthDesc: '24-hour emergency care and free medical consultations',
      school: 'Government Primary School',
      schoolDesc: 'Quality elementary education with modern smart class facilities',
      electricity: 'PGVCL Electricity Substation',
      electricityDesc: '24x7 power grid support for residential and agricultural connections',
      transport: 'Transport & Connectivity',
      transportDesc: '15 km from Junagadh Junction Railway Station; regular state transport bus connectivity',
    },
    newsPage: {
      title: 'Village News & Announcements',
      subtitle: 'Official announcements, government schemes, agricultural updates, and community news',
      searchPlaceholder: 'Search articles and notices...',
      allCategories: 'All Categories',
      sortNewest: 'Newest First',
      sortOldest: 'Oldest First',
      noArticles: 'No Articles Found',
      noArticlesDesc: 'No news articles match your selected filters. Please try searching with a different term.',
      resetFilters: 'Reset Filters',
      page: 'Page',
      of: 'of',
      prev: 'Previous',
      next: 'Next',
    },
    newsDetail: {
      backToNews: 'Back to News Feed',
      shareArticle: 'Share this Article',
      shareWhatsApp: 'Share on WhatsApp',
      copyLink: 'Copy Link',
      copied: 'Article link copied to clipboard!',
      minRead: 'min read',
      relatedNews: 'Recent Announcements',
      alternateLangAvailable: 'This article is also available in Gujarati',
      readInOtherLang: 'ગુજરાતી સંસ્કરણ જુઓ',
    },
    footer: {
      aboutTitle: 'Explore Dhandusar',
      aboutDesc:
        'The official digital gateway preserving the culture, heritage, and civic advancements of Dhandusar village, Gujarat.',
      quickLinks: 'Quick Links',
      servicesTitle: 'Public Services',
      addressTitle: 'Address & Contact',
      address: 'Gram Panchayat Bhavan, Dhandusar, Taluka: Vanthali, Dist: Junagadh, Gujarat - 362220',
      rights: 'All rights reserved. Explore Dhandusar Village Portal.',
    },
  },
};

const STORAGE_KEY = 'dhandhusar_public_lang';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'EN' || stored === 'GU') {
        return stored;
      }
    } catch {
      // ignore
    }
    return 'GU';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = React.useCallback(() => {
    setLanguageState((prev) => {
      const next = prev === 'GU' ? 'EN' : 'GU';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === 'GU' ? 'gu' : 'en';
  }, [language]);

  const value: LanguageContextValue = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: translationsData[language],
    }),
    [language, toggleLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

