
import React from 'react';
import { Bike } from '../types';

interface ComparisonModalProps {
  bikes: Bike[];
  onClose: () => void;
  onRemove: (bikeId: string) => void;
  labels: any;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({ bikes, onClose, onRemove, labels }) => {
  if (bikes.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-slate-950 w-full max-w-7xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-800 flex flex-col animate-fadeIn overflow-hidden">
        
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md z-10">
          <h2 className="text-2xl font-bold text-white font-['Exo_2'] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {labels.specShowdown}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-auto custom-scrollbar flex-1 p-6 bg-slate-950/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 min-w-[300px]">
            {bikes.map((bike, index) => (
              <div key={bike.id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col relative hover:border-blue-500/30 transition-colors shadow-xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                
                <button 
                  onClick={() => onRemove(bike.id)}
                  className="absolute top-3 right-3 p-1.5 bg-slate-800/80 hover:bg-red-500 text-slate-400 hover:text-white rounded-full transition-all z-10 backdrop-blur-sm border border-slate-700 hover:border-red-400"
                  title={labels.remove}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                <div className="p-6 bg-gradient-to-b from-slate-800/50 to-slate-900 border-b border-slate-800">
                   <div className="text-xs text-blue-400 font-bold uppercase mb-1 tracking-wider">{bike.brand}</div>
                   <h3 className="text-2xl font-bold text-white font-['Exo_2'] leading-tight mb-2">{bike.model}</h3>
                   <div className="text-xl font-semibold text-slate-200">{bike.price}</div>
                </div>

                <div className="p-5 space-y-6 flex-grow">
                  {/* Key Specs */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                      <span className="text-slate-500 text-sm">{labels.engine}</span>
                      <span className="text-white font-medium">{bike.specs.engineCC}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                      <span className="text-slate-500 text-sm">{labels.power}</span>
                      <span className="text-white font-medium">{bike.specs.power}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                      <span className="text-slate-500 text-sm">{labels.mileage}</span>
                      <span className="text-emerald-400 font-bold">{bike.specs.mileage}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                      <span className="text-slate-500 text-sm">{labels.weight}</span>
                      <span className="text-white font-medium">{bike.specs.weight}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                      <span className="text-slate-500 text-sm">{labels.fuelTank}</span>
                      <span className="text-white font-medium">{bike.specs.fuelTank}</span>
                    </div>
                  </div>
                  
                  {/* Pros */}
                  <div className="bg-green-500/5 rounded-lg p-3 border border-green-500/10">
                    <div className="text-xs font-bold text-green-400 mb-2 uppercase tracking-wide">{labels.strengths}</div>
                    <ul className="space-y-1.5">
                      {bike.pros.slice(0, 3).map((p, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span className="leading-tight">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                   {/* Cons */}
                   <div className="bg-red-500/5 rounded-lg p-3 border border-red-500/10">
                    <div className="text-xs font-bold text-red-400 mb-2 uppercase tracking-wide">{labels.tradeoffs}</div>
                    <ul className="space-y-1.5">
                      {bike.cons.slice(0, 2).map((c, i) => (
                         <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                         <span className="text-red-500 mt-0.5">✕</span>
                         <span className="leading-tight">{c}</span>
                       </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                   <div className="text-xs text-center text-slate-500">{labels.compatibilityScore}: <span className="text-white font-bold">{bike.matchScore}%</span></div>
                </div>
              </div>
            ))}
            
            {/* Add placeholder slots if less than 3 selected */}
            {[...Array(3 - bikes.length)].map((_, i) => (
               <div key={`empty-${i}`} className="hidden md:flex rounded-xl border-2 border-dashed border-slate-800 flex-col items-center justify-center p-8 opacity-50">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                    <span className="text-slate-600 text-xl font-bold">?</span>
                  </div>
                  <p className="text-slate-500 text-sm text-center">{labels.selectToCompare}</p>
               </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
