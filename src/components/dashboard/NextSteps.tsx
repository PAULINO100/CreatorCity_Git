import React from 'react';

export const NextSteps: React.FC = () => {
  const steps = [
    { title: 'Connect YouTube', desc: 'Sync your video creator stats to boost CIS score.', icon: '📺', action: 'Soon', active: false },
    { title: 'Invite Creators', desc: 'Earn City Credits for every verified referral.', icon: '🤝', action: 'Share', active: true },
    { title: 'Personalize Base', desc: 'Change architectural style of your building.', icon: '🏗️', action: 'Customize', active: true },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
      <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-3">
        Citizenship Roadmap
        <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">Phase 0</span>
      </h3>
      
      <div className="space-y-4">
        {steps.map((step, i) => (
          <div 
            key={i} 
            className={`flex items-center justify-between p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all ${step.active ? 'cursor-pointer hover:bg-slate-800/50' : 'opacity-60 grayscale'}`}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{step.icon}</span>
              <div>
                <h4 className="text-slate-200 font-semibold">{step.title}</h4>
                <p className="text-slate-500 text-xs">{step.desc}</p>
              </div>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md ${step.active ? 'bg-amber-400/10 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
              {step.action}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NextSteps;
