import React from 'react';

interface BuildingPreviewProps {
  score: number;
}

export const BuildingPreview2D: React.FC<BuildingPreviewProps> = ({ score }) => {
  // Height calculation: base height 100 + scale factor (max score 10000 -> 300px additional)
  const buildingHeight = 60 + (score / 10000) * 240;
  
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-end h-[400px] shadow-2xl overflow-hidden relative">
      {/* City Grid Background */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      {/* Building SVG */}
      <svg width="120" height="300" viewBox="0 0 120 300" className="relative z-10 drop-shadow-[0_0_15px_rgba(37,99,235,0.4)]">
        <defs>
          <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
        </defs>
        
        {/* Main Trunk */}
        <rect 
          x="30" 
          y={300 - buildingHeight} 
          width="60" 
          height={buildingHeight} 
          fill="url(#buildingGrad)" 
          className="transition-all duration-1000 ease-in-out"
        />
        
        {/* Windows */}
        {Array.from({ length: Math.floor(buildingHeight / 20) }).map((_, i) => (
          <g key={i} opacity={0.6}>
            <rect x="40" y={300 - buildingHeight + (i * 20) + 10} width="10" height="5" fill="#facc15" />
            <rect x="70" y={300 - buildingHeight + (i * 20) + 10} width="10" height="5" fill="#facc15" />
          </g>
        ))}

        {/* Antenna */}
        <line x1="60" y1={300 - buildingHeight - 15} x2="60" y2={300 - buildingHeight} stroke="#60a5fa" strokeWidth="2" />
        <circle cx="60" cy={300 - buildingHeight - 20} r="3" fill="#ef4444">
           <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>

      <div className="mt-6 text-center z-10">
        <h3 className="text-white font-bold text-lg mb-1 tracking-tight">Your Creator District</h3>
        <p className="text-blue-400 text-sm font-medium uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          Level {Math.floor(score / 500) + 1} Residence
        </p>
      </div>

      {/* Decorative Floor */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-slate-800"></div>
    </div>
  );
};

export default BuildingPreview2D;
