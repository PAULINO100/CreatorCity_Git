'use client';

import React, { useState } from 'react';

interface User {
  id: string;
  name: string;
  avatar: string;
  district: string;
}

export const VotingPanel: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [voteValue, setVoteValue] = useState(0.5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Mock nearby users
  const nearbyUsers: User[] = [
    { id: 'user-1', name: 'Elias Thorne', avatar: 'https://i.pravatar.cc/150?u=1', district: 'Financial' },
    { id: 'user-2', name: 'Lyra Vance', avatar: 'https://i.pravatar.cc/150?u=2', district: 'Central' },
    { id: 'user-3', name: 'Kaelen Voss', avatar: 'https://i.pravatar.cc/150?u=3', district: 'Nexus' },
  ];

  const handleVote = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/reputation/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: selectedUser.id, voteValue }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Vote failed');

      setFeedback({ type: 'success', message: `Vote for ${selectedUser.name} recorded successfully.` });
      setSelectedUser(null);
      setShowConfirm(false);
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setFeedback({ type: 'error', message: err.message });
      setShowConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[400px]">
      {/* User List */}
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-800 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Nearby Citizens
        </h3>
        <div className="space-y-3">
          {nearbyUsers.map(user => (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${selectedUser?.id === user.id ? 'bg-blue-600/10 border-blue-500/50' : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'}`}
            >
              <img src={user.avatar} alt="" className="w-8 h-8 rounded-full border border-slate-800" />
              <div className="text-left">
                <p className="text-slate-200 text-sm font-bold">{user.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tight">{user.district} District</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Voting Control */}
      <div className="flex-1 p-8 flex flex-col justify-center relative">
        {!selectedUser ? (
          <div className="text-center py-12">
             <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🗳️</div>
             <p className="text-slate-500 text-sm">Select a citizen to validate their reputation.</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h4 className="text-white text-xl font-black mb-1">Reputation Validation</h4>
            <p className="text-slate-500 text-sm mb-8">How much do you trust <span className="text-blue-400 font-bold">{selectedUser.name}</span>&apos;s technical contributions?</p>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">Trust Value</span>
                  <span className="text-amber-400 font-black text-lg">{(voteValue).toFixed(2)}</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.05" value={voteValue} 
                  onChange={(e) => setVoteValue(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <div className="flex justify-between text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                  <span>Downvote</span>
                  <span>Neutral</span>
                  <span>Endorsement</span>
                </div>
              </div>

              <button 
                onClick={() => setShowConfirm(true)}
                className="w-full h-12 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl transition-all shadow-[0_0_20px_rgba(251,191,36,0.2)] uppercase tracking-widest"
              >
                Submit Validation
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Modal Overlay */}
        {showConfirm && selectedUser && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-20 flex items-center justify-center p-8 text-center animate-in fade-in duration-200">
             <div className="max-w-xs">
                <h5 className="text-white font-bold text-lg mb-2">Confirm Validation</h5>
                <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                   Your vote will be weighted by your own reputation score. This action cannot be undone for 7 days.
                </p>
                <div className="flex gap-4">
                  <button onClick={() => setShowConfirm(false)} className="flex-1 h-10 border border-slate-800 text-slate-400 rounded-lg font-bold text-xs hover:bg-slate-900">Cancel</button>
                  <button onClick={handleVote} disabled={isSubmitting} className="flex-1 h-10 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-500 shadow-lg shadow-blue-900/40">
                    {isSubmitting ? 'Processing...' : 'Confirm'}
                  </button>
                </div>
             </div>
          </div>
        )}

        {/* Feedback Message */}
        {feedback && (
          <div className={`mt-6 p-3 rounded-lg text-center text-xs font-medium border animate-bounce ${feedback.type === 'success' ? 'bg-emerald-900/10 border-emerald-900/50 text-emerald-400' : 'bg-red-900/10 border-red-900/50 text-red-400'}`}>
            {feedback.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default VotingPanel;
