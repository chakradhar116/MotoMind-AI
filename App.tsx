
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
    <div className="min-h-screen bg-slate-950 pb-20 selection:bg-blue-500 selection:text-white">
      <Header 
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        onOpenMotionStudio={() => setIsVeoModalOpen(true)}
        labels={t}
      />

      <main className="pt-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 tracking-tight font-['Exo_2']">
             {t.heroTitle}
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
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
          <div className="mt-8 max-w-2xl mx-auto bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-center flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Results Section */}
        {(bikes.length > 0 || isAnalyzing || isFuelLoading) && searchedState && (
          <div className="mt-16 animate-fadeIn">
            
            {/* Market Insight Badge */}
            {!isAnalyzing && marketAnalysis && (
              <div className="mb-8 bg-gradient-to-r from-slate-900 to-slate-800 border-l-4 border-blue-500 p-6 rounded-r-xl shadow-lg">
                <h3 className="text-blue-400 font-bold text-sm uppercase tracking-widest mb-2">
                  {t.marketAnalysis}: {searchedState}
                </h3>
                <p className="text-slate-300 italic">"{marketAnalysis}"</p>
              </div>
            )}

            {/* Fuel Prices Card */}
            <FuelCard 
               fuelPrices={fuelPrices} 
               loading={isFuelLoading} 
               labels={t} 
               stateName={searchedState} 
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white font-['Exo_2']">{t.topRecs}</h2>
                <p className="text-slate-400 text-sm mt-1">
                  {t.selectToCompare}
                </p>
              </div>

               {/* Search Input */}
               <div className="relative group w-full md:w-72">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder} 
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm outline-none"
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
                <div className="col-span-full text-center py-12 text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
                   <p>No bikes match your search.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      {/* Floating Compare Action Button */}
      {comparisonList.length > 0 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 animate-bounce-in">
          <button
            onClick={() => setIsComparisonOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full shadow-2xl shadow-blue-600/40 flex items-center gap-3 border border-white/10 transition-all hover:scale-105"
          >
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-blue-600">
                {comparisonList.length}
              </span>
            </div>
            <span className="font-bold tracking-wide">{t.compareBikes}</span>
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
