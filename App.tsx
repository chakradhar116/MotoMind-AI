import React, { useState } from 'react';
import { Header } from './components/Header';
import { BikePreferenceForm } from './components/IngredientScanner';
import { BikeCard } from './components/RecipeCard';
import { BikeCardSkeleton } from './components/BikeCardSkeleton';
import { BikeModal } from './components/RecipeModal';
import { ComparisonModal } from './components/ComparisonModal';
import { DealershipModal } from './components/DealershipModal';
import { FuelCard } from './components/FuelCard';
import { VeoModal } from './components/VeoModal';
import { getBikeRecommendations, findDealerships, getFuelPrices } from './services/geminiService';
import { Bike, BikePreference, Dealership, IndianLanguage, FuelPrices } from './types';
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

  // Fuel Price State
  const [fuelPrices, setFuelPrices] = useState<FuelPrices | null>(null);
  const [isFuelLoading, setIsFuelLoading] = useState(false);

  // Motion Studio State
  const [isVeoModalOpen, setIsVeoModalOpen] = useState(false);

  const t = getTranslations(selectedLanguage);

  const handleSearch = async (prefs: BikePreference) => {
    setIsAnalyzing(true);
    setIsFuelLoading(true);
    setError(null);
    setBikes([]);
    setFuelPrices(null);
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

    // Fetch Fuel Prices
    getFuelPrices(prefs.state, selectedLanguage)
      .then(prices => setFuelPrices(prices))
      .catch(err => console.error("Fuel fetch failed", err))
      .finally(() => setIsFuelLoading(false));
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
    <div className="min-h-screen text-slate-100 selection:bg-blue-500 selection:text-white relative">
      {/* Dynamic Background Elements */}
      <div className="bg-ambient"></div>
      <div className="tech-grid"></div>
      
      {/* Moving Ambient Orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>

      <Header 
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        onOpenMotionStudio={() => setIsVeoModalOpen(true)}
        labels={t}
      />

      <main className="pt-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fadeIn">
          <h1 className="text-5xl sm:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-slate-400 mb-6 tracking-tight font-['Exo_2'] drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
             {t.heroTitle}
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
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
          <div className="mt-8 max-w-2xl mx-auto glass-panel border-l-4 border-red-500 rounded-r-lg p-4 text-red-200 text-center flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Results Section */}
        {(bikes.length > 0 || isAnalyzing || isFuelLoading) && searchedState && (
          <div className="mt-20 animate-slideUp">
            
            {/* Market Insight Badge */}
            {!isAnalyzing && marketAnalysis && (
              <div className="mb-10 glass-panel border-l-4 border-blue-500 p-8 rounded-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="text-blue-400 font-bold text-sm uppercase tracking-[0.2em] mb-3 font-tech">
                  {t.marketAnalysis} // {searchedState}
                </h3>
                <p className="text-slate-200 text-lg italic font-light">"{marketAnalysis}"</p>
              </div>
            )}

            {/* Fuel Prices Card */}
            <FuelCard 
               fuelPrices={fuelPrices} 
               loading={isFuelLoading} 
               labels={t} 
               stateName={searchedState} 
            />

            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 border-b border-white/5 pb-6">
              <div>
                <h2 className="text-4xl font-bold text-white font-['Exo_2'] flex items-center gap-3">
                  {t.topRecs}
                  <span className="text-sm font-normal text-slate-500 bg-slate-900/50 px-3 py-1 rounded-full border border-white/5">{bikes.length} Found</span>
                </h2>
                <p className="text-slate-400 text-sm mt-2 font-tech tracking-wide uppercase">
                  {t.selectToCompare}
                </p>
              </div>

               {/* Search Input */}
               <div className="relative group w-full md:w-80">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder} 
                    className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-inner outline-none"
                    disabled={isAnalyzing}
                  />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {isAnalyzing ? (
                 // Render Skeleton Loaders
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
                <div className="col-span-full text-center py-20 text-slate-500 glass-card rounded-2xl border-dashed">
                   <p className="text-xl">No bikes match your search.</p>
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
            className="bg-blue-600/90 hover:bg-blue-500 text-white pl-6 pr-8 py-4 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.5)] backdrop-blur-md flex items-center gap-4 border border-blue-400/30 transition-all hover:scale-105 group"
          >
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-white text-blue-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                {comparisonList.length}
              </span>
            </div>
            <span className="font-bold tracking-widest uppercase text-sm font-tech">{t.compareBikes}</span>
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

      {isVeoModalOpen && (
        <VeoModal 
          onClose={() => setIsVeoModalOpen(false)}
          labels={t}
        />
      )}

    </div>
  );
}

export default App;