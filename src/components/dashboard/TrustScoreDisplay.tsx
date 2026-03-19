import React from 'react';

interface TrustScoreDisplayProps {
  trustScore: number;
  status: string;
}

export const TrustScoreDisplay: React.FC<TrustScoreDisplayProps> = ({ trustScore, status }) => {
  const percentage = trustScore * 100;
  
  const getStatusColor = () => {
    if (trustScore >= 0.7) return 'text-amber-400 border-amber-400/30 bg-amber-400/5';
    if (trustScore <= 0.3) return 'text-red-400 border-red-400/30 bg-red-400/5';
    return 'text-blue-400 border-blue-400/30 bg-blue-400/5';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden relative group">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Social Trust Index</h3>
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor()}`}>
          {status}
        </span>
      </div>

      <div className="flex items-center gap-8">
        {/* Simple Radial Gauge Mockup */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-800" />
            <circle 
              cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" 
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * trustScore)}
              className={`${trustScore >= 0.7 ? 'text-amber-400' : 'text-blue-500'} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-2xl font-black tracking-tighter text-white">
            {Math.round(percentage)}
            <span className="text-[10px] text-slate-500 ml-0.5">%</span>
          </span>
        </div>

        <div className="flex-1 space-y-3">
          <p className="text-slate-300 text-sm leading-relaxed">
            Your status is calculated from <strong className="text-white">Peer Votes</strong>, weighted by voter reputation and adjusted for decay.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
             <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Sybil Protected</span>
             <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Decay Active</span>
          </div>
        </div>
      </div>
      
      {/* Decorative Gradient Overlay */}
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/10 blur-[60px] pointer-events-none"></div>
    </div>
  );
};

export default TrustScoreDisplay;
