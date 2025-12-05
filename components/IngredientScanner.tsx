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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      );
    case BikeType.CRUISER:
    case BikeType.BOBBER:
      return (
        <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1v-1m-4 6h10M12 12h10" />
        </svg>
      );
    case BikeType.SCOOTER:
    case BikeType.COMMUTER:
      return (
        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case BikeType.SPORTS:
    case BikeType.CAFE_RACER:
    default:
      return (
        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
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
    <div className="w-full max-w-5xl mx-auto">
      <div className="glass-panel rounded-3xl p-1 shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative transition-all duration-500 hover:shadow-[0_30px_60px_rgba(37,99,235,0.1)] border border-white/10 backdrop-blur-3xl">
        <div className="bg-slate-950/40 rounded-[22px] p-8 sm:p-12 relative overflow-hidden">
          
          {/* Decorative Grid Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50"></div>

          {/* Header Section */}
          <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-900/50 to-slate-900 rounded-2xl border border-blue-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white font-['Exo_2'] tracking-wide">
                   {labels.findYourRide}
                </h2>
                <p className="text-slate-400 text-sm mt-1">Configure your parameters</p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-12 gap-y-10 relative z-10">
            
            {/* Left Column: Basic Prefs */}
            <div className="lg:col-span-7 space-y-10">
              
              {/* Budget Slider */}
              <div className="space-y-4 group">
                <div className="flex justify-between items-end">
                   <label className="text-slate-400 text-xs font-bold uppercase tracking-[0.15em] font-tech text-blue-400 glow">{labels.budget}</label>
                   <div className="text-2xl font-black text-white font-['Exo_2'] tracking-tight">
                     ₹ {budget} <span className="text-sm font-normal text-slate-500">Lakh</span>
                   </div>
                </div>
                <div className="relative h-12 flex items-center">
                   {/* Custom Track Background */}
                   <div className="absolute w-full h-3 bg-slate-900 rounded-full border border-slate-700 overflow-hidden shadow-inner">
                      <div className="absolute h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300" style={{width: `${(budget/15)*100}%`}}></div>
                      {/* Tick Marks */}
                      <div className="absolute inset-0 w-full h-full flex justify-between px-2">
                         {[...Array(15)].map((_, i) => <div key={i} className="w-[1px] h-full bg-slate-950/30"></div>)}
                      </div>
                   </div>
                   <input 
                    type="range" 
                    min="0.5" 
                    max="15" 
                    step="0.1" 
                    value={budget} 
                    onChange={(e) => setBudget(parseFloat(e.target.value))}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {/* Thumb Visual */}
                  <div 
                    className="absolute h-6 w-6 bg-white rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)] border-4 border-slate-900 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-150"
                    style={{left: `calc(${(budget/15)*100}% - 12px)`}}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">
                  <span>₹0.5 L</span>
                  <span>₹15.0 L</span>
                </div>
              </div>

              {/* State Selector */}
              <div className="space-y-3">
                <label className="text-slate-400 text-xs font-bold uppercase tracking-[0.15em] font-tech group-hover:text-blue-400 transition-colors">{labels.location}</label>
                <div className="relative group">
                  <select 
                    value={state}
                    onChange={(e) => setState(e.target.value as IndianState)}
                    className="w-full bg-slate-900 text-white text-sm font-medium rounded-xl px-4 py-4 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-800 shadow-lg"
                  >
                    {Object.values(IndianState).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-blue-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Bike Type - Custom Dropdown */}
              <div className="space-y-3" ref={dropdownRef}>
                <label className="text-slate-400 text-xs font-bold uppercase tracking-[0.15em] font-tech">{labels.category}</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                    className={`w-full bg-slate-900 hover:bg-slate-800 text-white text-left rounded-xl px-4 py-3 border transition-all flex items-center justify-between shadow-lg ${isTypeDropdownOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-700 hover:border-blue-500/50'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700 shadow-inner">
                        {getBikeIcon(type)}
                      </div>
                      <span className="font-bold tracking-wide text-lg">{type}</span>
                    </div>
                    <svg 
                      className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isTypeDropdownOpen ? 'rotate-180 text-blue-500' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isTypeDropdownOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-slate-950/95 border border-slate-700 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] max-h-72 overflow-y-auto custom-scrollbar backdrop-blur-xl animate-fadeIn origin-top p-1">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                          {Object.values(BikeType).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => {
                                setType(t);
                                setIsTypeDropdownOpen(false);
                              }}
                              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all group ${
                                type === t 
                                  ? 'bg-blue-600/20 border border-blue-500/50 text-white' 
                                  : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
                              }`}
                            >
                              <div className={`transition-colors ${type === t ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-300'}`}>
                                {getBikeIcon(t)}
                              </div>
                              {t}
                            </button>
                          ))}
                       </div>
                    </div>
                  )}
                </div>
              </div>

               {/* Daily Usage */}
              <div className="space-y-4 group">
                <div className="flex justify-between items-end">
                   <label className="text-slate-400 text-xs font-bold uppercase tracking-[0.15em] font-tech group-hover:text-blue-400 transition-colors">{labels.dailyUsage}</label>
                   <div className="text-xl font-bold text-white font-['Exo_2']">{usage} <span className="text-sm font-normal text-slate-500">km/day</span></div>
                </div>
                <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                   <div className="absolute h-full bg-emerald-500 rounded-full transition-all duration-300" style={{width: `${(usage/150)*100}%`}}></div>
                   <input 
                    type="range" 
                    min="5" 
                    max="150" 
                    step="5" 
                    value={usage} 
                    onChange={(e) => setUsage(parseInt(e.target.value))}
                    className="absolute w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>
            
            {/* Right Column: Advanced & Stats */}
            <div className="lg:col-span-5 flex flex-col gap-8">
               {/* Rider Profile Section */}
              <div className="bg-slate-900/40 rounded-2xl p-6 border border-slate-800 relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                {/* Tech Background */}
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(63,81,181,0.05)_50%,transparent_75%)] bg-[length:20px_20px]"></div>
                
                <h3 className="text-indigo-400 text-xs font-bold mb-8 flex items-center gap-2 uppercase tracking-[0.15em] font-tech relative z-10">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                  {labels.riderProfile}
                </h3>
                
                <div className="flex gap-8 relative z-10">
                   {/* Human Figure Visualization (Simple Bars representing proportions) */}
                   <div className="w-16 flex flex-col items-center justify-end gap-1 h-32">
                      <div className="w-8 bg-indigo-500/20 rounded-t-lg transition-all duration-300 relative border border-indigo-500/30" style={{height: `${(userHeight/210)*100}%`}}>
                         <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-indigo-300">{userHeight}</div>
                      </div>
                      <div className="w-12 bg-slate-700/50 rounded-sm h-1"></div>
                   </div>

                   <div className="flex-1 space-y-8">
                      {/* Height Slider */}
                      <div className="space-y-2">
                        <label className="text-slate-500 text-[10px] font-bold uppercase tracking-wider flex justify-between">
                          <span>{labels.height} (cm)</span>
                        </label>
                        <input 
                          type="range" 
                          min="140" 
                          max="210" 
                          step="1" 
                          value={userHeight} 
                          onChange={(e) => setUserHeight(parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                        />
                      </div>

                      {/* Weight Slider */}
                      <div className="space-y-2">
                        <label className="text-slate-500 text-[10px] font-bold uppercase tracking-wider flex justify-between">
                          <span>{labels.riderWeight} (kg)</span>
                          <span className="text-indigo-300">{userWeight}</span>
                        </label>
                        <input 
                          type="range" 
                          min="40" 
                          max="140" 
                          step="1" 
                          value={userWeight} 
                          onChange={(e) => setUserWeight(parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                        />
                      </div>
                   </div>
                </div>
              </div>

              {/* Model Year Range */}
              <div className="space-y-3">
                <label className="text-slate-400 text-xs font-bold uppercase tracking-[0.15em] font-tech">{labels.modelYear}</label>
                <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="flex-1">
                     <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">{labels.yearFrom}</div>
                     <select 
                       value={minYear}
                       onChange={(e) => {
                         const val = parseInt(e.target.value);
                         setMinYear(val);
                         if (val > maxYear) setMaxYear(val);
                       }}
                       className="w-full bg-transparent text-white font-bold text-lg border-none focus:ring-0 outline-none cursor-pointer p-0"
                     >
                       {years.map(y => <option key={y} value={y} className="bg-slate-900 text-sm">{y}</option>)}
                     </select>
                  </div>
                  <div className="w-px h-8 bg-slate-700"></div>
                  <div className="flex-1 text-right">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">{labels.yearTo}</div>
                     <select 
                       value={maxYear}
                       onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setMaxYear(val);
                          if (val < minYear) setMinYear(val);
                       }}
                       className="w-full bg-transparent text-white font-bold text-lg border-none focus:ring-0 outline-none cursor-pointer p-0 text-right"
                     >
                       {years.map(y => <option key={y} value={y} className="bg-slate-900 text-sm">{y}</option>)}
                     </select>
                  </div>
                </div>
              </div>
              
              {/* Action Button */}
              <div className="mt-auto pt-4">
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className={`w-full py-5 rounded-xl font-black text-white tracking-[0.2em] transition-all transform flex items-center justify-center gap-4 uppercase text-sm font-tech relative overflow-hidden group sheen-effect
                    ${isAnalyzing 
                      ? 'bg-slate-800 cursor-not-allowed border border-slate-700' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] border border-blue-500/50 hover:border-blue-400'
                    }`}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{labels.analyzing}</span>
                    </>
                  ) : (
                    <>
                      <span>{labels.findBikeBtn}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};