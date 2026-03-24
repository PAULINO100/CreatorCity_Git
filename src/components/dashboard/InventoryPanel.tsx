'use client';

import React, { useState, useEffect } from 'react';

interface PurchaseItem {
  id: string;
  equipped: boolean;
  item: {
    id: string;
    name: string;
    category: string;
    rarity: string;
  };
}

export function InventoryPanel() {
  const [inventory, setInventory] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/user/me') // Assuming we can fetch inventory here or we build a small fetcher
      .then(res => res.json())
      .then(() => {
        // If /api/user/me doesn't return inventory, we will need to augment it or create a new endpoint.
        // Wait, I didn't create an endpoint for GET inventory explicitly because we can get it from the session user or a new route.
        // Let's create `fetchInventory` internally.
      });

    const init = async () => {
      try {
        const res = await fetch('/api/marketplace/inventory');
        if (res.ok) {
          const data = await res.json();
          setInventory(data.inventory || []);
        }
      } catch {}
      setLoading(false);
    };
    init();
  }, []);

  const handleEquip = async (purchaseId: string, itemId: string) => {
    setProcessing(purchaseId);
    try {
      const res = await fetch('/api/marketplace/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      });
      if (res.ok) {
        const data = await res.json();
        // Optimistic update
        setInventory(prev => prev.map(p => {
          if (p.item.category === data.item.category) {
            return { ...p, equipped: p.id === purchaseId ? data.equipped : false };
          }
          return p;
        }));
      }
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <div className="animate-pulse text-slate-500 text-sm">Accessing 3D Nodes...</div>;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest">3D Node Inventory</h3>
      
      {inventory.length === 0 ? (
        <div className="text-slate-500 text-sm bg-slate-950 p-6 rounded-xl border border-dashed border-slate-800 text-center">
          You haven&apos;t acquired any 3D assets yet.<br/>
          <span className="text-[10px] uppercase tracking-widest mt-2 block">Visit the Extranet Store</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map(p => (
            <div key={p.id} className={`p-4 rounded-xl border flex flex-col justify-between ${p.equipped ? 'bg-blue-900/20 border-blue-500' : 'bg-slate-950 border-slate-800'}`}>
               <div>
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{p.item.category}</span>
                   {p.equipped && <span className="text-[9px] bg-blue-500 text-white px-2 py-0.5 rounded font-bold uppercase tracking-widest">Equipped</span>}
                 </div>
                 <h4 className="text-sm font-bold text-white">{p.item.name}</h4>
                 <p className="text-[10px] text-slate-400 uppercase mt-1 opacity-70">{p.item.rarity}</p>
               </div>
               
               <button
                 disabled={processing === p.id}
                 onClick={() => handleEquip(p.id, p.item.id)}
                 className={`mt-4 w-full py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${
                   p.equipped 
                     ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' 
                     : 'bg-white text-black hover:bg-slate-200'
                 }`}
               >
                 {processing === p.id ? 'Wait...' : p.equipped ? 'Unequip' : 'Equip'}
               </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
