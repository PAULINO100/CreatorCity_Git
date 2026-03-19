'use client';

import React, { useState, useEffect } from 'react';
import { generateBuilding } from '@/lib/buildings/generator';
import Link from 'next/link';

export const MyBuildingPreview: React.FC = () => {
  const [data, setData] = useState<{ score: number, name: string, profileType: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [pulse, setPulse] = useState(false);

  const fetchData = React.useCallback(async () => {
    try {
      const res = await fetch('/api/score/me');
      const json = await res.json();
      if (res.ok) {
        if (data && json.score !== data.score) {
          setPulse(true);
          setTimeout(() => setPulse(false), 2000);
        }
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch personal score:", err);
    } finally {
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) return <div className="h-64 bg-slate-900 animate-pulse rounded-3xl border border-slate-800"></div>;
  if (!data) return null;

  const b = generateBuilding(data.score, data.profileType);
  const nextMilestone = (Math.floor(data.score / 500) + 1) * 500;
  const progress = ((data.score % 500) / 500) * 100;

  return (
    <div className={`relative bg-slate-900 border border-slate-800 rounded-3xl p-8 overflow-hidden transition-all duration-500 ${pulse ? 'ring-2 ring-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : ''}`}>
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full"></div>
      
      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* SVG Render */}
        <div className="relative w-40 h-40 flex items-center justify-center">
           <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <path 
                d={b.svgPath} 
                fill="transparent" 
                stroke={b.color} 
                strokeWidth="2"
                className="transition-all duration-1000 ease-in-out"
              />
              <path 
                d={b.svgPath} 
                fill={b.color} 
                fillOpacity="0.1"
              />
              <circle cx="50" cy="100" r="2" fill={b.color} className="animate-ping" />
           </svg>
        </div>

        {/* Stats & Info */}
        <div className="flex-1 space-y-4 text-center md:text-left">
           <div>
              <div className="text-[10px] text-blue-400 font-black uppercase tracking-[0.3em] mb-1">Cidadão Proeminente</div>
              <h2 className="text-3xl font-black text-white tracking-tighter">{data.name}</h2>
           </div>

           <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                 <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">Estrutura Atual</div>
                 <div className="text-sm font-bold text-slate-200 capitalize">{b.type.replace('_', ' ')}</div>
              </div>
              <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                 <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">Distrito</div>
                 <div className="text-sm font-bold text-blue-400 capitalize">{b.district}</div>
              </div>
           </div>

           {/* Milestone Progress */}
           <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                 <span className="text-slate-400">Próximo Nível: +1 Andar</span>
                 <span className="text-white">{data.score} / {nextMilestone} PT</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
                 <div 
                   className="h-full bg-blue-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                   style={{ width: `${progress}%` }}
                 ></div>
              </div>
              <p className="text-[9px] text-slate-500 italic">&quot;Seu prédio cresce com sua contribuição real. Conecte YouTube p/ +30% score.&quot;</p>
           </div>

           <Link 
             href="/city?building=me" 
             className="inline-flex items-center gap-2 group text-[11px] font-black uppercase tracking-widest text-blue-500 hover:text-white transition-all"
           >
             Ver na Cidade 
             <span className="group-hover:translate-x-1 transition-transform">→</span>
           </Link>
        </div>
      </div>
    </div>
  );
};

export default MyBuildingPreview;
