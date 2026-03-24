'use client';

import React, { useState, useEffect } from 'react';

interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price_cc: number;
  rarity: string;
  preview_url: string | null;
}

const CATEGORIES = ['facade', 'lighting', 'garden', 'effect', 'signature'];
const RARITY_COLORS: Record<string, string> = {
  common: 'text-slate-300 border-slate-700 bg-slate-800/50',
  rare: 'text-blue-400 border-blue-500/50 bg-blue-900/20',
  epic: 'text-purple-400 border-purple-500/50 bg-purple-900/20',
  legendary: 'text-amber-400 border-amber-500/50 bg-amber-900/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
};

export function MarketplaceUI({ userBalance, districtClaimed }: { userBalance: number, districtClaimed: boolean }) {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [activeTab, setActiveTab] = useState(CATEGORIES[0]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [currentBalance, setCurrentBalance] = useState(userBalance);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    fetch('/api/marketplace/items')
      .then(r => r.json())
      .then(data => {
        setItems(data.items || []);
        setLoading(false);
      });
  }, []);

  const handlePurchase = async (item: MarketplaceItem) => {
    setProcessingId(item.id);
    setMessage(null);
    try {
      const res = await fetch('/api/marketplace/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Purchase failed');
      
      setCurrentBalance(data.newBalance);
      setMessage({ text: `Successfully purchased ${item.name}!`, type: 'success' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading Extranet Store...</div>;

  const filteredItems = items.filter(i => i.category === activeTab);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">City Extranet Store</h2>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Acquire assets for your 3D Node</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Available Balance</div>
          <div className="text-2xl font-black text-amber-400">{currentBalance.toLocaleString()} CC</div>
        </div>
      </div>

      {message && (
        <div className={`p-4 text-center text-sm font-bold uppercase tracking-widest ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto scroolbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-6 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap transition-colors ${
              activeTab === cat 
                ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/5' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Item Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-900/20">
        {filteredItems.map(item => {
          const discount = districtClaimed ? 0.10 : 0;
          const finalPrice = Math.floor(item.price_cc * (1 - discount));
          const canAfford = currentBalance >= finalPrice;

          return (
            <div key={item.id} className={`border rounded-2xl p-5 flex flex-col justify-between transition-all hover:-translate-y-1 ${RARITY_COLORS[item.rarity] || RARITY_COLORS.common}`}>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{item.rarity}</span>
                  {districtClaimed && <span className="bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded uppercase font-bold">-10% District</span>}
                </div>
                <h3 className="text-lg font-black mb-2 opacity-90">{item.name}</h3>
                <p className="text-sm opacity-70 leading-relaxed min-h-[3rem]">{item.description}</p>
              </div>

              <div className="mt-6 pt-6 border-t border-current/10 flex justify-between items-center">
                <div className="font-black text-xl opacity-90">{finalPrice} CC</div>
                <button
                  disabled={!canAfford || processingId === item.id}
                  onClick={() => handlePurchase(item)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    canAfford
                      ? 'bg-white text-black hover:bg-slate-200 shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed hidden'
                  }`}
                >
                  {processingId === item.id ? 'Processing...' : 'Acquire'}
                </button>
                {!canAfford && <span className="text-[10px] text-red-400/80 font-bold uppercase">Insufficient Funds</span>}
              </div>
            </div>
          );
        })}
        {filteredItems.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 text-sm tracking-widest uppercase">
            No stock available in this category.
          </div>
        )}
      </div>
    </div>
  );
}
