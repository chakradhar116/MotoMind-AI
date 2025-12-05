
import React, { useState, useRef } from 'react';
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
  { id: 'Black', labelKey: 'colorBlack', hex: '#0f172a' },
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

  // Tilt State
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const matchScoreColor = bike.matchScore >= 90 ? 'text-green-400' : bike.matchScore >= 75 ? 'text-blue-400' : 'text-yellow-400';
  const matchScoreBg = bike.matchScore >= 90 ? 'bg-green-500/20' : bike.matchScore >= 75 ? 'bg-blue-500/20' : 'bg-yellow-500/20';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation (-10 to 10 degrees)
    const xPct = (x / rect.width - 0.5) * 20; 
    const yPct = (y / rect.height - 0.5) * -20;
    
    setRotation({ x: yPct, y: xPct });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

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
    setIsCustomizing(false); 

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
        <span className="text-xs text-slate-500 ml-1 font-bold font-tech">({rating})</span>
      </div>
    );
  };

  // Helper for Ergonomic Verdict Badge
  const getVerdictStyle = (score: number) => {
    if (score >= 90) return { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30' };
    if (score >= 70) return { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' };
    return { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/30' };
  };

  const verdictStyle = bike.ergonomics ? getVerdictStyle(bike.ergonomics.fitScore) : null;

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
      }}
      className={`glass-card rounded-2xl overflow-hidden cursor-pointer group relative flex flex-col h-full hover:shadow-2xl duration-200 ease-out border border-white/5 ${isComparing ? 'ring-2 ring-accent ring-offset-2 ring-offset-slate-900' : ''}`}
    >
      {/* Sheen overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 mix-blend-overlay"></div>

      {/* Top Actions */}
      <div className="absolute top-4 right-4 z-30 flex gap-2">
        <button
          onClick={handleLocateClick}
          disabled={isLocating}
          className={`flex items-center justify-center w-8 h-8 rounded-full backdrop-blur-md border transition-all duration-300 shadow-lg ${
            isLocating 
              ? 'bg-slate-800 border-slate-700 cursor-not-allowed' 
              : 'bg-black/50 hover:bg-accent border-white/10 hover:border-accent text-slate-300 hover:text-white'
          }`}
          title={labels.locateDealers}
        >
          {isLocating ? (
            <svg className="animate-spin h-4 w-4 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
              ? 'bg-accent border-accent text-white' 
              : 'bg-black/50 border-white/10 text-slate-300 hover:bg-slate-800 hover:border-accent/50 hover:text-white'
          }`}
        >
          <div className={`w-3 h-3 rounded-sm border flex items-center justify-center transition-colors ${isComparing ? 'border-white bg-white/20' : 'border-slate-400'}`}>
            {isComparing && <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
          </div>
          <span className="text-[10px] font-bold tracking-widest font-tech uppercase">{labels.compare}</span>
        </button>
      </div>

      {/* Real Photo Button */}
      <div className="absolute top-4 left-4 z-30">
        <button
          onClick={toggleCustomization}
          disabled={isGeneratingImage}
          className="group/btn flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 hover:bg-accent backdrop-blur-md border border-white/10 hover:border-accent text-slate-300 hover:text-white transition-all duration-300 shadow-lg"
        >
          {isGeneratingImage ? (
            <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
          <span className="text-[10px] font-bold tracking-widest font-tech uppercase">
             {isGeneratingImage ? "RENDERING..." : "REAL PHOTO"}
          </span>
        </button>
      </div>

      {/* Image Container */}
      <div className="h-64 relative overflow-hidden bg-slate-900">
        <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${currentImage})`, transform: `translateX(${rotation.y * 0.5}px)` }}
        >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30"></div>
        </div>
        
        {/* Quick View */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
           <button
             onClick={toggleQuickView}
             className="pointer-events-auto transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 bg-slate-950/80 hover:bg-accent backdrop-blur-md border border-white/20 text-white rounded-full p-4 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
             </svg>
           </button>
        </div>
        
        {/* Customization Overlay */}
        {isCustomizing && (
           <div 
             className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-40 p-4 flex flex-col animate-fadeIn border-b border-accent/30"
             onClick={(e) => e.stopPropagation()}
           >
             <div className="flex justify-between items-center mb-4">
                <h4 className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 font-tech">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span>
                  {labels.customize || "Visualizer"}
                </h4>
                <button onClick={toggleCustomization} className="text-slate-500 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
             </div>
             
             {/* Tabs */}
             <div className="flex p-1 bg-slate-900 rounded-lg mb-4">
               <button 
                 onClick={() => setActiveCustomTab('paint')}
                 className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded transition-all duration-300 ${
                   activeCustomTab === 'paint' 
                     ? 'bg-accent text-white shadow-lg' 
                     : 'text-slate-500 hover:text-slate-300'
                 }`}
               >
                 {labels.paint}
               </button>
               <button 
                 onClick={() => setActiveCustomTab('accessories')}
                 className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded transition-all duration-300 ${
                   activeCustomTab === 'accessories' 
                     ? 'bg-accent text-white shadow-lg' 
                     : 'text-slate-500 hover:text-slate-300'
                 }`}
               >
                 {labels.accessories}
               </button>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar">
               {activeCustomTab === 'paint' && (
                 <div className="grid grid-cols-4 gap-3 place-items-center py-2">
                   {COLORS.map(c => (
                     <button
                       key={c.id}
                       onClick={() => setSelectedColor(c.id === selectedColor ? null : c.id)}
                       className={`w-9 h-9 rounded-full transition-all duration-300 transform relative ${
                         selectedColor === c.id 
                           ? 'scale-110 ring-2 ring-accent ring-offset-2 ring-offset-slate-900' 
                           : 'hover:scale-110 border border-slate-700'
                       }`}
                       style={{ backgroundColor: c.hex }}
                     >
                       {selectedColor === c.id && (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-md" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                         </svg>
                       )}
                     </button>
                   ))}
                 </div>
               )}

               {activeCustomTab === 'accessories' && (
                 <div className="space-y-2">
                    {ACCESSORIES.map(acc => {
                      const isSelected = selectedAccessories.includes(acc.id);
                      return (
                        <button
                          key={acc.id}
                          onClick={() => toggleAccessory(acc.id)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-bold uppercase tracking-wide transition-all ${
                            isSelected
                              ? 'bg-accent/20 border-accent/50 text-blue-300'
                              : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                          }`}
                        >
                          <span>{labels[acc.labelKey] || acc.id}</span>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_var(--accent-glow)]"></div>}
                        </button>
                      );
                    })}
                 </div>
               )}
             </div>

             <button 
               onClick={(e) => handleGenerateImage(e)}
               className="w-full py-3 bg-accent hover:bg-accent/90 text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow-lg shadow-accent/40 transition-all mt-4"
             >
               {labels.apply || "RENDER"}
             </button>
           </div>
        )}
        
        {/* Quick View Overlay */}
        {isQuickViewOpen && (
          <div 
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl z-50 p-6 flex flex-col animate-fadeIn"
            onClick={(e) => e.stopPropagation()} 
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-white font-['Exo_2']">{bike.model}</h3>
              <button onClick={toggleQuickView} className="text-slate-500 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
              </button>
            </div>
            {/* Quick stats list */}
            <div className="flex-1 space-y-4">
              {Object.entries(bike.specs).slice(0,5).map(([key, val]) => (
                 <div key={key} className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">{key}</span>
                    <span className="text-sm font-medium text-white">{val}</span>
                 </div>
              ))}
            </div>
            <button 
              onClick={onClick}
              className="w-full mt-4 py-3 bg-white text-black hover:bg-slate-200 font-bold rounded-lg uppercase tracking-wide text-xs"
            >
              Full Details
            </button>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-between items-end">
          <div className="bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-tech shadow-lg">
             {bike.brand}
          </div>
          <div className="text-xl font-bold text-white tracking-tight drop-shadow-md">
             {bike.price}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow relative z-10 bg-slate-900/40 transition-colors group-hover:bg-slate-900/60">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors font-['Exo_2'] leading-tight">
            {bike.model}
          </h3>
          <div className={`text-xs font-bold px-2 py-1 rounded border border-white/5 ${matchScoreColor} ${matchScoreBg}`}>
            {bike.matchScore}%
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
          {renderStars(bike.rating || 4.0)}
          {verdictStyle && (
             <div className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${verdictStyle.bg} ${verdictStyle.text} ${verdictStyle.border}`}>
               FIT: {bike.ergonomics.verdict.split(' ')[0]}
             </div>
          )}
        </div>
        
        <p className="text-slate-400 text-sm line-clamp-2 mb-6 flex-grow font-light leading-relaxed">
          {bike.description}
        </p>
        
        {/* Tech Specs Grid */}
        <div className="grid grid-cols-3 gap-px bg-slate-800/50 rounded-lg overflow-hidden border border-slate-800/50 mb-4">
           <div className="bg-slate-900/60 p-2 text-center group-hover:bg-slate-800/60 transition-colors">
              <div className="text-[9px] text-slate-500 font-bold uppercase mb-0.5">{labels.power}</div>
              <div className="text-white text-xs font-bold">{bike.specs.power}</div>
           </div>
           <div className="bg-slate-900/60 p-2 text-center group-hover:bg-slate-800/60 transition-colors">
              <div className="text-[9px] text-slate-500 font-bold uppercase mb-0.5">{labels.mileage}</div>
              <div className="text-emerald-400 text-xs font-bold">{bike.specs.mileage}</div>
           </div>
           <div className="bg-slate-900/60 p-2 text-center group-hover:bg-slate-800/60 transition-colors">
              <div className="text-[9px] text-slate-500 font-bold uppercase mb-0.5">{labels.weight}</div>
              <div className="text-white text-xs font-bold">{bike.specs.weight}</div>
           </div>
        </div>

        {/* Expandable Logic */}
        <div>
          <button 
            onClick={toggleExpansion}
            className="flex items-center justify-between w-full text-[10px] font-bold text-slate-500 group-hover:text-accent transition-colors uppercase tracking-[0.1em] font-tech"
          >
            <span>{labels.matchAnalysis}</span>
            <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-32 mt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
             <p className="text-xs text-slate-300 italic border-l-2 border-accent pl-3 py-1">
               "{bike.stateFitReason}"
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
