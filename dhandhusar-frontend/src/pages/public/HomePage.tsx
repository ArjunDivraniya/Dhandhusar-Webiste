import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/language-context.ts';
import { publicApi } from '../../api/public.api.ts';
import type { NewsArticle } from '../../types/news.types.ts';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Calendar,
  Building2,
  TreePine,
  ShieldCheck,
  Music,
  BellRing,
  MapPin,
  Clock,
  Phone,
  ExternalLink,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { language, t } = useLanguage();
  const isGu = language === 'GU';

  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);
  const [pinnedNotice, setPinnedNotice] = useState<NewsArticle | null>(null);
  const [loadingNews, setLoadingNews] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadPublicData() {
      try {
        setLoadingNews(true);
        const res = await publicApi.fetchPublishedNews({
          lang: language,
          limit: 3,
        });

        if (isMounted && res.items) {
          setLatestNews(res.items);
          const pinned = res.items.find((item) => item.isPinned) || null;
          setPinnedNotice(pinned);
        }
      } catch (err) {
        console.error('Failed to load published news for homepage:', err);
      } finally {
        if (isMounted) setLoadingNews(false);
      }
    }

    loadPublicData();
    return () => {
      isMounted = false;
    };
  }, [language]);

  const pillars = [
    {
      id: 'temples',
      title: t.pillars.templesTitle,
      description: t.pillars.templesDesc,
      icon: Sparkles,
      image:
        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
      badge: isGu ? 'દેવસ્થાન' : 'Sanctuary',
    },
    {
      id: 'agriculture',
      title: t.pillars.farmingTitle,
      description: t.pillars.farmingDesc,
      icon: TreePine,
      image:
        'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1200&q=80',
      badge: isGu ? 'ફળદ્રુપ ધરતી' : 'Agriculture',
    },
    {
      id: 'panchayat',
      title: t.pillars.panchayatTitle,
      description: t.pillars.panchayatDesc,
      icon: Building2,
      image:
        'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
      badge: isGu ? 'ગ્રામ શાસન' : 'Civic Progress',
    },
    {
      id: 'culture',
      title: t.pillars.cultureTitle,
      description: t.pillars.cultureDesc,
      icon: Music,
      image:
        'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
      badge: isGu ? 'લોક સંસ્કૃતિ' : 'Tradition',
    },
  ];

  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      {/* =========================================================================
          SECTION A: CINEMATIC HERO
          ========================================================================= */}
      <section className="relative min-h-[82vh] flex items-center justify-center bg-[#23432B] text-white">
        {/* Authentic Background with Natural Dark Gradient & Subtle Vignette */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=80"
            alt="Scenic agricultural landscape of Saurashtra Gujarat"
            className="w-full h-full object-cover object-center filter brightness-[0.42] contrast-[1.08] scale-105 animate-in fade-in duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#24231F] via-[#23432B]/60 to-black/40" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.45)_100%)]" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium text-[#FAF7F0] shadow-sm animate-in fade-in slide-in-from-top-3 duration-700">
            <span>{t.hero.badge}</span>
          </div>

          {/* Bilingual Headline */}
          <div className="space-y-4">
            <h1
              className={`font-serif text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#FAF7F0] leading-tight max-w-4xl mx-auto ${
                isGu ? 'font-gujarati' : ''
              }`}
            >
              {t.hero.title}
            </h1>
            <p className="text-base sm:text-xl text-[#FAF7F0]/85 font-sans max-w-3xl mx-auto leading-relaxed font-light">
              {t.hero.subtitle}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="#heritage"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#FAF7F0] text-[#315B3B] font-semibold text-sm hover:bg-[#D9C6A5] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Compass className="w-4 h-4" />
              <span>{t.hero.villageHeritage}</span>
            </a>
            <Link
              to="/news"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#315B3B]/80 text-[#FAF7F0] border border-white/25 font-semibold text-sm hover:bg-[#315B3B] transition-all backdrop-blur-sm hover:-translate-y-0.5"
            >
              <span>{t.hero.exploreNews}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Grounded Geographical Overview Bar */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-xs text-[#FAF7F0]/90">
            <div className="p-3 rounded-lg bg-black/25 backdrop-blur-xs border border-white/10">
              <span className="font-semibold">{t.hero.statDistrict}</span>
            </div>
            <div className="p-3 rounded-lg bg-black/25 backdrop-blur-xs border border-white/10">
              <span className="font-semibold">{t.hero.statTaluka}</span>
            </div>
            <div className="p-3 rounded-lg bg-black/25 backdrop-blur-xs border border-white/10">
              <span className="font-semibold">{t.hero.statPin}</span>
            </div>
            <div className="p-3 rounded-lg bg-black/25 backdrop-blur-xs border border-white/10">
              <span className="font-semibold">{t.hero.statRegion}</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION B: VILLAGE INTRODUCTION & IDENTITY
          ========================================================================= */}
      <section id="about" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#315B3B]">
          <span className="w-8 h-px bg-[#315B3B]"></span>
          <span>{isGu ? 'ગામ પરિચય' : 'About Dhandusar'}</span>
          <span className="w-8 h-px bg-[#315B3B]"></span>
        </div>

        <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#24231F] leading-snug">
          {isGu
            ? 'સૌરાષ્ટ્રની સંસ્કૃતિ અને આસ્થાનું જીવંત પ્રતીક'
            : 'A Living Symbol of Saurashtrian Heritage and Community'}
        </h2>

        <div className="text-[#5C5850] text-base sm:text-lg leading-relaxed max-w-3xl mx-auto space-y-4">
          <p>
            {isGu
              ? 'ધંધુસર ગામ જૂનાગઢ જિલ્લાના વંથલી તાલુકામાં આવેલું એક ઐતિહાસિક અને પ્રગતિશીલ ગામ છે. ગિરનાર પર્વતમાળાના સનિધ્યમાં વસેલું આ ગામ તેની ધાર્મિક પરંપરાઓ, ભક્તિભાવ અને વિશ્વપ્રસિદ્ધ ગીરની કેસર કેરીના બાગાયત માટે જાણીતું છે.'
              : 'Dhandusar is an ancient and progressive village situated in the Vanthali taluka of Junagadh district, Gujarat. Nestled close to the sacred Girnar range, the village is renowned for its spiritual traditions, warm community brotherhood, and fertile agricultural heritage.'}
          </p>
          <p className="text-sm text-[#70452D] font-medium">
            {isGu
              ? 'પિન કોડ: ૩૬૨૨૨૦ • વહીવટી જિલ્લો: જૂનાગઢ • રાજ્ય: ગુજરાત (ભારત)'
              : 'Postal Index: 362220 • Administrative District: Junagadh • Gujarat State, India'}
          </p>
        </div>
      </section>

      {/* =========================================================================
          SECTION D: IMPORTANT NOTICES / PINNED TICKER
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {pinnedNotice ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F0E5] border border-[#D9C6A5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-[#315B3B] text-white shrink-0">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#315B3B]">
                    {t.announcements.pinnedBadge}
                  </span>
                  <span className="text-xs text-[#5C5850]">
                    {pinnedNotice.publishedAt
                      ? new Date(pinnedNotice.publishedAt).toLocaleDateString(
                          isGu ? 'gu-IN' : 'en-IN',
                          { day: 'numeric', month: 'short', year: 'numeric' }
                        )
                      : ''}
                  </span>
                </div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#24231F]">
                  {pinnedNotice.translations?.[0]?.title || 'Village Announcement'}
                </h3>
              </div>
            </div>

            <Link
              to={`/news/${pinnedNotice.translations?.[0]?.slug || ''}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#315B3B] text-white text-xs font-semibold hover:bg-[#23432B] transition-colors shrink-0"
            >
              <span>{t.announcements.viewDetails}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#D9C6A5]/50 flex items-center justify-between text-xs text-[#5C5850]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#315B3B]" />
              <span>
                {isGu
                  ? 'ગ્રામ પંચાયત કચેરી સોમવારથી શનિવાર ખુલ્લી રહેશે. તાજા પરિપત્રો માટે સમાચાર વિભાગ જુઓ.'
                  : 'Gram Panchayat office operates Monday to Saturday. Check the News section for official notifications.'}
              </span>
            </div>
            <Link to="/news" className="text-[#315B3B] font-semibold hover:underline shrink-0">
              {t.nav.news}
            </Link>
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION C: HERITAGE PILLARS
          ========================================================================= */}
      <section id="heritage" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#24231F]">
            {t.pillars.sectionTitle}
          </h2>
          <p className="text-[#5C5850] text-sm sm:text-base">
            {t.pillars.sectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                className="group relative rounded-2xl bg-white border border-[#D9C6A5]/60 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Header with Subtle Zoom */}
                <div className="relative h-48 overflow-hidden bg-[#FAF7F0]">
                  <img
                    src={pillar.image}
                    alt={pillar.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-xs text-[11px] font-semibold text-[#315B3B] shadow-xs">
                    {pillar.badge}
                  </span>
                  <div className="absolute bottom-3 left-3 p-2 rounded-xl bg-[#315B3B] text-white">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#24231F] group-hover:text-[#315B3B] transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5C5850] leading-relaxed mt-2">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION E: LATEST VILLAGE NEWS & ANNOUNCEMENTS
          ========================================================================= */}
      <section className="bg-[#F5F0E5]/60 py-16 border-y border-[#D9C6A5]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#315B3B] mb-2">
                <span>{isGu ? 'અધિકૃત માહિતી' : 'Official Feed'}</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#24231F]">
                {t.newsSection.title}
              </h2>
              <p className="text-[#5C5850] text-sm mt-1">
                {t.newsSection.subtitle}
              </p>
            </div>

            <Link
              to="/news"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#315B3B] hover:text-[#23432B] transition-colors group"
            >
              <span>{t.newsSection.viewAll}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Dynamic News Grid */}
          {loadingNews ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="rounded-2xl bg-white border border-[#D9C6A5]/40 h-80 animate-pulse p-4 space-y-4"
                >
                  <div className="h-40 bg-gray-200 rounded-xl" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              ))}
            </div>
          ) : latestNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestNews.map((article) => {
                const tr = article.translations?.[0];
                const title = tr?.title || 'Announcement';
                const summary = tr?.summary || '';
                const slug = tr?.slug || article.id;
                const categoryName = isGu
                  ? article.category?.nameGu
                  : article.category?.nameEn;

                return (
                  <article
                    key={article.id}
                    className="group rounded-2xl bg-white border border-[#D9C6A5]/60 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Thumbnail with Fallback */}
                      <div className="relative h-48 bg-[#FAF7F0] overflow-hidden">
                        {article.featuredImage ? (
                          <img
                            src={article.featuredImage}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#315B3B]/10 to-[#D9C6A5]/30">
                            <span className="font-serif text-3xl font-bold text-[#315B3B]/40">
                              ધંધુસર
                            </span>
                          </div>
                        )}
                        {categoryName && (
                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#FAF7F0] text-[#315B3B] text-[11px] font-semibold shadow-xs">
                            {categoryName}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-[#5C5850]">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {article.publishedAt
                              ? new Date(article.publishedAt).toLocaleDateString(
                                  isGu ? 'gu-IN' : 'en-IN',
                                  { day: 'numeric', month: 'short', year: 'numeric' }
                                )
                              : ''}
                          </span>
                        </div>

                        <h3 className="font-serif text-lg font-bold text-[#24231F] group-hover:text-[#315B3B] transition-colors line-clamp-2">
                          {title}
                        </h3>

                        {summary && (
                          <p className="text-xs sm:text-sm text-[#5C5850] line-clamp-2">
                            {summary}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <Link
                        to={`/news/${slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#315B3B] group-hover:text-[#23432B]"
                      >
                        <span>{t.newsSection.readMore}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl bg-white border border-[#D9C6A5]/60 p-6 space-y-3">
              <Building2 className="w-10 h-10 text-[#D9C6A5] mx-auto" />
              <h3 className="font-serif text-lg font-bold text-[#24231F]">
                {t.newsSection.noNews}
              </h3>
              <p className="text-xs text-[#5C5850] max-w-md mx-auto">
                {isGu
                  ? 'ગ્રામ પંચાયતના નવા પરિપત્રો અથવા સમાચારો ટૂંક સમયમાં અહીં પ્રકાશિત થશે.'
                  : 'New announcements and village updates will appear here once officially published.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION F: CIVIC SERVICES & INFORMATION DIRECTORY
          ========================================================================= */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#315B3B]">
            <span>{isGu ? 'લોક સુવિધાઓ' : 'Civic Directory'}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#24231F]">
            {t.directory.title}
          </h2>
          <p className="text-[#5C5850] text-sm">
            {t.directory.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Panchayat Bhavan */}
          <div className="p-6 rounded-2xl bg-white border border-[#D9C6A5]/60 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#315B3B]/10 text-[#315B3B] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#24231F]">
              {t.directory.panchayat}
            </h3>
            <p className="text-xs text-[#5C5850] leading-relaxed">
              {t.directory.panchayatTiming}
            </p>
            <div className="pt-2 text-xs text-[#315B3B] font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{isGu ? 'ધંધુસર ગામ ચોક' : 'Village Center, Dhandusar'}</span>
            </div>
          </div>

          {/* Primary Health Center */}
          <div className="p-6 rounded-2xl bg-white border border-[#D9C6A5]/60 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#70452D]/10 text-[#70452D] flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#24231F]">
              {t.directory.health}
            </h3>
            <p className="text-xs text-[#5C5850] leading-relaxed">
              {t.directory.healthDesc}
            </p>
            <div className="pt-2 text-xs text-[#70452D] font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{isGu ? '૨૪×૭ ઇમરજન્સી હેલ્પલાઇન: ૧૦૮' : '24x7 Emergency: 108'}</span>
            </div>
          </div>

          {/* PGVCL Electricity Substation */}
          <div className="p-6 rounded-2xl bg-white border border-[#D9C6A5]/60 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#24231F]">
              {t.directory.electricity}
            </h3>
            <p className="text-xs text-[#5C5850] leading-relaxed">
              {t.directory.electricityDesc}
            </p>
            <div className="pt-2 text-xs text-amber-800 font-semibold flex items-center gap-1">
              <span>{isGu ? 'ટોલ ફ્રી ફરિયાદ: ૧૯૧૨૨' : 'Toll Free Helpline: 19122'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION G: CLOSING HERITAGE INVITATION
          ========================================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#23432B] to-[#315B3B] text-white p-8 sm:p-12 text-center space-y-6 shadow-lg relative overflow-hidden">
          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <span className="font-serif text-xs uppercase tracking-widest text-[#D9C6A5]">
              {isGu ? 'સોરઠની યાત્રા' : 'Saurashtra Heritage'}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#FAF7F0]">
              {isGu
                ? 'ધંધુસર ગામના સાંસ્કૃતિક વારસાને અનુભવો'
                : 'Experience the Timeless Culture of Dhandusar'}
            </h2>
            <p className="text-sm sm:text-base text-[#FAF7F0]/80 font-light leading-relaxed">
              {isGu
                ? 'આપણું ગામ પરંપરા અને આધુનિકતાના સુભગ સમન્વય સાથે અવિરત વિકાસ તરફ આગળ વધી રહ્યું છે.'
                : 'A peaceful haven preserving historic roots while moving steadily towards a connected and progressive future.'}
            </p>
            <div className="pt-2">
              <Link
                to="/news"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FAF7F0] text-[#315B3B] text-sm font-bold hover:bg-[#D9C6A5] transition-colors shadow-sm"
              >
                <span>{t.newsSection.viewAll}</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

