
import React from 'react';
import { Battery, Wifi, Navigation, Activity, Zap } from 'lucide-react';

interface ContextMonitorProps {
  battery: number;
  location: string;
  network: string;
  themeColor: string;
}

const ContextMonitor: React.FC<ContextMonitorProps> = ({ battery, location, network, themeColor }) => {
  return (
    <div className="bg-black/40 border border-white/5 backdrop-blur-3xl rounded-[2.5rem] p-6 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-orbitron text-white/30 uppercase tracking-[0.3em] flex items-center">
          <Activity size={14} className="mr-3 text-[var(--theme-color)]" /> Context_Awareness
        </h3>
        <span className="text-[8px] font-mono text-emerald-500 animate-pulse uppercase">Live_Stream</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Battery Widget */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <Battery size={14} className={battery < 25 ? 'text-red-400' : 'text-emerald-400'} />
            <span className="text-[10px] font-mono text-white/60">{battery}%</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${battery < 25 ? 'bg-red-400' : 'bg-emerald-400'}`} 
              style={{ width: `${battery}%` }} 
            />
          </div>
          <span className="text-[7px] font-orbitron text-white/20 uppercase tracking-tighter">Power_Core</span>
        </div>

        {/* Network Widget */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <Wifi size={14} className="text-[var(--theme-color)]" />
            <span className="text-[9px] font-mono text-white/60 truncate pl-2">{network}</span>
          </div>
          <div className="flex space-x-0.5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i < 4 ? 'bg-[var(--theme-color)]' : 'bg-white/10'}`} />
            ))}
          </div>
          <span className="text-[7px] font-orbitron text-white/20 uppercase tracking-tighter">Signal_Sync</span>
        </div>
      </div>

      {/* Location Bar */}
      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center space-x-4">
        <Navigation size={14} className="text-[var(--theme-color)]" />
        <div className="flex-1">
          <p className="text-[9px] font-mono text-white/80 leading-none">{location}</p>
          <p className="text-[7px] font-orbitron text-white/20 uppercase tracking-widest mt-1">Current_Nexus</p>
        </div>
        <Zap size={12} className="text-amber-400 animate-pulse" />
      </div>

      {/* Proactive Suggestion */}
      {battery < 25 && (
        <div className="p-3 bg-red-400/10 border border-red-400/20 rounded-xl animate-in slide-in-from-bottom-2">
          <p className="text-[8px] font-quicksand text-red-400 leading-tight">
            "Your battery level is critical. Should I enable the Power Saver protocol for you?"
          </p>
        </div>
      )}
    </div>
  );
};

export default ContextMonitor;
