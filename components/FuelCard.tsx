
import React from 'react';
import { FuelPrices } from '../types';

interface FuelCardProps {
  fuelPrices: FuelPrices | null;
  loading: boolean;
  labels: any;
  stateName: string;
}

export const FuelCard: React.FC<FuelCardProps> = ({ fuelPrices, loading, labels, stateName }) => {
  if (!stateName) return null;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 mb-8 backdrop-blur-sm shadow-lg relative overflow-hidden animate-fadeIn">
       {/* Background pulse or glow */}
       <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-orange-500/10 rounded-full blur-xl pointer-events-none"></div>

       <h3 className="text-orange-400 font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 3.414L15.586 7H18a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 5a1 1 0 100-2 1 1 0 000 2zm6.5-3.414V6h-2.5v.586l2.5-1.172zM5 16h10V8H5v8zm10-8h-2v2h2V8z" clipRule="evenodd" />
          </svg>
          {labels.fuelWatch}: {stateName}
       </h3>

       {loading ? (
          <div className="flex items-center gap-3 text-slate-400 text-sm">
             <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
             {labels.fetchingFuel}
          </div>
       ) : fuelPrices ? (
          <div className="relative z-10">
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                   <div className="text-xs text-slate-500 uppercase font-bold mb-1">{labels.petrolPrice}</div>
                   <div className="text-xl font-bold text-white">{fuelPrices.petrol}</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                   <div className="text-xs text-slate-500 uppercase font-bold mb-1">{labels.dieselPrice}</div>
                   <div className="text-xl font-bold text-white">{fuelPrices.diesel}</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                   <div className="text-xs text-slate-500 uppercase font-bold mb-1">{labels.evPrice}</div>
                   <div className="text-xl font-bold text-emerald-400">{fuelPrices.ev}</div>
                </div>
             </div>
             
             <div className="text-sm text-slate-400 italic border-l-2 border-orange-500/50 pl-3 mb-3">
                "{fuelPrices.trend}"
             </div>

             {fuelPrices.sources.length > 0 && (
                <div className="text-[10px] text-slate-600 flex flex-wrap gap-2 items-center">
                   <span>Sources:</span>
                   {fuelPrices.sources.map((s, i) => (
                      <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="hover:text-blue-400 underline truncate max-w-[150px]">
                         {s.title}
                      </a>
                   ))}
                </div>
             )}
          </div>
       ) : (
          <div className="text-slate-500 text-sm">Fuel data unavailable.</div>
       )}
    </div>
  );
};
