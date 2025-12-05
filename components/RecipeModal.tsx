import React, { useState, useEffect, useRef } from 'react';
import { Bike, ChatMessage, IndianLanguage, Review } from '../types';
import { askExpertAboutBike } from '../services/geminiService';

interface BikeModalProps {
  bike: Bike | null;
  onClose: () => void;
  language: IndianLanguage;
  labels: any;
  userStats?: { height: number; weight: number } | null;
}

export const BikeModal: React.FC<BikeModalProps> = ({ bike, onClose, language, labels, userStats }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Review State
  const [localReviews, setLocalReviews] = useState<Review[]>([]);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');

  useEffect(() => {
    if (bike) {
      setMessages([{ role: 'model', text: `Namaste! I can help you with details about the ${bike.model}. Ask me anything in ${language}!`, timestamp: Date.now() }]);
      setLocalReviews(bike.reviews || []);
    }
  }, [bike, language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!bike) return null;

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const responseText = await askExpertAboutBike(bike, history, userMsg.text, language);
    
    setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: Date.now() }]);
    setIsSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newReviewText.trim()) return;

    const review: Review = {
      author: "You",
      rating: newReviewRating,
      text: newReviewText,
      date: new Date().toLocaleDateString()
    };
    setLocalReviews([review, ...localReviews]);
    setNewReviewText("");
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-0.5">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i}
            className={`w-4 h-4 ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
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
      </div>
    );
  };
  
  // Circular Progress Component for Fit Score
  const CircularProgress = ({ score }: { score: number }) => {
    const radius = 30;
    const stroke = 6;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    
    let color = 'text-orange-500';
    if(score >= 75) color = 'text-blue-500';
    if(score >= 90) color = 'text-green-500';

    return (
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
           <circle
             stroke="rgba(255,255,255,0.1)"
             strokeWidth={stroke}
             fill="transparent"
             r={normalizedRadius}
             cx={radius}
             cy={radius}
           />
           <circle
             className={`transition-all duration-1000 ease-out ${color}`}
             stroke="currentColor"
             strokeWidth={stroke}
             strokeDasharray={circumference + ' ' + circumference}
             style={{ strokeDashoffset }}
             strokeLinecap="round"
             fill="transparent"
             r={normalizedRadius}
             cx={radius}
             cy={radius}
           />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
           <span className="text-lg font-bold text-white leading-none">{score}</span>
           <span className="text-[8px] text-slate-400 uppercase">%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-slate-950 w-full max-w-7xl h-[90vh] rounded-2xl shadow-2xl shadow-blue-900/20 border border-slate-800 flex flex-col lg:flex-row overflow-hidden animate-fadeIn">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-slate-800/80 hover:bg-slate-700 rounded-full text-white transition-colors border border-slate-700 backdrop-blur-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Left Panel: Bike Details */}
        <div className="w-full lg:w-2/3 overflow-y-auto p-6 sm:p-10 scroll-smooth custom-scrollbar">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-600/20">{bike.brand}</span>
              <span className="text-slate-400 text-sm font-medium tracking-wide">{bike.type}</span>
              <div className="flex items-center gap-2 bg-slate-800/50 px-2 py-0.5 rounded-full border border-slate-700">
                {renderStars(bike.rating || 4)}
                <span className="text-xs text-slate-300">({bike.rating})</span>
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 font-['Exo_2'] tracking-tight">{bike.model}</h2>
            <p className="text-slate-300 text-lg leading-relaxed border-l-4 border-blue-500 pl-4">{bike.description}</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 relative group hover:border-blue-500/30 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="text-slate-500 text-xs uppercase font-bold mb-1 tracking-wider">{labels.engine}</div>
              <div className="text-white font-bold text-lg">{bike.specs.engineCC}</div>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 group hover:border-blue-500/30 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="text-slate-500 text-xs uppercase font-bold mb-1 tracking-wider">{labels.mileage}</div>
              <div className="text-emerald-400 font-bold text-lg">{bike.specs.mileage}</div>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 group hover:border-blue-500/30 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="text-slate-500 text-xs uppercase font-bold mb-1 tracking-wider">{labels.power}</div>
              <div className="text-white font-bold text-lg">{bike.specs.power}</div>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 group hover:border-blue-500/30 transition-all hover:-translate-y-1 hover:shadow-lg">
               <div className="text-slate-500 text-xs uppercase font-bold mb-1 tracking-wider">{labels.seatHeight}</div>
               <div className="text-white font-bold text-lg">{bike.specs.seatHeight || "N/A"}</div>
            </div>
          </div>
          
          {/* Ergonomic Fit Analysis */}
          {bike.ergonomics && (
            <div className="mb-10 bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden shadow-inner">
               <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

               <div className="flex justify-between items-start mb-6 relative z-10 border-b border-indigo-500/10 pb-4">
                  <h3 className="text-indigo-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {labels.fitCheck}
                  </h3>
                  
                  {userStats && (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                          <div className="text-[10px] uppercase text-indigo-300 font-bold tracking-wider">{labels.riderStatsUsed}</div>
                          <div className="text-white font-bold font-['Exo_2'] flex items-center justify-end gap-2 text-sm">
                            <span>{userStats.height} cm</span>
                            <span className="text-indigo-500">|</span>
                            <span>{userStats.weight} kg</span>
                          </div>
                      </div>
                      <div className="p-2 bg-indigo-500/20 rounded-full">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                         </svg>
                      </div>
                    </div>
                  )}
               </div>
               
               <div className="flex flex-col sm:flex-row gap-8 items-center relative z-10">
                 {/* Visual Gauge */}
                 <div className="flex flex-col items-center">
                    <CircularProgress score={bike.ergonomics.fitScore} />
                    <div className="text-[10px] text-indigo-300 uppercase font-bold mt-2 tracking-wider">{labels.fitScore}</div>
                 </div>
                 
                 <div className="flex-1 bg-slate-900/40 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                       <h4 className="text-xl font-bold text-white font-['Exo_2']">{bike.ergonomics.verdict}</h4>
                       <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 uppercase tracking-wide">{labels.basedOnStats}</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed mb-3">{bike.ergonomics.description}</p>
                 </div>
               </div>
               
               {/* Logic Explanation */}
               <div className="mt-4 pt-4 border-t border-indigo-500/10 text-xs text-indigo-200/60 flex items-start gap-2 italic">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    The Fit Score calculates optimal leg reach by comparing your height vs the bike's seat height ({bike.specs.seatHeight}), and checks manageability by comparing your weight vs the machine's wet weight.
                  </span>
               </div>
            </div>
          )}

          {/* Pros & Cons */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-slate-900/50 rounded-xl p-6 border border-green-500/20 shadow-sm">
              <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {labels.whyBuy}
              </h3>
              <ul className="space-y-3">
                {bike.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0 shadow-sm shadow-green-500/50"></span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-6 border border-red-500/20 shadow-sm">
              <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {labels.watchOut}
              </h3>
              <ul className="space-y-3">
                {bike.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0 shadow-sm shadow-red-500/50"></span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 font-['Exo_2'] flex items-center gap-2 border-b border-slate-800 pb-4">
               {labels.reviews}
               <span className="text-sm font-normal text-slate-400 ml-auto">{labels.averageRating}: <span className="text-white font-bold">{bike.rating}/5</span></span>
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
               {/* Review List */}
               <div className="space-y-4">
                  {localReviews.map((review, idx) => (
                     <div key={idx} className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                           <div className="font-bold text-slate-200">{review.author}</div>
                           <div className="text-xs text-slate-500">{review.date || "Recent"}</div>
                        </div>
                        <div className="mb-2">{renderStars(review.rating)}</div>
                        <p className="text-sm text-slate-400 italic">"{review.text}"</p>
                     </div>
                  ))}
                  {localReviews.length === 0 && <p className="text-slate-500">No reviews yet. Be the first!</p>}
               </div>

               {/* Add Review Form */}
               <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 h-fit sticky top-6">
                  <h4 className="font-bold text-white mb-4">{labels.writeReview}</h4>
                  <form onSubmit={handleSubmitReview}>
                     <div className="mb-4">
                        <label className="block text-xs text-slate-400 mb-2 uppercase font-bold">{labels.stars}</label>
                        <div className="flex gap-2">
                           {[1, 2, 3, 4, 5].map((star) => (
                              <button 
                                type="button" 
                                key={star} 
                                onClick={() => setNewReviewRating(star)}
                                className="focus:outline-none transition-transform active:scale-90 hover:scale-110"
                              >
                                 <svg 
                                    className={`w-6 h-6 ${star <= newReviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'}`}
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
                              </button>
                           ))}
                        </div>
                     </div>
                     <div className="mb-4">
                        <label className="block text-xs text-slate-400 mb-2 uppercase font-bold">{labels.yourReview}</label>
                        <textarea 
                           value={newReviewText}
                           onChange={(e) => setNewReviewText(e.target.value)}
                           className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-slate-600"
                           rows={3}
                           placeholder="..."
                        ></textarea>
                     </div>
                     <button 
                        type="submit"
                        disabled={!newReviewText.trim()} 
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
                     >
                        {labels.submit}
                     </button>
                  </form>
               </div>
            </div>
          </div>

        </div>

        {/* Right Panel: Chat Interface */}
        <div className="w-full lg:w-1/3 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col h-full max-h-[50vh] lg:max-h-full relative">
          {/* Tech Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.3)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
          
          <div className="p-4 border-b border-slate-800 bg-slate-900 relative z-10 shadow-md">
            <h3 className="font-bold text-white flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-slate-900"></span>
                </span>
              </div>
              <div>
                <div className="text-sm tracking-wide">{labels.askExpert}</div>
                <div className="text-xs text-blue-400 font-normal">{labels.online}</div>
              </div>
            </h3>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-4 relative z-10 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-md ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none' 
                    : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
             {isSending && (
               <div className="flex justify-start animate-fadeIn">
                 <div className="bg-slate-800 px-4 py-4 rounded-2xl rounded-bl-none border border-slate-700 shadow-md">
                   <div className="flex space-x-1.5">
                     <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                     <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                     <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                   </div>
                 </div>
               </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-slate-900 border-t border-slate-800 relative z-10">
            <div className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={labels.inputPlaceholder}
                className="w-full bg-slate-800 text-white rounded-xl pl-4 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-slate-700 focus:border-blue-500/50 placeholder-slate-500 shadow-inner transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};