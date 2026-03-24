'use client';

import React, { useState, useEffect } from 'react';

interface DistrictInfo {
  id: string;
  name: string;
  description: string;
  theme_color: string;
  min_score: number;
  bonus_multiplier: number;
  bonus_label: string;
  icon_svg: string;
  requirement_label: string;
  citizenCount?: number;
}

interface DistrictShowcaseProps {
  userScore: number;
  hasClaimed: boolean;
  onClaim?: (districtId: string) => void;
}

export const DistrictShowcase: React.FC<DistrictShowcaseProps> = ({ userScore, hasClaimed, onClaim }) => {
  const [districts, setDistricts] = useState<DistrictInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [claimResult, setClaimResult] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/districts')
      .then(r => r.json())
      .then(data => { setDistricts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleClaim = async (districtId: string) => {
    if (hasClaimed || claiming) return;
    setClaiming(districtId);
    setClaimResult(null);
    try {
      const res = await fetch('/api/districts/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ districtId })
      });
      const data = await res.json();
      if (res.ok) {
        setClaimResult(`✅ ${data.message}`);
        onClaim?.(districtId);
      } else {
        setClaimResult(`❌ ${data.error}`);
      }
    } catch {
      setClaimResult('❌ Network error');
    } finally {
      setClaiming(null);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-slate-900/50 rounded-2xl p-8 text-center">
        <div className="text-slate-500 text-xs uppercase tracking-widest">Loading Districts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-white">City Districts</h3>
          <p className="text-slate-400 text-sm mt-1">Claim your district to unlock exclusive bonuses</p>
        </div>
        {hasClaimed && (
          <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold uppercase tracking-widest border border-green-500/20 rounded-lg">
            District Claimed ✓
          </span>
        )}
      </div>

      {claimResult && (
        <div className={`p-4 rounded-xl text-sm font-medium ${claimResult.startsWith('✅') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {claimResult}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {districts.map(d => {
          const eligible = userScore >= d.min_score;
          const isActive = !hasClaimed && eligible;
          
          return (
            <div 
              key={d.id || d.name}
              className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${
                isActive 
                  ? 'border-slate-700 hover:border-opacity-60 hover:shadow-lg cursor-pointer group' 
                  : 'border-slate-800 opacity-60'
              }`}
              style={{ 
                background: `linear-gradient(135deg, ${d.theme_color}08 0%, transparent 60%)`,
                borderColor: isActive ? `${d.theme_color}40` : undefined
              }}
            >
              {/* District Icon */}
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${d.theme_color}15`, border: `1px solid ${d.theme_color}30` }}
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke={d.theme_color} strokeWidth="1.5">
                  <path d={d.icon_svg} />
                </svg>
              </div>

              {/* District Info */}
              <h4 className="text-lg font-black text-white mb-1">{d.name}</h4>
              <p className="text-slate-400 text-xs leading-relaxed mb-4 line-clamp-2">{d.description}</p>
              
              {/* Stats */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-[10px] uppercase tracking-widest">
                  <span className="text-slate-500">Requirement</span>
                  <span className={eligible ? 'text-green-400' : 'text-red-400'}>{d.requirement_label}</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-widest">
                  <span className="text-slate-500">Bonus</span>
                  <span style={{ color: d.theme_color }}>{d.bonus_label}</span>
                </div>
                {d.citizenCount !== undefined && (
                  <div className="flex justify-between text-[10px] uppercase tracking-widest">
                    <span className="text-slate-500">Citizens</span>
                    <span className="text-white">{d.citizenCount}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {!hasClaimed && (
                <button
                  onClick={() => isActive && handleClaim(d.id || d.name.toLowerCase())}
                  disabled={!isActive || !!claiming}
                  className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    isActive
                      ? 'text-white hover:brightness-110 active:scale-95 shadow-lg'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                  style={isActive ? { backgroundColor: d.theme_color, boxShadow: `0 8px 25px ${d.theme_color}30` } : undefined}
                >
                  {claiming === (d.id || d.name.toLowerCase()) ? 'Claiming...' : eligible ? 'Claim District' : 'Score Too Low'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DistrictShowcase;
