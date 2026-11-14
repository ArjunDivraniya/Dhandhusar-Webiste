import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/language-context.ts';
import { MapPin, Phone, Mail, ShieldCheck, Heart } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  const { language, t } = useLanguage();
  const isGu = language === 'GU';

  return (
    <footer className="bg-[#24231F] text-[#FAF7F0] pt-14 pb-8 border-t border-[#315B3B]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Column 1: Village Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#315B3B] text-[#FAF7F0] flex items-center justify-center font-serif text-xl font-bold shadow-sm">
                ધ
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-white">
                  {t.footer.aboutTitle}
                </h3>
                <p className="text-xs text-[#D9C6A5]">
                  {isGu ? 'જૂનાગઢ જિલ્લો, ગુજરાત' : 'Junagadh District, Gujarat'}
                </p>
              </div>
            </div>
            <p className="text-sm text-[#FAF7F0]/70 leading-relaxed font-sans">
              {t.footer.aboutDesc}
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs text-[#D9C6A5]">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>
                {isGu ? 'અધિકૃત ગ્રામીણ માહિતી પોર્ટલ' : 'Official Rural Heritage Portal'}
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-semibold text-[#D9C6A5] tracking-wide">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2 text-sm text-[#FAF7F0]/80">
              <li>
                <Link to="/" className="hover:text-emerald-300 transition-colors">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link to="/news" className="hover:text-emerald-300 transition-colors">
                  {t.nav.news}
                </Link>
              </li>
              <li>
                <a href="/#heritage" className="hover:text-emerald-300 transition-colors">
                  {t.nav.heritage}
                </a>
              </li>
              <li>
                <a href="/#places" className="hover:text-emerald-300 transition-colors">
                  {t.nav.places}
                </a>
              </li>
              <li>
                <a href="/#services" className="hover:text-emerald-300 transition-colors">
                  {t.directory.title}
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-300 transition-colors text-xs text-[#D9C6A5]/80">
                  {t.nav.adminPortal}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Emergency & Civic Contacts */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-semibold text-[#D9C6A5] tracking-wide">
              {t.footer.servicesTitle}
            </h4>
            <ul className="space-y-2.5 text-xs text-[#FAF7F0]/80">
              <li className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium text-white">
                    {isGu ? 'ગ્રામ પંચાયત કાર્યાલય:' : 'Panchayat Office:'}
                  </span>
                  <div className="text-[#D9C6A5]">+91 285 2XXXXXX</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium text-white">
                    {isGu ? 'પ્રાથમિક આરોગ્ય કેન્દ્ર (PHC):' : 'Health Center (PHC):'}
                  </span>
                  <div className="text-[#D9C6A5]">108 / 104 (ઇમરજન્સી)</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium text-white">
                    {isGu ? 'PGVCL વીજ સહાય:' : 'PGVCL Electricity:'}
                  </span>
                  <div className="text-[#D9C6A5]">19122 (ટોલ ફ્રી)</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium text-white">
                    {isGu ? 'ઇમેઇલ:' : 'Email:'}
                  </span>
                  <div className="text-[#D9C6A5]">panchayat@dhandhusar.in</div>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Address & Location */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-semibold text-[#D9C6A5] tracking-wide">
              {t.footer.addressTitle}
            </h4>
            <div className="flex items-start gap-2 text-xs text-[#FAF7F0]/80 leading-relaxed">
              <MapPin className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <span>{t.footer.address}</span>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs text-[#FAF7F0]/70 space-y-1">
              <div className="font-semibold text-white">
                {isGu ? 'રેલવે અને માર્ગ સંપર્ક:' : 'Transit & Connectivity:'}
              </div>
              <p>
                {isGu
                  ? 'જૂનાગઢથી ૧૫ કિમી • વંથલી સ્ટેટ હાઈવે કનેક્ટિવિટી'
                  : '15 km from Junagadh Junction • State Highway Access'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FAF7F0]/60 gap-4">
          <p>{t.footer.rights}</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span>{isGu ? 'સોરઠની સંસ્કૃતિ સાથે નિર્મિત' : 'Crafted with respect for Sorath'}</span>
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            </span>
            <span>•</span>
            <Link
              to="/login"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.nav.adminPortal}</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

