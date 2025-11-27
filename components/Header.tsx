
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
    <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-blue-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20 skew-x-[-10deg]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white transform skew-x-[10deg]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 tracking-tight font-['Exo_2']">
            MotoMind AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Motion Studio Button */}
          <button
            onClick={onOpenMotionStudio}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all transform hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
            <span>{labels?.motionStudio || "Motion Studio"}</span>
          </button>

          <div className="relative group">
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value as IndianLanguage)}
              className="appearance-none bg-slate-900 text-slate-300 text-sm border border-slate-700 rounded-full pl-4 pr-8 py-1.5 hover:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer transition-all"
            >
              {Object.values(IndianLanguage).map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
               </svg>
            </div>
          </div>
          
          <div className="hidden md:block text-slate-500 text-sm border-l border-slate-800 pl-4">
            Gemini 2.5
          </div>
        </div>
      </div>
    </header>
  );
};
