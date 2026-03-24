/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';

export default function AdminImportPage() {
  const [token, setToken] = useState('');
  const [minStars, setMinStars] = useState(5000);
  const [batchSize, setBatchSize] = useState(100);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch('/api/import/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, minStars, batchSize }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to start import');
      }

      const data = await res.json();
      setResults(data.stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8 md:p-12 selection:bg-blue-500 selection:text-white">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-500/20">Admin Only</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
            GITHUB <span className="text-blue-600">CITY IMPORT</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
            Populate Atlas City with real developer metadata. Every repository with 5000+ stars becomes a unique skyscraper in the grid.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
            <h3 className="text-lg font-bold text-white mb-2">Import Configuration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">GitHub Token (Fine-grained)</label>
                <input 
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">Min Stars</label>
                  <input 
                    type="number"
                    value={minStars}
                    onChange={(e) => setMinStars(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">Batch size</label>
                  <input 
                    type="number"
                    value={batchSize}
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleImport}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${
                loading 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
              }`}
            >
              {loading ? 'Initializing Protocol...' : 'Launch Import Batch'}
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col justify-center">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
                <p className="text-red-400 text-xs font-bold leading-relaxed">{error}</p>
              </div>
            )}

            {results ? (
              <div className="space-y-6">
                <h4 className="text-white font-black uppercase text-xs tracking-widest border-b border-slate-800 pb-2">Batch Results</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Stat label="Fetched" value={results.totalFetched} />
                  <Stat label="Created" value={results.usersCreated} color="text-green-500" />
                  <Stat label="Buildings" value={results.buildingsCreated} color="text-blue-500" />
                  <Stat label="Skipped" value={results.duplicatesSkipped} color="text-amber-500" />
                </div>

                {results.errors.length > 0 && (
                  <div className="mt-4 max-h-32 overflow-y-auto font-mono text-[9px] text-slate-500 space-y-1">
                    {results.errors.slice(0, 5).map((err: string, i: number) => (
                      <p key={i}>⚠️ {err}</p>
                    ))}
                    {results.errors.length > 5 && <p>... {results.errors.length - 5} more errors</p>}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-4 py-12">
                 <div className="text-4xl opacity-20 filter grayscale">🛸</div>
                 <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                   Awaiting sequence <br />
                   <span className="text-[10px] opacity-40">Ready to expand city grid</span>
                 </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-700">
           <span>Atlas Admin Protocol v1.0</span>
           <div className="flex gap-6">
              <a href="/city" className="hover:text-blue-500 transition-colors">View City</a>
              <a href="/dashboard" className="hover:text-blue-500 transition-colors">Dashboard</a>
           </div>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value, color = "text-white" }: { label: string, value: number, color?: string }) {
  return (
    <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl">
      <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}
