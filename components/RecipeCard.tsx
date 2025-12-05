import React, { useState } from 'react';
import { Bike, BikeCustomization } from '../types';
import { generateBikeImage } from '../services/geminiService';

interface BikeCardProps {
  bike: Bike;
  onClick: () => void;
  onToggleCompare: (bike: Bike) => void;
  onLocateDealers: (bike: Bike) => void;
  isComparing: boolean;
  isLocating: boolean;
  labels: any;
}

const COLORS = [
  { id: 'Red', labelKey: 'colorRed', hex: '#ef4444' },
  { id: 'Blue', labelKey: 'colorBlue', hex: '#3b82f6' },
  { id: 'Black', labelKey: 'colorBlack', hex: '#1e293b' },
  { id: 'Green', labelKey: 'colorGreen', hex: '#22c55e' },
  { id: 'White', labelKey: 'colorWhite', hex: '#f8fafc' },
  { id: 'Silver', labelKey: 'colorSilver', hex: '#94a3b8' },
];

const ACCESSORIES = [
  { id: 'Panniers', labelKey: 'accPanniers' },
  { id: 'Crash Guard', labelKey: 'accCrashGuard' },
  { id: 'High Windshield', labelKey: 'accWindshield' },
  { id: 'Custom Exhaust', labelKey: 'accExhaust' },
];

