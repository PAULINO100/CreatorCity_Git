import React from 'react';
import CityMap2D from '@/components/city/CityMap2D';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

export const metadata = {
  title: "City Map | Atlas City",
  description: "Explore the spatial social graph of Atlas City citizens.",
};

export default function CityPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans selection:bg-amber-400 selection:text-black p-4 md:p-8 lg:p-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <span className="text-amber-400 text-xs font-bold uppercase tracking-[0.4em] mb-3 block">Citizen Social Graph</span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
            ATLAS <span className="text-blue-600">CITY</span>
          </h1>
          <p className="text-slate-400 mt-4 max-w-xl text-lg font-medium leading-relaxed">
            Spatial representation of the <span className="text-white">Reputation Economy</span>. Every building represents a citizen&apos;s expertise and influence.
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-col gap-4">
           <div className="relative group">
              <input 
                type="text" 
                placeholder="Search citizen or district..." 
                className="w-full md:w-80 h-14 bg-slate-900 border border-slate-800 rounded-xl px-12 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">🔍</span>
           </div>
           <div className="flex gap-4">
              <div className="flex-1 bg-slate-900 border border-slate-800 p-3 rounded-xl">
                 <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Active Citizens</div>
                 <div className="text-xl font-bold">1,284</div>
              </div>
              <div className="flex-1 bg-slate-900 border border-slate-800 p-3 rounded-xl">
                 <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Global Score</div>
                 <div className="text-xl font-bold text-blue-500">4.2M</div>
              </div>
           </div>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="max-w-7xl mx-auto mb-16">
        <React.Suspense fallback={
          <div className="w-full aspect-square bg-slate-900/50 border border-slate-800 rounded-3xl flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        }>
          <ErrorBoundary>
            <CityMap2D />
          </ErrorBoundary>
        </React.Suspense>
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between text-[11px] text-slate-600 font-bold uppercase tracking-widest gap-4">
         <div>&copy; 2026 Atlas City Protocol — v1.0.0-alpha</div>
         <div className="flex gap-8">
            <a href="#" className="hover:text-blue-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Governance</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Simulation Docs</a>
         </div>
      </div>
    </main>
  );
}
