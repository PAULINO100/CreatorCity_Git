'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { generateBuilding, District } from '@/lib/buildings/generator';

interface CityCitizen {
  id: string;
  name: string;
  score: number;
  profileType: string;
  district: District;
  x: number;
  y: number;
  isMe?: boolean;
}

export const CityMap2D: React.FC = () => {
  const [citizens, setCitizens] = useState<CityCitizen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hovered, setHovered] = useState<CityCitizen | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [viewBox, setViewBox] = useState("0 0 1000 1000");
  const searchParams = useSearchParams();
  const svgRef = useRef<SVGSVGElement>(null);

  const fetchCitizens = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/city/citizens');
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const data = await res.json();
      setCitizens(data);
    } catch (err: unknown) {
      console.error("Failed to fetch citizens:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load citizens";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizens();
  }, []);

  useEffect(() => {
    const focusUser = searchParams.get('user');
    if (focusUser && citizens.length > 0) {
      const target = citizens.find(c => c.id === focusUser) || citizens[0]; 
      if (target) {
        const targetX = target.x * 10 - 500;
        const targetY = target.y * 10 - 500;
        setViewBox(`${targetX} ${targetY} 1000 1000`);
      }
    }
  }, [searchParams, citizens]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  if (loading) {
    return (
      <div className="w-full aspect-square bg-slate-950 border border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <div className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em] animate-pulse">Syncing City Grid...</div>
      </div>
    );
  }

  if (error || citizens.length === 0) {
    return (
       <div className="w-full aspect-square bg-slate-950 border border-slate-800 rounded-3xl flex flex-col items-center justify-center p-12 text-center">
          <div className="text-6xl mb-6 opacity-20 grayscale">🏙️</div>
          <h3 className="text-2xl font-black text-white mb-3">
             {error ? "SYSTEM OFFLINE" : "CITY DESERTED"}
          </h3>
          <p className="text-slate-400 text-sm max-w-sm mb-8 leading-relaxed">
             {error 
               ? "The city grid is currently undergoing maintenance. Please check back shortly." 
               : "No technical influence detected yet. Be the first to build in this district!"}
          </p>
          <button 
            onClick={fetchCitizens}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95"
          >
            {error ? "Reconnect Node" : "Initialize Building"}
          </button>
       </div>
    );
  }

  return (
    <div className="relative w-full aspect-square bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,1)] group">
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      <svg 
        ref={svgRef}
        viewBox={viewBox} 
        className="w-full h-full p-8 transition-all duration-1000 ease-in-out"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovered(null)}
      >
        {citizens.map(c => {
          const b = generateBuilding(c.score, c.profileType);
          const size = 60 + (c.score / 200);

          return (
            <g 
              key={c.id} 
              className={`cursor-pointer transition-all duration-300 hover:brightness-125 ${hovered?.id === c.id ? 'brightness-150' : ''}`}
              onMouseEnter={() => setHovered(c)}
              onClick={() => window.location.href = `/@${c.name}`}
            >
              <defs>
                <filter id={`glow-${c.id}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              
              <circle cx={c.x * 10} cy={c.y * 10 + size/2} r={size/4} fill={b.glowColor} className="opacity-30 blur-xl" />

              <g transform={`translate(${(c.x * 10) - size/2}, ${(c.y * 10) - size}) scale(${size/100})`}>
                <path 
                  d={b.svgPath} 
                  fill="transparent" 
                  stroke={b.color} 
                  strokeWidth="2"
                  filter={c.score > 5000 ? `url(#glow-${c.id})` : ''}
                  className="transition-all duration-500 ease-out"
                />
                <path 
                  d={b.svgPath} 
                  fill={b.color} 
                  fillOpacity="0.1"
                />
              </g>
            </g>
          );
        })}
      </svg>
      {/* Tooltip logic remains... */}

      {hovered && (
        <div 
          className="absolute z-50 pointer-events-none bg-slate-900/95 border border-slate-700 p-4 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in zoom-in duration-200"
          style={{ left: mousePos.x + 20, top: mousePos.y - 40 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-3 h-3 rounded-full ${generateBuilding(hovered.score, hovered.profileType).color === '#3b82f6' ? 'bg-blue-500' : 'bg-purple-500'}`} />
            <span className="text-white font-black text-sm">{hovered.name}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between gap-8 text-[10px] uppercase tracking-widest text-slate-500">
               <span>Influence Score</span>
               <span className="text-white font-bold">{hovered.score}</span>
            </div>
            <div className="flex justify-between gap-8 text-[10px] uppercase tracking-widest text-slate-500">
               <span>District</span>
               <span className="text-blue-400 font-bold">{hovered.district}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CityMap2D;