export const BikeCard: React.FC<BikeCardProps> = ({ bike, onClick, onToggleCompare, onLocateDealers, isComparing, isLocating, labels }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentImage, setCurrentImage] = useState(bike.imageUrl);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  // Customization State
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [activeCustomTab, setActiveCustomTab] = useState<'paint' | 'accessories'>('paint');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  
  // Quick View State
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const matchScoreColor = bike.matchScore >= 90 ? 'text-green-400' : bike.matchScore >= 75 ? 'text-blue-400' : 'text-yellow-400';

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleCompare(bike);
  };

  const handleLocateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLocating) {
      onLocateDealers(bike);
    }
  };

  const toggleExpansion = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const toggleCustomization = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCustomizing(!isCustomizing);
  };
  
  const toggleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsQuickViewOpen(!isQuickViewOpen);
  };

  const toggleAccessory = (accId: string) => {
    if (selectedAccessories.includes(accId)) {
      setSelectedAccessories(prev => prev.filter(a => a !== accId));
    } else {
      setSelectedAccessories(prev => [...prev, accId]);
    }
  };

  const handleGenerateImage = async (e?: React.MouseEvent) => {
    if(e) e.stopPropagation();
    if (isGeneratingImage) return;

    setIsGeneratingImage(true);
    setIsCustomizing(false); // Close menu while generating

    const customization: BikeCustomization = {
      color: selectedColor || '',
      accessories: selectedAccessories
    };

    const generatedUrl = await generateBikeImage(bike, "India", customization);
    
    if (generatedUrl) {
      setCurrentImage(generatedUrl);
    }
    setIsGeneratingImage(false);
  };

  // Helper for stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-0.5">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i}
            className={`w-3 h-3 ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'}`}
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        ))}
        <span className="text-xs text-slate-500 ml-1 font-medium font-tech">({rating})</span>
      </div>
    );
  };

  // Helper for Ergonomic Verdict Color
  const getVerdictColor = (score: number) => {
    if (score >= 90) return 'bg-green-500/10 text-green-400 border-green-500/30';
    if (score >= 70) return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
  };

  return (
    <div 
      onClick={onClick}
      className={`glass-card rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ease-out group relative flex flex-col h-full hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] hover:border-blue-500/40 hover:-translate-y-2 ${isComparing ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900' : ''}`}
    >
      {/* Comparison Toggle */}
      <div className="absolute top-4 right-4 z-30 flex gap-2">
        <button
          onClick={handleLocateClick}
          disabled={isLocating}
          className={`flex items-center justify-center w-8 h-8 rounded-full backdrop-blur-md border transition-all duration-300 shadow-lg ${
            isLocating 
              ? 'bg-slate-800 border-slate-700 cursor-not-allowed' 
              : 'bg-black/40 hover:bg-blue-600 border-white/10 hover:border-blue-500 text-slate-300 hover:text-white'
          }`}
          title={labels.locateDealers}
        >
          {isLocating ? (
            <svg className="animate-spin h-4 w-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>

        <button
          onClick={handleCompareClick}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border transition-all duration-300 shadow-lg ${
            isComparing 
              ? 'bg-blue-600 border-blue-500 text-white' 
              : 'bg-black/40 border-white/10 text-slate-300 hover:bg-slate-800 hover:border-blue-500/50 hover:text-white'
          }`}
        >
          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isComparing ? 'border-white bg-white/20' : 'border-slate-400'}`}>
            {isComparing && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
          </div>
          <span className="text-xs font-bold tracking-wide font-tech uppercase">{labels.compare}</span>
        </button>
      </div>

      {/* Visualize / Customize Button */}
      <div className="absolute top-4 left-4 z-30">
        <button
          onClick={toggleCustomization}
          disabled={isGeneratingImage}
          className="group/btn flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 hover:bg-blue-600 backdrop-blur-md border border-white/10 hover:border-blue-500 text-slate-300 hover:text-white transition-all duration-300 shadow-lg"
        >
          {isGeneratingImage ? (
            <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          )}
          <span className="text-xs font-bold tracking-wide font-tech uppercase">
             {isGeneratingImage ? labels.painting : labels.visualize}
          </span>
        </button>
      </div>

      {/* Image Header Container */}
      <div className="h-56 relative overflow-hidden">
        
        {/* Main Image */}
        <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url(${currentImage})` }}
        >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/20"></div>
        </div>
        
        {/* Quick View Trigger - Center of Image */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
           <button
             onClick={toggleQuickView}
             className="pointer-events-auto transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 bg-slate-900/50 hover:bg-blue-600 backdrop-blur-sm border border-white/20 text-white rounded-full p-3 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
             title={labels.quickView || "Quick View"}
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
             </svg>
           </button>
        </div>
        
        {/* Customization Menu Overlay - Refined with Tabs */}
        {isCustomizing && (
           <div 
             className="absolute inset-x-0 bottom-0 top-0 bg-slate-950/90 backdrop-blur-xl z-40 p-5 flex flex-col animate-slideUp border-t border-slate-700 shadow-2xl"
             onClick={(e) => e.stopPropagation()}
           >
             <div className="flex justify-between items-center mb-4">
                <h4 className="text-white font-bold text-sm uppercase tracking-wide flex items-center gap-2 font-tech">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                  </svg>
                  {labels.customize}
                </h4>
                <button onClick={toggleCustomization} className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
             </div>

             {/* Segmented Control Tabs */}
             <div className="flex p-1 bg-slate-800 rounded-lg mb-4 relative">
               <button 
                 onClick={() => setActiveCustomTab('paint')}
                 className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-all duration-300 z-10 ${
                   activeCustomTab === 'paint' 
                     ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                     : 'text-slate-400 hover:text-slate-200'
                 }`}
               >
                 {labels.paint}
               </button>
               <button 
                 onClick={() => setActiveCustomTab('accessories')}
                 className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-all duration-300 z-10 ${
                   activeCustomTab === 'accessories' 
                     ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                     : 'text-slate-400 hover:text-slate-200'
                 }`}
               >
                 {labels.accessories}
               </button>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
               {activeCustomTab === 'paint' && (
                 <div className="animate-fadeIn">
                   <div className="grid grid-cols-4 gap-4 place-items-center py-2">
                     {COLORS.map(c => (
                       <button
                         key={c.id}
                         onClick={() => setSelectedColor(c.id === selectedColor ? null : c.id)}
                         className={`w-10 h-10 rounded-full transition-all duration-300 transform relative ${
                           selectedColor === c.id 
                             ? 'scale-110 ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900' 
                             : 'hover:scale-110 hover:shadow-lg'
                         }`}
                         style={{ backgroundColor: c.hex }}
                         title={labels[c.labelKey] || c.id}
                       >
                         {selectedColor === c.id && (
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/80 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" viewBox="0 0 20 20" fill="currentColor">
                             <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                           </svg>
                         )}
                       </button>
                     ))}
                   </div>
                   <p className="text-[10px] text-slate-500 text-center mt-6">
                     Select a finish to visualize the {bike.model}
                   </p>
                 </div>
               )}

               {activeCustomTab === 'accessories' && (
                 <div className="animate-fadeIn space-y-2">
                    {ACCESSORIES.map(acc => {
                      const isSelected = selectedAccessories.includes(acc.id);
                      return (
                        <button
                          key={acc.id}
                          onClick={() => toggleAccessory(acc.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                            isSelected
                              ? 'bg-blue-600/10 border-blue-500/50 text-white shadow-sm'
                              : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span className="text-xs font-bold uppercase tracking-wide">{labels[acc.labelKey] || acc.id}</span>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-600 bg-slate-900'
                          }`}>
                            {isSelected && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </button>
                      );
                    })}
                 </div>
               )}
             </div>

             <button 
               onClick={(e) => handleGenerateImage(e)}
               className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl uppercase tracking-wide shadow-lg shadow-blue-600/20 transition-all mt-4 flex items-center justify-center gap-2 transform active:scale-95"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
               </svg>
               {labels.apply}
             </button>
           </div>
        )}
        
        {/* Quick View Overlay */}
        {isQuickViewOpen && (
        <div 
          className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-50 p-6 flex flex-col animate-fadeIn"
          onClick={(e) => e.stopPropagation()} 
        >
          <div className="flex justify-between items-start mb-4">
             <h3 className="text-xl font-bold text-white font-['Exo_2']">{bike.model}</h3>
             <button onClick={toggleQuickView} className="text-slate-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
             </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
             <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                   <div className="text-[10px] text-slate-500 uppercase font-bold">{labels.engine}</div>
                   <div className="text-white font-medium">{bike.specs.engineCC}</div>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                   <div className="text-[10px] text-slate-500 uppercase font-bold">{labels.power}</div>
                   <div className="text-white font-medium">{bike.specs.power}</div>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                   <div className="text-[10px] text-slate-500 uppercase font-bold">{labels.mileage}</div>
                   <div className="text-emerald-400 font-medium">{bike.specs.mileage}</div>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                   <div className="text-[10px] text-slate-500 uppercase font-bold">{labels.weight}</div>
                   <div className="text-white font-medium">{bike.specs.weight}</div>
                </div>
                 <div className="bg-slate-900 p-2 rounded border border-slate-800 col-span-2">
                   <div className="text-[10px] text-slate-500 uppercase font-bold">{labels.fuelTank}</div>
                   <div className="text-white font-medium">{bike.specs.fuelTank}</div>
                </div>
             </div>
             
             <div>
               <div className="text-xs font-bold text-slate-500 uppercase mb-2">{labels.strengths}</div>
               <ul className="space-y-1">
                 {bike.pros.slice(0, 3).map((pro, i) => (
                   <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      {pro}
                   </li>
                 ))}
               </ul>
             </div>
          </div>
          
           <button 
             onClick={onClick}
             className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors text-sm uppercase tracking-wide"
           >
             {labels.viewDetails || "View Full Details"}
           </button>
        </div>
        )}

        <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-md border border-white/10 group-hover:bg-blue-600/80 group-hover:border-blue-500/50 transition-all duration-300 z-10">
          <span className="text-xs font-bold tracking-widest uppercase text-white shadow-sm font-tech">{bike.brand}</span>
        </div>

        <div className="absolute bottom-4 right-4 text-right z-10 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/10">
            <div className="text-lg font-bold text-white tracking-tight">{bike.price}</div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow relative z-10 bg-slate-900/50 transition-colors duration-300 group-hover:bg-slate-900/80 border-t border-white/5">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300 font-['Exo_2']">
            {bike.model}
          </h3>
          <div className={`text-xs font-bold ${matchScoreColor} bg-slate-900 border border-slate-700 px-2 py-1 rounded shadow-sm group-hover:border-slate-600 transition-colors`}>
            {bike.matchScore}%
          </div>
        </div>
        
        <div className="mb-4 flex items-center justify-between">
          {renderStars(bike.rating || 4.0)}
          
          {/* Fit Badge if available */}
          {bike.ergonomics && (
            <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border tracking-wider font-tech ${getVerdictColor(bike.ergonomics.fitScore)}`}>
               {bike.ergonomics.fitScore > 80 ? 'Great Fit' : 'Fit Check'}
            </div>
          )}
        </div>
        
        <p className="text-slate-400 text-sm line-clamp-2 mb-6 flex-grow leading-relaxed group-hover:text-slate-300 transition-colors font-light">
          {bike.description}
        </p>
        
        {/* Specs Grid */}
        <div className="grid grid-cols-3 gap-2 border-t border-slate-800 pt-4 group-hover:border-slate-700 transition-colors">
          <div className="text-center p-2 rounded bg-slate-800/40 group-hover:bg-slate-800/80 transition-colors duration-300">
            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 font-tech">{labels.engine}</div>
            <div className="text-slate-200 font-semibold text-sm">{bike.specs.engineCC}</div>
          </div>
          <div className="text-center p-2 rounded bg-slate-800/40 group-hover:bg-slate-800/80 transition-colors duration-300">
            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 font-tech">{labels.mileage}</div>
            <div className="text-emerald-400 font-semibold text-sm">{bike.specs.mileage}</div>
          </div>
          <div className="text-center p-2 rounded bg-slate-800/40 group-hover:bg-slate-800/80 transition-colors duration-300">
            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 font-tech">{labels.power}</div>
            <div className="text-slate-200 font-semibold text-sm">{bike.specs.power}</div>
          </div>
        </div>
        
        {/* Match Analysis Section (Collapsible) */}
        <div className="mt-4 pt-4 border-t border-slate-800 group-hover:border-slate-700 transition-colors">
          <button 
            onClick={toggleExpansion}
            className="flex items-center justify-between w-full text-xs font-bold text-slate-500 group-hover:text-blue-400 transition-colors uppercase tracking-wide font-tech"
          >
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {labels.matchAnalysis}
            </span>
            <svg 
              className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Expanded Content */}
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-48 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}
          >
             <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 space-y-3">
                <div>
                  <div className="text-[10px] uppercase text-slate-400 font-bold mb-1 font-tech">{labels.regionalFit}</div>
                  <p className="text-xs text-slate-200 italic leading-relaxed">"{bike.stateFitReason}"</p>
                </div>
                <div>
                   <div className="flex justify-between items-end mb-1">
                      <div className="text-[10px] uppercase text-slate-400 font-bold font-tech">{labels.compatibilityScore}</div>
                      <div className={`text-xs font-bold ${matchScoreColor}`}>{bike.matchScore}/100</div>
                   </div>
                   <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          bike.matchScore >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 
                          bike.matchScore >= 75 ? 'bg-gradient-to-r from-blue-500 to-indigo-400' : 
                          'bg-gradient-to-r from-yellow-500 to-orange-400'
                        }`} 
                        style={{width: `${bike.matchScore}%`}}
                      ></div>
                   </div>
                </div>
             </div>
          </div>

          {!isExpanded && (
             <div className="mt-2 text-xs text-slate-500 line-clamp-1 italic">
                "{bike.stateFitReason}"
             </div>
          )}
        </div>
      </div>
    </div>
  );
};