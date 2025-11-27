
import React, { useState, useRef } from 'react';
import { generateVeoVideo } from '../services/geminiService';

interface VeoModalProps {
  onClose: () => void;
  labels: any;
}

export const VeoModal: React.FC<VeoModalProps> = ({ onClose, labels }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedVideoUrl(null);

    const videoUrl = await generateVeoVideo(selectedImage, prompt);
    
    if (videoUrl) {
      setGeneratedVideoUrl(videoUrl);
    } else {
      alert("Failed to generate video. Please ensure you have selected a valid API Key from a paid project.");
    }
    setIsGenerating(false);
  };

  const openKeySelection = async () => {
    const win = window as any;
    if (win.aistudio && win.aistudio.openSelectKey) {
        await win.aistudio.openSelectKey();
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-slate-950 w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
        
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 z-10">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                   <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
             </div>
             <div>
                <h2 className="text-2xl font-bold text-white font-['Exo_2']">{labels.motionStudio}</h2>
                <div className="flex items-center gap-2">
                   <p className="text-xs text-purple-400 font-medium">{labels.veoDisclaimer}</p>
                   {/* API Key Button */}
                   <button 
                     onClick={openKeySelection}
                     className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1 transition-colors"
                     title="Change API Key"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                       <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 000-2z" clipRule="evenodd" />
                     </svg>
                     Key
                   </button>
                </div>
             </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Inputs */}
          <div className="w-full lg:w-1/2 space-y-6">
            
            {/* Image Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${selectedImage ? 'border-slate-700 bg-slate-900' : 'border-slate-600 hover:border-purple-500 cursor-pointer bg-slate-900/50'}`}
              onClick={() => !selectedImage && fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
              
              {selectedImage ? (
                <div className="relative">
                  <img src={selectedImage} alt="Upload" className="max-h-64 mx-auto rounded-lg shadow-lg" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                    className="absolute -top-3 -right-3 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">{labels.uploadImage || "Upload Image"}</span>
                  <span className="text-xs text-slate-600">{labels.dragDrop}</span>
                </div>
              )}
            </div>

            {/* Prompt Area */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 uppercase tracking-wide">{labels.enterPrompt}</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={labels.describeMotion}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500 outline-none h-32 resize-none shadow-inner"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!selectedImage || !prompt.trim() || isGenerating}
              className={`w-full py-4 rounded-xl font-bold text-white uppercase tracking-wider transition-all transform hover:scale-[1.02] shadow-lg ${
                !selectedImage || !prompt.trim() || isGenerating
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-purple-600/30'
              }`}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {labels.generatingVideo}
                </div>
              ) : (
                labels.generateVideo
              )}
            </button>
          </div>

          {/* Right Column: Output */}
          <div className="w-full lg:w-1/2 bg-black rounded-xl overflow-hidden border border-slate-800 relative flex items-center justify-center min-h-[400px]">
             {generatedVideoUrl ? (
                <div className="w-full h-full flex flex-col">
                  <video 
                    src={generatedVideoUrl} 
                    controls 
                    autoPlay 
                    loop 
                    className="w-full h-auto max-h-[400px] object-contain"
                  />
                  <div className="p-4 bg-slate-900 border-t border-slate-800 text-center">
                     <a 
                       href={generatedVideoUrl} 
                       download="veo_video.mp4"
                       className="text-sm text-purple-400 hover:text-purple-300 underline font-medium"
                       target="_blank"
                       rel="noreferrer"
                     >
                       {labels.downloadVideo}
                     </a>
                  </div>
                </div>
             ) : isGenerating ? (
                <div className="text-center space-y-4 p-8">
                   <div className="relative w-24 h-24 mx-auto">
                      <div className="absolute inset-0 border-4 border-purple-900 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
                   </div>
                   <h3 className="text-xl font-bold text-white animate-pulse">Rendering Motion...</h3>
                   <p className="text-slate-400 text-sm max-w-xs mx-auto">Veo is analyzing your image and generating frames. This usually takes about 45-60 seconds.</p>
                </div>
             ) : (
                <div className="text-center text-slate-600 p-8">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                   </svg>
                   <p>{labels.videoReady || "Your generated video will appear here"}</p>
                </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};
