import React from 'react';
import { IndianLanguage } from '../types';

interface HeaderProps {
  selectedLanguage: IndianLanguage;
  onLanguageChange: (lang: IndianLanguage) => void;
  onOpenMotionStudio: () => void;
  labels?: any;
}

export const Header: React.FC<HeaderProps> = ({ selectedLanguage, onLanguageChange, onOpenMotionStudio, labels }) => {
  return (
    <header className="fixed top-0 w-full z-50 bg-slate-950/60 backdrop-blur-xl border-b border-white/5 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)] transform group-hover:rotate-6 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white tracking-tight font-['Exo_2'] group-hover:text-blue-400 transition-colors">
              MotoMind<span className="text-blue-500">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 font-tech uppercase tracking-widest leading-none">Smart Recommender</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Motion Studio Button */}
          <button
            onClick={onOpenMotionStudio}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-purple-500/30 text-purple-300 text-sm font-bold hover:bg-purple-600 hover:text-white hover:border-purple-500 hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all transform hover:-translate-y-0.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
            <span className="font-tech tracking-wide">{labels?.motionStudio || "Motion Studio"}</span>
          </button>

          <div className="relative group">
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value as IndianLanguage)}
              className="appearance-none bg-slate-900/80 text-slate-300 text-sm border border-slate-700 rounded-lg pl-4 pr-10 py-2 hover:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none cursor-pointer transition-all shadow-inner"
            >
              {Object.values(IndianLanguage).map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
               </svg>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="px-3 py-1 rounded border border-blue-500/20 bg-blue-500/10 text-xs font-tech text-blue-400 tracking-wider">
              GEMINI 2.5
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};