
import React from 'react';
import Logo from './Logo';
import { Language } from '../lib/types';

interface HeaderProps {
  onNavClick: (target: any) => void;
  onTryNow: () => void;
  credits: number;
  lang: Language;
  onLanguageToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavClick, onTryNow, credits, lang, onLanguageToggle }) => {
  const t = {
    gallery: lang === Language.ZH ? '大家的作品' : 'GALLERY',
    pricing: lang === Language.ZH ? '充值' : 'TOP UP',
    studio: lang === Language.ZH ? '我的作品' : 'MY ART',
    start: lang === Language.ZH ? '开始生成' : 'CREATE',
    brand: lang === Language.ZH ? '喵的二次方' : 'Meow Squared'
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 md:h-24 flex items-center justify-between">
        {/* Logo & Brand */}
        <div 
          className="flex items-center gap-3 cursor-pointer shrink-0" 
          onClick={() => onNavClick('home')}
        >
          <Logo size="sm" />
          <span className="text-2xl md:text-3xl font-black tracking-tighter text-[#3E3636]">{t.brand}</span>
        </div>
        
        {/* Center Nav - Tablet+ */}
        <nav className="hidden lg:flex items-center gap-8 text-lg font-bold text-[#8C8379]">
          <button onClick={() => onNavClick('home')} className="hover:text-[#3E3636] transition-colors">{t.gallery}</button>
          <button onClick={() => onNavClick('pricing')} className="hover:text-[#3E3636] transition-colors">{t.pricing}</button>
          <button onClick={() => onNavClick('profile')} className="hover:text-[#3E3636] transition-colors">{t.studio}</button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Language Toggle */}
          <button 
            onClick={onLanguageToggle}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100 text-[#3E3636] font-black text-sm hover:bg-gray-200 transition-all active:scale-90"
            title="Switch Language"
          >
            {lang === Language.ZH ? 'EN' : '简'}
          </button>

          {/* Credits Display */}
          <div 
            onClick={() => onNavClick('pricing')}
            className="flex items-center gap-2 bg-[#AED9E0] px-4 py-2.5 rounded-xl cursor-pointer hover:shadow-md transition-all active:scale-95"
          >
            <span className="text-[#3E3636] font-black text-xl leading-none">{credits.toFixed(0)}</span>
            <span className="text-[10px] font-black text-[#3E3636]/60 uppercase tracking-tighter">Pts</span>
          </div>
          
          {/* Main CTA */}
          <button 
            onClick={onTryNow}
            className="hidden sm:block px-6 py-3 bg-[#3E3636] text-white text-base font-bold rounded-xl hover:shadow-lg active:scale-95 transition-all"
          >
            {t.start}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
