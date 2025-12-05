
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BikePreferenceForm } from './components/IngredientScanner';
import { BikeCard } from './components/BikeCard';
import { BikeCardSkeleton } from './components/BikeCardSkeleton';
import { BikeModal } from './components/RecipeModal';
import { ComparisonModal } from './components/ComparisonModal';
import { DealershipModal } from './components/DealershipModal';
import { getBikeRecommendations, findDealerships } from './services/geminiService';
import { Bike, BikePreference, Dealership, IndianLanguage, ThemeType } from './types';
import { getTranslations } from './translations';

function App() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [marketAnalysis, setMarketAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchedState, setSearchedState] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<IndianLanguage>(IndianLanguage.ENGLISH);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(ThemeType.CYBER);
  
  // User Stats for Ergonomics
  const [currentUserStats, setCurrentUserStats] = useState<{height: number, weight: number} | null>(null);
  
  // Comparison State
  const [comparisonList, setComparisonList] = useState<Bike[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  // Dealership Search State
  const [isDealershipModalOpen, setIsDealershipModalOpen] = useState(false);
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [dealershipText, setDealershipText] = useState<string>("");
  const [dealerSearchBrand, setDealerSearchBrand] = useState<string>("");
  const [locatingBikeId, setLocatingBikeId] = useState<string | null>(null);

  const t = getTranslations(selectedLanguage);

  // Apply Theme
  useEffect(() => {
    document.body.setAttribute('data-theme', selectedTheme);
  }, [selectedTheme]);

  const handleSearch = async (prefs: BikePreference) => {
    setIsAnalyzing(true);
    setError(null);
    setBikes([]);
    setMarketAnalysis("");
    setSearchedState(prefs.state);
    setComparisonList([]); 
    setSearchQuery("");
    setCurrentUserStats({ height: prefs.userHeight, weight: prefs.userWeight });

    // Fetch Bikes
    getBikeRecommendations({ ...prefs, language: selectedLanguage })
      .then(result => {
        setBikes(result.bikes);
        setMarketAnalysis(result.marketInsight);
      })
      .catch(err => {
        console.error(err);
        setError("Couldn't fetch recommendations. The AI engine stalled. Please try again.");
      })
      .finally(() => setIsAnalyzing(false));
  };

  const toggleComparison = (bike: Bike) => {
    setComparisonList(prev => {
      const exists = prev.find(b => b.id === bike.id);
      if (exists) {
        return prev.filter(b => b.id !== bike.id);
      } else {
        if (prev.length >= 3) {
          return prev;
        }
        return [...prev, bike];
      }
    });
  };

  const removeFromComparison = (bikeId: string) => {
    setComparisonList(prev => prev.filter(b => b.id !== bikeId));
    if (comparisonList.length <= 1) {
       if (comparisonList.length === 1) setIsComparisonOpen(false);
    }
  };

  const handleLocateDealers = async (bike: Bike) => {
    if (!searchedState) return;
    
    setDealerSearchBrand(bike.brand);
    setDealerships([]);
    setDealershipText("");
    setLocatingBikeId(bike.id);
    
    try {
      const result = await findDealerships(bike.brand, searchedState, selectedLanguage);
      setDealerships(result.dealerships);
      setDealershipText(result.text);
      setIsDealershipModalOpen(true);
    } catch (err) {
      console.error(err);
      setDealershipText("Failed to locate dealerships.");
      setIsDealershipModalOpen(true);
    } finally {
      setLocatingBikeId(null);
    }
  };

  const filteredBikes = bikes.filter(bike => 
    bike.brand.toLowerCase().includes(searchQuery.toLowerCase()) || 
    bike.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen text-slate-100 selection:bg-accent selection:text-white relative font-sans">
      {/* Dynamic Background Elements */}
      <div className="bg-ambient"></div>
      <div className="tech-grid"></div>
      
      <Header 
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        selectedTheme={selectedTheme}
        onThemeChange={setSelectedTheme}
        labels={t}
      />

      <main className="pt-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 pb-20">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fadeIn">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tighter font-['Exo_2'] drop-shadow-2xl">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-accent bg-[length:200%_auto] animate-[pulse_5s_ease-in-out_infinite]">
              {t.heroTitle}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto font-light leading-relaxed tracking-wide">
            {t.heroSubtitle}
          </p>
        </div>

        {/* Core Feature */}
        <BikePreferenceForm 
          onSearch={handleSearch} 
          isAnalyzing={isAnalyzing}
          labels={t}
          currentLanguage={selectedLanguage}
        />

        {/* Error Message */}
        {error && (
          <div className="mt-8 max-w-2xl mx-auto glass-panel border-l-4 border-red-500 rounded-r-lg p-6 text-red-200 text-center flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-slideUp">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Results Section */}
        {(bikes.length > 0 || isAnalyzing) && searchedState && (
          <div className="mt-24 animate-slideUp">
            
            {/* Market Insight Badge */}
            {!isAnalyzing && marketAnalysis && (
              <div className="mb-12 glass-panel border-l-4 border-accent p-8 rounded-2xl relative overflow-hidden group hover:shadow-[0_0_40px_var(--accent-glow)] transition-shadow">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-10 group-hover:opacity-20 transition-all duration-700"></div>
                <h3 className="text-accent font-bold text-sm uppercase tracking-[0.2em] mb-4 font-tech flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                  {t.marketAnalysis} // <span className="text-white">{searchedState}</span>
                </h3>
                <p className="text-slate-200 text-xl italic font-light leading-relaxed">"{marketAnalysis}"</p>
              </div>
            )}

            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6 border-b border-white/5 pb-8">
              <div>
                <h2 className="text-4xl font-bold text-white font-['Exo_2'] flex items-center gap-4">
                  {t.topRecs}
                  <span className="text-sm font-bold text-accent bg-slate-900/30 px-4 py-1.5 rounded-full border border-accent/30 shadow-[0_0_15px_var(--accent-glow)]">
                    {bikes.length} MATCHES
                  </span>
                </h2>
                <p className="text-slate-400 text-sm mt-2 font-tech tracking-wider uppercase opacity-70">
                  {t.selectToCompare}
                </p>
              </div>

               {/* Search Input */}
               <div className="relative group w-full lg:w-96">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 group-focus-within:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder} 
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-xl text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all shadow-inner outline-none hover:bg-slate-900/80"
                    disabled={isAnalyzing}
                  />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 perspective-1000">
              {isAnalyzing ? (
                 Array.from({ length: 6 }).map((_, i) => (
                    <BikeCardSkeleton key={i} />
                 ))
              ) : filteredBikes.length > 0 ? (
                filteredBikes.map((bike) => (
                  <BikeCard 
                    key={bike.id} 
                    bike={bike} 
                    onClick={() => setSelectedBike(bike)} 
                    onToggleCompare={toggleComparison}
                    onLocateDealers={handleLocateDealers}
                    isComparing={!!comparisonList.find(b => b.id === bike.id)}
                    isLocating={locatingBikeId === bike.id}
                    labels={t}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-24 glass-panel rounded-3xl border-dashed border-slate-700">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                   <p className="text-xl text-slate-400 font-light">No bikes match your specific search criteria.</p>
                   <button 
                      onClick={() => setSearchQuery("")}
                      className="mt-4 text-accent hover:text-white underline font-medium"
                   >
                     Clear filters
                   </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      {/* Floating Compare Action Button */}
      {comparisonList.length > 0 && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-40 animate-slideUp">
          <button
            onClick={() => setIsComparisonOpen(true)}
            className="bg-accent hover:bg-accent/80 text-white pl-8 pr-10 py-4 rounded-full shadow-[0_0_40px_var(--accent-glow)] backdrop-blur-xl flex items-center gap-4 border border-white/20 transition-all hover:scale-105 active:scale-95 group"
          >
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="absolute -top-2.5 -right-2.5 bg-white text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                {comparisonList.length}
              </span>
            </div>
            <span className="font-bold tracking-[0.15em] uppercase text-sm font-tech">{t.compareBikes}</span>
          </button>
        </div>
      )}

      {/* Modals */}
      {selectedBike && (
        <BikeModal 
          bike={selectedBike} 
          onClose={() => setSelectedBike(null)} 
          language={selectedLanguage}
          labels={t}
          userStats={currentUserStats}
        />
      )}

      {isComparisonOpen && (
        <ComparisonModal 
          bikes={comparisonList}
          onClose={() => setIsComparisonOpen(false)}
          onRemove={removeFromComparison}
          labels={t}
        />
      )}

      {isDealershipModalOpen && (
        <DealershipModal
          brand={dealerSearchBrand}
          location={searchedState}
          dealerships={dealerships}
          textSummary={dealershipText}
          isLoading={false}
          onClose={() => setIsDealershipModalOpen(false)}
          labels={t}
        />
      )}

    </div>
  );
}

export default App;
