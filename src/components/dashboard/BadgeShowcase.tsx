'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon_svg: string;
  reward_cc: number;
  unlocked: boolean;
  claimed: boolean;
  rarity: string;
}

export const BadgeShowcase: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchBadges = async () => {
    try {
      const res = await fetch('/api/badges');
      const data = await res.json();
      if (res.ok) setBadges(data);
    } catch (err) {
      console.error("Failed to fetch badges:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const handleClaim = async (badgeId: string) => {
    try {
      const res = await fetch('/api/badges/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeId })
      });
      const data = await res.json();
      
      if (res.ok) {
        fetchBadges();
        showToast(`Badge Reward Collected!`, 'success', '🏆');
      } else {
        showToast(data.error || "Claim failed", 'error');
      }
    } catch (err) {
      console.error("Claim failed:", err);
      showToast("Network error", 'error');
    }
  };

  const rarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-amber-400 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]';
      case 'epic': return 'text-purple-400 border-purple-400';
      case 'rare': return 'text-blue-400 border-blue-400';
      default: return 'text-slate-400 border-slate-700';
    }
  };

  if (loading) return <div className="h-40 bg-slate-900/50 animate-pulse rounded-2xl"></div>;

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Citizen Achievements</div>
          <h3 className="text-xl font-black text-white">BADGE SHOWCASE</h3>
        </div>
        <div className="bg-slate-800/50 px-3 py-1 rounded-full text-[10px] text-slate-400 font-bold">
          {badges.filter(b => b.unlocked).length} / {badges.length} UNLOCKED
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {badges.map(badge => (
          <div 
            key={badge.id}
            className={`relative group flex flex-col items-center p-4 rounded-xl border transition-all duration-300 ${badge.unlocked ? `bg-slate-900 ${rarityColor(badge.rarity)}` : 'bg-slate-950/50 opacity-40 border-slate-800 grayscale'}`}
          >
            <div className="w-12 h-12 mb-3 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-current opacity-80 group-hover:opacity-100 transition-opacity">
                <path d={badge.icon_svg} />
              </svg>
            </div>
            
            <span className="text-[10px] font-black uppercase text-center leading-tight mb-1">{badge.name}</span>
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">{badge.rarity}</span>

            <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full w-48 bg-slate-950 border border-slate-800 p-3 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50">
               <div className="text-[10px] font-black mb-1">{badge.name}</div>
               <div className="text-[9px] text-slate-400 font-medium leading-relaxed">{badge.description}</div>
               {badge.unlocked && badge.claimed && (
                 <div className="mt-2 text-[8px] text-amber-500 font-black uppercase tracking-widest">Rewared Claimed</div>
               )}
            </div>

            {badge.unlocked && !badge.claimed && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleClaim(badge.id); }}
                className="mt-2 w-full py-1 bg-amber-400 text-slate-950 text-[9px] font-black rounded hover:bg-amber-300 transition-colors animate-bounce"
              >
                CLAIM {badge.reward_cc} CC
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BadgeShowcase;
