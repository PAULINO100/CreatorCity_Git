'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface ScoreCardProps {
  score: number;
  breakdown: {
    stars: number;
    commits: number;
    repos: number;
    forks: number;
    languages: number;
  };
  calculatedAt: string;
  onRefresh: () => void;
  loading?: boolean;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ score, breakdown, calculatedAt, onRefresh, loading }) => {
  const router = useRouter();

  const handleRefresh = () => {
    onRefresh();
    router.refresh();
  };
  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 animate-pulse">
        <div className="h-8 w-48 bg-slate-800 mb-6 rounded"></div>
        <div className="h-16 w-32 bg-slate-800 mb-8 rounded"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-4 w-full bg-slate-800 rounded"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/20 transition-all"></div>
      
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Developer Influence Score</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-bold text-amber-400 leading-none">{score}</span>
            <span className="text-slate-500 font-medium">/ 10,000</span>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          title="Refresh Score"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <StatProgress label="GitHub Stars" value={breakdown.stars} max={3000} color="bg-amber-400" />
          <StatProgress label="Recent Commits" value={breakdown.commits} max={2500} color="bg-blue-500" />
          <StatProgress label="Public Repos" value={breakdown.repos} max={1500} color="bg-indigo-500" />
        </div>
        <div className="space-y-4">
          <StatProgress label="Forks Earned" value={breakdown.forks} max={1500} color="bg-purple-500" />
          <StatProgress label="Linguistic Stack" value={breakdown.languages} max={1500} color="bg-emerald-500" />
        </div>
      </div>

      <div className="pt-6 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
        <span>Protocol Version: <strong>v1.0 (Phase 0)</strong></span>
        <span>Last Sync: {new Date(calculatedAt).toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

const StatProgress: React.FC<{ label: string, value: number, max: number, color: string }> = ({ label, value, max, color }) => {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-slate-400 font-medium">{label}</span>
        <span className="text-slate-300">{value} pts</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(0,0,0,0.3)]`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ScoreCard;
