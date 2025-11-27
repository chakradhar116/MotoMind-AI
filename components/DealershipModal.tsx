
import React from 'react';
import { Dealership } from '../types';

interface DealershipModalProps {
  brand: string;
  location: string;
  dealerships: Dealership[];
  textSummary: string;
  onClose: () => void;
  isLoading: boolean;
  labels: any;
}

export const DealershipModal: React.FC<DealershipModalProps> = ({ brand, location, dealerships, textSummary, onClose, isLoading, labels }) => {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[80vh] animate-fadeIn">
        
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 z-10">
          <div>
            <h2 className="text-2xl font-bold text-white font-['Exo_2'] flex items-center gap-2">
              <span className="text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              {isLoading ? labels.locating : `${brand} ${labels.showrooms}`}
            </h2>
            <p className="text-slate-400 text-sm mt-1">Near {location}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 text-sm animate-pulse">{labels.scanning}</p>
            </div>
          ) : (
            <>
              {/* Map Results */}
              {dealerships.length > 0 ? (
                <div className="space-y-4">
                  {dealerships.map((dealer, idx) => (
                    <a 
                      key={idx} 
                      href={dealer.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 rounded-xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-600/10 p-2 rounded-lg text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-200 group-hover:text-white transition-colors text-lg">{dealer.title}</h3>
                            <div className="text-sm text-slate-500 flex items-center gap-1 mt-1 group-hover:text-slate-400">
                               {labels.openMaps} 
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                               </svg>
                            </div>
                          </div>
                        </div>
                        <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                           </svg>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-slate-400">{labels.noListings}</p>
                </div>
              )}

              {/* Text Summary */}
              {textSummary && (
                <div className="mt-6 p-4 bg-slate-900 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-bold uppercase text-blue-400 mb-2 tracking-widest">{labels.assistantNotes}</h4>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{textSummary}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
