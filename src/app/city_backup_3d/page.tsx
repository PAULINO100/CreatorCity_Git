'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

// Lazy load 3D scene (heavy WebGL dependencies)
const CityScene3D = dynamic(() => import('@/components/city/CityScene3D'), { 
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
});

function detectWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch { return false; }
}

export default function CityPage() {
  const [search, setSearch] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<{id: string; name: string; dis_score: number}[]>([]);
  const [history, setHistory] = React.useState<string[]>([]);
  const [webglSupported, setWebglSupported] = React.useState(true);

  React.useEffect(() => {
    const supported = detectWebGL();
    setWebglSupported(supported);
    const saved = localStorage.getItem('atlas_search_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  React.useEffect(() => {
    if (search.length >= 2) {
      const controller = new AbortController();
      fetch(`/api/search/users?q=${encodeURIComponent(search)}`, { signal: controller.signal })
        .then(res => res.json())
        .then(data => setSuggestions(data.users || []))
        .catch(() => {});
      return () => controller.abort();
    } else {
      setSuggestions([]);
    }
  }, [search]);

  const handleSearch = (val: string) => {
    setSearch(val);
    if (val && !history.includes(val)) {
      const newHistory = [val, ...history].slice(0, 5);
      setHistory(newHistory);
      localStorage.setItem('atlas_search_history', JSON.stringify(newHistory));
    }
    setSuggestions([]);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch(search);
  };

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
           {/* Search */}
           <div className="relative group">
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search citizen or district..." 
                className="w-full md:w-80 h-14 bg-slate-900 border border-slate-800 rounded-xl px-12 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">🔍</span>
                            {history.length > 0 && !search && (
                 <div className="absolute top-16 left-0 right-0 bg-slate-900 border border-slate-800 rounded-xl p-2 z-50 shadow-2xl">
                   <div className="text-[10px] text-slate-500 uppercase font-bold p-2">Recent Searches</div>
                   {history.map(h => (
                     <button 
                       key={h}
                       onClick={() => handleSearch(h)}
                       className="w-full text-left px-3 py-2 hover:bg-slate-800 rounded-lg text-xs text-slate-300 transition-colors"
                     >
                       🕒 {h}
                     </button>
                   ))}
                 </div>
               )}

               {search.length >= 2 && suggestions.length > 0 && (
                 <div className="absolute top-16 left-0 right-0 bg-slate-900 border border-slate-800 rounded-xl p-2 z-50 shadow-2xl max-h-60 overflow-y-auto">
                   <div className="text-[10px] text-slate-500 uppercase font-bold p-2">Suggestions</div>
                   {suggestions.map(s => (
                     <button 
                       key={s.id}
                       onClick={() => handleSearch(s.name)}
                       className="w-full text-left px-3 py-2 hover:bg-slate-800 rounded-lg text-xs text-slate-300 transition-colors flex justify-between"
                     >
                       <span>👤 {s.name}</span>
                       <span className="text-blue-500 opacity-50 text-[10px] uppercase">{s.dis_score} DIS</span>
                     </button>
                   ))}
                 </div>
               )}
            </div>

           {/* Stats */}
           <div className="flex gap-4">
              <div className="flex-1 bg-slate-900 border border-slate-800 p-3 rounded-xl">
                 <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Active Citizens</div>
                 <div className="text-xl font-bold">1,018</div>
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
          <div className="w-full aspect-video bg-slate-900/50 border border-slate-800 rounded-3xl flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        }>
          <ErrorBoundary>
            {!webglSupported ? (
              <div className="w-full aspect-video bg-slate-900/50 border border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center p-8">
                <span className="text-4xl mb-4">🖥️</span>
                <h2 className="text-xl font-bold mb-2">WebGL Required</h2>
                <p className="text-slate-400">Your browser or device indicates that WebGL is not supported or is disabled. Atlas City requires a WebGL-capable browser to render the 3D Metropolis.</p>
              </div>
            ) : (
              <CityScene3D searchQuery={search} />
            )}
          </ErrorBoundary>
        </React.Suspense>
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between text-[11px] text-slate-600 font-bold uppercase tracking-widest gap-4">
         <div>&copy; 2026 Atlas City Protocol — v2.0.0-alpha</div>
         <div className="flex gap-8">
            <a href="#" className="hover:text-blue-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Governance</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Simulation Docs</a>
         </div>
      </div>
    </main>
  );
}
