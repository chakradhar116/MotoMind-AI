
import React from 'react';

export const BikeCardSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden h-full flex flex-col shadow-lg">
      {/* Image Skeleton */}
      <div className="h-48 bg-slate-800 animate-pulse relative">
        <div className="absolute top-4 right-4 flex gap-2">
           <div className="w-8 h-8 rounded-full bg-slate-700/50"></div>
           <div className="w-12 h-8 rounded-full bg-slate-700/50"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-6 flex flex-col flex-grow relative border-t border-slate-800">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="h-8 bg-slate-800 rounded w-2/3 animate-pulse"></div>
          <div className="h-6 bg-slate-800 rounded w-12 animate-pulse"></div>
        </div>
        
        {/* Rating */}
        <div className="flex gap-1 mb-4">
           {[...Array(5)].map((_, i) => (
             <div key={i} className="w-4 h-4 bg-slate-800 rounded-full animate-pulse"></div>
           ))}
        </div>
        
        {/* Description Lines */}
        <div className="space-y-2 mb-6 flex-grow">
          <div className="h-4 bg-slate-800 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-slate-800 rounded w-5/6 animate-pulse"></div>
          <div className="h-4 bg-slate-800 rounded w-4/6 animate-pulse"></div>
        </div>
        
        {/* Specs Grid */}
        <div className="grid grid-cols-3 gap-2 border-t border-slate-800 pt-4 mt-auto">
          <div className="h-16 bg-slate-800 rounded animate-pulse"></div>
          <div className="h-16 bg-slate-800 rounded animate-pulse"></div>
          <div className="h-16 bg-slate-800 rounded animate-pulse"></div>
        </div>
        
        {/* Footer/Match Analysis */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
           <div className="h-4 bg-slate-800 rounded w-1/3 animate-pulse"></div>
           <div className="w-4 h-4 bg-slate-800 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};
