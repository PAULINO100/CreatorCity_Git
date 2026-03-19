'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';

interface Transaction {
  type: 'earn' | 'spend' | 'claim';
  amount: number;
  date: string;
  description: string;
}

const REWARD_TABLE = { DAILY_CLAIM: 10 };

export const CreditsDisplay: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [cooldown, setCooldown] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/economy/balance');
      const data = await res.json();
      if (res.ok) {
        setBalance(data.balance);
        setHistory(data.history);
      }
    } catch (err) {
      console.error("Failed to fetch credits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const res = await fetch('/api/economy/claim-daily', { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        setBalance(data.balance);
        fetchStats();
        showToast(`+${REWARD_TABLE.DAILY_CLAIM} CC Collected!`, 'success', '💰');
      } else {
        setCooldown(data.error);
        setTimeout(() => setCooldown(null), 3000);
        showToast(data.error || "Claim failed", 'error');
      }
    } catch (err) {
      console.error("Claim failed:", err);
      showToast("Claim aborted", 'error');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) return <div className="h-40 bg-slate-900/50 animate-pulse rounded-2xl"></div>;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-950">
        <div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">City Balance</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{balance}</span>
            <span className="text-amber-400 font-bold text-xs">CC</span>
          </div>
        </div>
        <button 
          onClick={handleClaim}
          disabled={claiming}
          className={`h-10 px-6 rounded-xl font-bold text-xs transition-all ${cooldown ? 'bg-red-900/20 text-red-500 border border-red-900/50' : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.3)]'}`}
        >
          {claiming ? '...' : cooldown ? 'Wait 24h' : 'Claim Daily'}
        </button>
      </div>

      <div className="p-4 bg-slate-950/50">
        <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-3">Transaction History</div>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
          {history.length === 0 ? (
            <div className="text-center py-8 text-slate-700 text-[10px] uppercase font-bold italic">No transactions recorded</div>
          ) : (
            history.map((t, i) => (
              <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-slate-900/50 border border-slate-800/50 hover:border-slate-700 transition-colors">
                <div className="flex flex-col">
                  <span className="text-[11px] text-slate-200 font-semibold">{t.description}</span>
                  <span className="text-[9px] text-slate-500">{new Date(t.date).toLocaleDateString()}</span>
                </div>
                <span className={`text-xs font-black ${t.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {t.amount > 0 ? '+' : ''}{t.amount}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditsDisplay;
