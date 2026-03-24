/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const DISTRICT_COLORS: Record<string, string> = {
  tech: '#3b82f6', creator: '#a855f7', science: '#22c55e',
  education: '#eab308', startup: '#f97316'
};

interface UserProfile {
  id: string;
  username: string;
  name: string;
  stars: number;
  dis_score: number;
  bio?: string;
  avatar_url?: string;
  location?: string;
  top_repos?: any[];
  district?: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = (params.username as string).replace('%40', '').replace('@', '');
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/search/user/${username}`);
        if (!res.ok) throw new Error('User not found');
        const data = await res.json();
        setUser(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <h1 className="text-4xl font-black mb-4">CITIZEN NOT FOUND</h1>
        <p className="text-slate-400 mb-8">This identity hasn&apos;t been mapped to Atlas City yet.</p>
        <button 
          onClick={() => router.push('/city')}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold uppercase tracking-widest text-xs transition-all"
        >
          Return to City
        </button>
      </div>
    );
  }

  const districtColor = user.district ? DISTRICT_COLORS[user.district.toLowerCase()] || '#64748b' : null;

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans p-4 md:p-12 lg:p-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* Avatar & Basic Info */}
          <div className="shrink-0">
             <div className="w-48 h-48 rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-900 mb-6 group relative">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">👤</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
             </div>
             <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Global Influence</div>
                <div className="text-3xl font-black text-blue-500 mb-1">DIS {user.dis_score}</div>
                <div className="text-xs text-slate-400">Based on GitHub Impact</div>
             </div>
          </div>

          {/* Detailed Info */}
          <div className="flex-1">
             <span className="text-amber-400 text-xs font-bold uppercase tracking-[0.4em] mb-4 block">Citizen Profile</span>
             <h1 className="text-6xl font-black tracking-tighter mb-2 italic">@{user.username}</h1>
             <p className="text-xl text-slate-400 font-medium mb-8 leading-relaxed max-w-xl">
               {user.bio || "A technical pioneer exploring the frontiers of open source and digital governance in Atlas City."}
             </p>

             <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                   <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Total Stars</div>
                   <div className="text-2xl font-bold">{user.stars}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                   <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Status</div>
                   <div className="text-2xl font-bold text-green-500">Node Online</div>
                </div>
             </div>

             {/* District Badge */}
             {user.district && districtColor && (
               <div 
                 className="mb-8 p-4 rounded-2xl border flex items-center gap-4"
                 style={{ 
                   backgroundColor: `${districtColor}10`, 
                   borderColor: `${districtColor}30` 
                 }}
               >
                 <div 
                   className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                   style={{ backgroundColor: `${districtColor}20` }}
                 >
                   {user.district.toLowerCase() === 'tech' ? '🔵' : 
                    user.district.toLowerCase() === 'creator' ? '🟣' :
                    user.district.toLowerCase() === 'science' ? '🟢' :
                    user.district.toLowerCase() === 'education' ? '🟡' : '🟠'}
                 </div>
                 <div>
                   <div 
                     className="text-sm font-black uppercase tracking-widest"
                     style={{ color: districtColor }}
                   >
                     {user.district} District
                   </div>
                   <div className="text-xs text-slate-400">Official district citizen</div>
                 </div>
               </div>
             )}

             <div className="flex gap-4">
                <button 
                  onClick={() => router.push(`/city?user=${user.username}`)}
                  className="px-8 py-4 bg-white text-black rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-200 transition-all active:scale-95 shadow-xl shadow-white/5"
                >
                  Locate in City
                </button>
                <button 
                  onClick={() => window.open(`https://github.com/${user.username}`, '_blank')}
                  className="px-8 py-4 bg-slate-900 text-white border border-slate-800 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition-all active:scale-95"
                >
                  GitHub History
                </button>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
