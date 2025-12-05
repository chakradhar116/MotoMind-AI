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
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i}
            className={`w-4 h-4 ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'}`}
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
    const stroke = 5;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    
    let color = 'text-orange-500';
    if(score >= 75) color = 'text-blue-500';
    if(score >= 90) color = 'text-green-500';

    return (
      <div className="relative flex items-center justify-center group">
        <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
           <circle
             stroke="rgba(255,255,255,0.05)"
             strokeWidth={stroke}
             fill="transparent"
             r={normalizedRadius}
             cx={radius}
             cy={radius}
           />
           <circle
             className={`transition-all duration-1000 ease-out ${color} drop-shadow-[0_0_10px_currentColor]`}
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
           <span className="text-xl font-black text-white leading-none font-['Exo_2']">{score}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl transition-opacity" onClick={onClose}></div>
      
      <div className="relative bg-[#0b0f19] w-full max-w-7xl h-full sm:h-[90vh] sm:rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-slate-800 flex flex-col lg:flex-row overflow-hidden animate-fadeIn">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-2 bg-black/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-full transition-all border border-white/5 hover:border-red-500/50 backdrop-blur-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Left Panel: Bike Details (Scrollable) */}
        <div className="w-full lg:w-[65%] overflow-y-auto p-6 sm:p-12 scroll-smooth custom-scrollbar relative z-10">
          
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-4">
               <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] font-bold text-blue-400 uppercase tracking-widest font-tech">
                 {bike.brand}
               </div>
               <div className="w-px h-4 bg-slate-800"></div>
               <div className="text-slate-400 text-xs font-bold uppercase tracking-wide">{bike.type}</div>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black text-white mb-6 font-['Exo_2'] tracking-tighter leading-none">
              {bike.model}
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed border-l-2 border-blue-500 pl-6 py-1 font-light opacity-90">
              {bike.description}
            </p>
          </div>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            {[
              { label: labels.engine, val: bike.specs.engineCC },
              { label: labels.mileage, val: bike.specs.mileage, highlight: true },
              { label: labels.power, val: bike.specs.power },
              { label: labels.seatHeight, val: bike.specs.seatHeight || "N/A" }
            ].map((stat, i) => (
              <div key={i} className="bg-slate-900/40 p-5 rounded-2xl border border-white/5 hover:bg-slate-800/40 hover:border-blue-500/20 transition-all group">
                <div className="text-slate-500 text-[10px] uppercase font-bold mb-2 tracking-widest font-tech">{stat.label}</div>
                <div className={`text-xl font-bold font-['Exo_2'] ${stat.highlight ? 'text-emerald-400' : 'text-white'}`}>{stat.val}</div>
              </div>
            ))}
          </div>
          
          {/* Ergonomic Fit Analysis */}
          {bike.ergonomics && (
            <div className="mb-12 bg-gradient-to-r from-indigo-900/10 to-transparent border-l-4 border-indigo-500 p-8 rounded-r-2xl relative overflow-hidden">
               <div className="flex flex-col sm:flex-row gap-8 items-center relative z-10">
                 {/* Visual Gauge */}
                 <div className="flex flex-col items-center gap-2">
                    <CircularProgress score={bike.ergonomics.fitScore} />
                    <div className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest">{labels.fitScore}</div>
                 </div>
                 
                 <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                       <h4 className="text-2xl font-bold text-white font-['Exo_2']">{bike.ergonomics.verdict}</h4>
                       {userStats && (
                         <span className="text-[10px] text-indigo-300 bg-indigo-900/30 px-2 py-1 rounded border border-indigo-500/20 uppercase font-bold tracking-wide">
                           {userStats.height}cm / {userStats.weight}kg
                         </span>
                       )}
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">{bike.ergonomics.description}</p>
                 </div>
               </div>
            </div>
          )}

          {/* Pros & Cons */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-slate-900/20 rounded-2xl p-6 border border-white/5">
              <h3 className="text-sm font-bold text-green-400 mb-6 flex items-center gap-2 uppercase tracking-widest font-tech">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                {labels.whyBuy}
              </h3>
              <ul className="space-y-4">
                {bike.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 text-sm font-light">
                    <svg className="w-4 h-4 text-green-500/50 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900/20 rounded-2xl p-6 border border-white/5">
              <h3 className="text-sm font-bold text-red-400 mb-6 flex items-center gap-2 uppercase tracking-widest font-tech">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                {labels.watchOut}
              </h3>
              <ul className="space-y-4">
                {bike.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 text-sm font-light">
                     <svg className="w-4 h-4 text-red-500/50 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <h3 className="text-xl font-bold text-white font-['Exo_2']">{labels.reviews}</h3>
              <div className="flex items-center gap-2">
                 <span className="text-3xl font-bold text-white font-['Exo_2']">{bike.rating}</span>
                 <div className="flex flex-col text-[10px] text-slate-500 font-bold uppercase leading-tight">
                    <span>Average</span>
                    <span>Rating</span>
                 </div>
              </div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
               <div className="space-y-4">
                  {localReviews.map((review, idx) => (
                     <div key={idx} className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                        <div className="flex justify-between items-start mb-2">
                           <div className="font-bold text-slate-200 text-sm">{review.author}</div>
                           <div className="text-[10px] text-slate-600 font-bold uppercase">{review.date || "Verified"}</div>
                        </div>
                        <div className="mb-2 opacity-80 scale-90 origin-left">{renderStars(review.rating)}</div>
                        <p className="text-sm text-slate-400 font-light leading-relaxed">"{review.text}"</p>
                     </div>
                  ))}
                  {localReviews.length === 0 && <p className="text-slate-500 italic text-sm">No reviews yet.</p>}
               </div>

               <div className="bg-slate-900/30 p-6 rounded-xl border border-white/5 h-fit">
                  <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wide">{labels.writeReview}</h4>
                  <form onSubmit={handleSubmitReview}>
                     <div className="mb-4">
                        <div className="flex gap-2 mb-2">
                           {[1, 2, 3, 4, 5].map((star) => (
                              <button 
                                type="button" 
                                key={star} 
                                onClick={() => setNewReviewRating(star)}
                                className="focus:outline-none transition-transform hover:scale-110"
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
                     <textarea 
                        value={newReviewText}
                        onChange={(e) => setNewReviewText(e.target.value)}
                        className="w-full bg-black/40 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-slate-600 mb-4 resize-none"
                        rows={3}
                        placeholder="Share your thoughts..."
                     ></textarea>
                     <button 
                        type="submit"
                        disabled={!newReviewText.trim()} 
                        className="w-full bg-white text-black font-bold py-2.5 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 text-xs uppercase tracking-widest"
                     >
                        {labels.submit}
                     </button>
                  </form>
               </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Chat Interface */}
        <div className="w-full lg:w-[35%] bg-[#080b14] border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col h-[50vh] lg:h-full relative shadow-2xl z-20">
          
          <div className="p-5 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md relative z-10 flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-3">
               <div className="relative">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse absolute -right-0.5 -top-0.5"></div>
                 <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                 </div>
               </div>
               <div>
                  <div className="text-sm font-['Exo_2']">{labels.askExpert}</div>
                  <div className="text-[10px] text-slate-500 font-tech uppercase tracking-wider">Powered by Gemini</div>
               </div>
            </h3>
          </div>

          <div className="flex-grow overflow-y-auto p-5 space-y-6 relative z-10 custom-scrollbar bg-slate-950">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-sm' 
                    : 'bg-slate-900 text-slate-300 rounded-bl-sm border border-slate-800'
                }`}>
                  {msg.text}
                  <div className={`text-[9px] mt-1 opacity-50 font-bold uppercase tracking-wider ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-500'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            ))}
             {isSending && (
               <div className="flex justify-start animate-fadeIn">
                 <div className="bg-slate-900 px-4 py-3 rounded-2xl rounded-bl-sm border border-slate-800">
                   <div className="flex space-x-1.5 items-center h-5">
                     <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                     <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-75"></div>
                     <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-150"></div>
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
                className="w-full bg-slate-950 text-white rounded-xl pl-5 pr-12 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-slate-800 focus:border-blue-500/50 placeholder-slate-600 transition-all shadow-inner"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg hover:scale-105 active:scale-95"
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