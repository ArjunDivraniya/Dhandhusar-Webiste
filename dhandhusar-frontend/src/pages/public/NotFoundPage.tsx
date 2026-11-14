import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/language-context.ts';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { language, t } = useLanguage();
  const isGu = language === 'GU';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-[#FAF7F0] border-2 border-[#D9C6A5] text-[#315B3B] flex items-center justify-center mx-auto shadow-xs">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="font-serif text-5xl font-black text-[#70452D]">404</span>
          <h1 className="font-serif text-2xl font-bold text-[#24231F]">
            {isGu ? 'પૃષ્ઠ મળ્યું નથી' : 'Page Not Found'}
          </h1>
          <p className="text-sm text-[#5C5850] leading-relaxed">
            {isGu
              ? 'તમે જે પેજ શોધી રહ્યા છો તે અસ્તિત્વમાં નથી અથવા તેને ખસેડવામાં આવ્યું છે.'
              : 'The page you are looking for does not exist or may have been moved.'}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#315B3B] text-white text-xs font-semibold hover:bg-[#23432B] transition-colors shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>{t.nav.home}</span>
          </Link>

          <Link
            to="/news"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#D9C6A5] bg-white text-xs font-semibold text-[#24231F] hover:bg-[#FAF7F0] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.nav.news}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

