
import React, { useState } from 'react';
import { IndianLanguage, ThemeType } from '../types';

interface HeaderProps {
  selectedLanguage: IndianLanguage;
  onLanguageChange: (lang: IndianLanguage) => void;
  selectedTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
  labels?: any;
}

export const Header: React.FC<HeaderProps> = ({ selectedLanguage, onLanguageChange, selectedTheme, onThemeChange, labels }) => {
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  const themeColors = {
    [ThemeType.CYBER]: 'bg-blue-500',
    [ThemeType.RACING]: 'bg-red-500',
    [ThemeType.ECO]: 'bg-emerald-500',
    [ThemeType.ROYAL]: 'bg-yellow-500',
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-slate-950/70 backdrop-blur-2xl border-b border-white/5 shadow-2xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center space-x-4 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-accent blur-lg opacity-40 group-hover:opacity-60 transition-opacity rounded-full"></div>
            <div className="relative w-11 h-11 bg-gradient-to-br from-slate-800 to-black rounded-xl border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
            </div>
          </div>
          
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl font-black text-white tracking-tight font-['Exo_2'] leading-none">
              MOTO<span className="text-accent">MIND</span>
            </h1>
            <span className="text-[10px] text-accent font-tech uppercase tracking-[0.2em] opacity-80 group-hover:opacity-100 transition-opacity">
              AI Configurator
            </span>
          </div>
        </div>
        
        {/* Actions Section */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-white/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-400 font-tech tracking-widest uppercase">Gemini 2.5 Active</span>
          </div>

          {/* Theme Picker */}
          <div className="relative">
             <button 
                onClick={() => setIsThemeOpen(!isThemeOpen)}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/50 hover:bg-slate-800 border border-slate-700 transition-colors"
                title="Change Theme"
             >
                <div className={`w-4 h-4 rounded-full ${themeColors[selectedTheme]} shadow-lg`}></div>
             </button>
             
             {isThemeOpen && (
               <div className="absolute top-full right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl flex flex-col gap-1 w-32 animate-fadeIn backdrop-blur-xl">
                  {Object.values(ThemeType).map(theme => (
                     <button
                        key={theme}
                        onClick={() => {
                          onThemeChange(theme);
                          setIsThemeOpen(false);
                        }}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                          selectedTheme === theme ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                     >
                        <div className={`w-3 h-3 rounded-full ${themeColors[theme]}`}></div>
                        {theme}
                     </button>
                  ))}
               </div>
             )}
          </div>

          <div className="relative group/lang">
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value as IndianLanguage)}
              className="appearance-none bg-slate-900/80 text-slate-300 text-sm font-medium border border-slate-700 rounded-lg pl-4 pr-10 py-2.5 hover:border-accent focus:ring-2 focus:ring-accent/50 outline-none cursor-pointer transition-all shadow-lg min-w-[140px]"
            >
              {Object.values(IndianLanguage).map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform group-hover/lang:rotate-180 duration-300">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
               </svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
