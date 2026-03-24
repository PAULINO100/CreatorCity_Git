'use client';

import React, { useState, useEffect } from 'react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon_svg: string;
  reward_cc: number;
  rarity: string;
  claimed: boolean;
  unlocked: boolean;
}

interface BadgeUIProps {
  onClose: () => void;
  onClaimSuccess?: (newBalance: number) => void;
}

export const BadgeUI: React.FC<BadgeUIProps> = ({ onClose, onClaimSuccess }) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await fetch('/api/badges'); 
        if (res.ok) {
          const data = await res.json();
          setBadges(data);
        }
      } catch (err) {
        console.error("Failed to fetch badges", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, []);

  const handleClaim = async (badgeId: string) => {
    setClaimingId(badgeId);
    try {
      const res = await fetch('/api/badges/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeId })
      });
      const result = await res.json();
      if (res.ok) {
        setBadges(prev => prev.map(b => b.id === badgeId ? { ...b, claimed: true } : b));
        if (onClaimSuccess) onClaimSuccess(result.newBalance);
      } else {
        alert(result.error || "Failed to claim reward");
      }
    } catch (err) {
      console.error("Claim error", err);
    } finally {
      setClaimingId(null);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-slate-400 border-slate-700 bg-slate-800/50';
      case 'rare': return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
      case 'epic': return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
      case 'legendary': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      default: return 'text-slate-400 border-slate-700 bg-slate-800/50';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-950/50">
          <div>
            <h2 className="text-xl font-black text-white tracking-widest uppercase">Citizen Achievements</h2>
            <p className="text-slate-500 text-[10px] font-bold tracking-[0.2em] mt-1 uppercase">Claim CC rewards for city growth</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Scanning blockchain...</span>
            </div>
          ) : badges.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-500 uppercase text-xs font-bold tracking-widest">No achievements discovered yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {badges.map((badge) => (
                <div 
                  key={badge.id}
                  className={`relative p-5 rounded-2xl border transition-all duration-300 ${badge.unlocked ? 'opacity-100' : 'opacity-40 grayscale'}`}
                >
                  <div className="flex items-center gap-5">
                    {/* Icon Container */}
                    <div className={`w-14 h-14 shrink-0 rounded-xl border flex items-center justify-center ${getRarityColor(badge.rarity)}`}>
                      <svg className="w-8 h-8" viewBox="0 0 100 100" fill="currentColor">
                        <path d={badge.icon_svg} />
                      </svg>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-200 text-sm">{badge.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${getRarityColor(badge.rarity)}`}>
                          {badge.rarity}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs leading-relaxed">{badge.description}</p>
                    </div>

                    {/* Reward & Button */}
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1.5 text-amber-400 font-black text-sm">
                        <span>+{badge.reward_cc}</span>
                        <span className="text-[9px] uppercase tracking-tighter">CC</span>
                      </div>

                      {badge.claimed ? (
                        <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-500 text-[9px] font-black rounded uppercase">
                          Claimed
                        </span>
                      ) : badge.unlocked ? (
                        <button
                          onClick={() => handleClaim(badge.id)}
                          disabled={!!claimingId}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black rounded uppercase transition-colors disabled:opacity-50"
                        >
                          {claimingId === badge.id ? 'Claiming...' : 'Claim Reward'}
                        </button>
                      ) : (
                        <span className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-500 text-[9px] font-black rounded uppercase">
                          Locked
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-slate-950/20 text-center">
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.3em]">Atlas City Achievement Protocol v1.0.4</p>
        </div>
      </div>
    </div>
  );
};
