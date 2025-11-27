
import React, { useState, useRef, useEffect } from 'react';
import { BikeType, IndianState, BikePreference, IndianLanguage } from '../types';

interface BikeFormProps {
  onSearch: (prefs: BikePreference) => void;
  isAnalyzing: boolean;
  labels: any;
  currentLanguage: IndianLanguage;
}

// Helper to get icon for bike type
const getBikeIcon = (type: string) => {
  switch (type) {
    case BikeType.EV:
      return (
        <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case BikeType.ADVENTURE:
    case BikeType.TOURER:
    case BikeType.SPORTS_TOURING:
      return (
        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case BikeType.CRUISER:
    case BikeType.BOBBER:
      return (
        <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case BikeType.SCOOTER:
    case BikeType.COMMUTER:
      return (
        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      );
    case BikeType.SPORTS:
    case BikeType.CAFE_RACER:
    default:
      return (
        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
  }
};

export const BikePreferenceForm: React.FC<BikeFormProps> = ({ onSearch, isAnalyzing, labels, currentLanguage }) => {
  const [budget, setBudget] = useState<number>(2.5);
  const [type, setType] = useState<BikeType>(BikeType.COMMUTER);
  const [state, setState] = useState<IndianState>(IndianState.DELHI);
  const [usage, setUsage] = useState<number>(30);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Year Range State
  const currentYear = new Date().getFullYear();
  const [minYear, setMinYear] = useState<number>(currentYear - 2);
  const [maxYear, setMaxYear] = useState<number>(currentYear + 1);
  const years = Array.from({ length: 15 }, (_, i) => currentYear + 1 - i);

  // User Stats (Ergonomics)
  const [userHeight, setUserHeight] = useState<number>(170); // cm
  const [userWeight, setUserWeight] = useState<number>(70); // kg

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      budget,
      type,
      state,
      dailyUsageKm: usage,
      language: currentLanguage,
      minYear,
      maxYear,
      userHeight,
      userWeight
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-blue-900/20 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-white mb-6 font-['Exo_2'] flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          {labels.findYourRide}
        </h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Budget Slider */}
          <div className="space-y-3">
            <label className="text-slate-400 text-sm font-medium flex justify-between">
              <span>{labels.budget}</span>
              <span className="text-blue-400 font-bold">₹ {budget} Lakh</span>
            </label>
            <input 
              type="range" 
              min="0.5" 
              max="15" 
              step="0.1" 
              value={budget} 
              onChange={(e) => setBudget(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-600">
              <span>₹50k</span>
              <span>₹15L+</span>
            </div>
          </div>

          {/* State Selector */}
          <div className="space-y-3">
            <label className="text-slate-400 text-sm font-medium">{labels.location}</label>
            <div className="relative">
              <select 
                value={state}
                onChange={(e) => setState(e.target.value as IndianState)}
                className="w-full bg-slate-800 text-white text-sm rounded-xl px-4 py-3 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
              >
                {Object.values(IndianState).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Bike Type - Custom Dropdown */}
          <div className="space-y-3 md:col-span-2" ref={dropdownRef}>
            <label className="text-slate-400 text-sm font-medium">{labels.category}</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                className="w-full bg-slate-800 hover:bg-slate-750 text-white text-left rounded-xl px-4 py-3 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-slate-700/50 rounded-lg">
                    {getBikeIcon(type)}
                  </div>
                  <span className="font-medium">{type}</span>
                </div>
                <svg 
                  className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isTypeDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isTypeDropdownOpen && (
                <div className="absolute z-50 mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-72 overflow-y-auto custom-scrollbar backdrop-blur-xl animate-fadeIn">
                   <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {Object.values(BikeType).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setType(t);
                            setIsTypeDropdownOpen(false);
                          }}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            type === t 
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white hover:pl-4'
                          }`}
                        >
                          <div className={`${type === t ? 'text-white' : 'text-slate-400'}`}>
                            {getBikeIcon(t)}
                          </div>
                          {t}
                          {type === t && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-auto text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      ))}
                   </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Rider Profile Section */}
          <div className="md:col-span-2 border-t border-slate-800 pt-6 mt-2">
            <h3 className="text-white text-md font-bold mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              {labels.riderProfile}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Height Slider */}
              <div className="space-y-3">
                <label className="text-slate-400 text-sm font-medium flex justify-between">
                  <span>{labels.height}</span>
                  <span className="text-indigo-400 font-bold">{userHeight} cm</span>
                </label>
                <input 
                  type="range" 
                  min="140" 
                  max="210" 
                  step="1" 
                  value={userHeight} 
                  onChange={(e) => setUserHeight(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-slate-600">
                  <span>140cm</span>
                  <span>210cm</span>
                </div>
              </div>

              {/* Weight Slider */}
              <div className="space-y-3">
                <label className="text-slate-400 text-sm font-medium flex justify-between">
                  <span>{labels.riderWeight}</span>
                  <span className="text-indigo-400 font-bold">{userWeight} kg</span>
                </label>
                <input 
                  type="range" 
                  min="40" 
                  max="140" 
                  step="1" 
                  value={userWeight} 
                  onChange={(e) => setUserWeight(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-slate-600">
                  <span>40kg</span>
                  <span>140kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Model Year Range */}
          <div className="space-y-3 md:col-span-2">
            <label className="text-slate-400 text-sm font-medium">{labels.modelYear}</label>
            <div className="flex gap-4">
              <div className="flex-1 relative group">
                 <label className="absolute -top-2 left-3 bg-slate-900 px-1 text-[10px] text-slate-500 group-focus-within:text-blue-500 transition-colors">{labels.yearFrom}</label>
                 <select 
                   value={minYear}
                   onChange={(e) => {
                     const val = parseInt(e.target.value);
                     setMinYear(val);
                     if (val > maxYear) setMaxYear(val);
                   }}
                   className="w-full bg-slate-800 text-white text-sm rounded-xl px-4 py-3 border border-slate-700 focus:border-blue-500 outline-none appearance-none cursor-pointer"
                 >
                   {years.map(y => <option key={y} value={y}>{y}</option>)}
                 </select>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                 </div>
              </div>
              <div className="flex-1 relative group">
                <label className="absolute -top-2 left-3 bg-slate-900 px-1 text-[10px] text-slate-500 group-focus-within:text-blue-500 transition-colors">{labels.yearTo}</label>
                 <select 
                   value={maxYear}
                   onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setMaxYear(val);
                      if (val < minYear) setMinYear(val);
                   }}
                   className="w-full bg-slate-800 text-white text-sm rounded-xl px-4 py-3 border border-slate-700 focus:border-blue-500 outline-none appearance-none cursor-pointer"
                 >
                   {years.map(y => <option key={y} value={y}>{y}</option>)}
                 </select>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                 </div>
              </div>
            </div>
          </div>

          {/* Daily Usage */}
          <div className="space-y-3 md:col-span-2">
            <label className="text-slate-400 text-sm font-medium">{labels.dailyUsage}: <span className="text-white">{usage} km</span></label>
             <input 
              type="range" 
              min="5" 
              max="150" 
              step="5" 
              value={usage} 
              onChange={(e) => setUsage(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-slate-600">
              <span>5km</span>
              <span>150km+</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isAnalyzing}
            className={`md:col-span-2 w-full py-4 rounded-xl font-bold text-white tracking-wide transition-all transform flex items-center justify-center gap-3 uppercase text-sm
              ${isAnalyzing 
                ? 'bg-slate-800 cursor-not-allowed opacity-50 border border-slate-700' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-600/20 hover:scale-[1.01]'
              }`}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{labels.analyzing}</span>
              </>
            ) : (
              <>
                <span>{labels.findBikeBtn}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
