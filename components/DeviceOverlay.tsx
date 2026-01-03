
import React from 'react';
import { Volume2, Sun, Wifi, ShieldAlert } from 'lucide-react';

interface DeviceOverlayProps {
  type: 'volume' | 'brightness' | 'security';
  value: number;
  themeColor: string;
}

const DeviceOverlay: React.FC<DeviceOverlayProps> = ({ type, value, themeColor }) => {
  const Icon = type === 'volume' ? Volume2 : type === 'brightness' ? Sun : ShieldAlert;
  
  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none animate-in fade-in zoom-in duration-300">
      <div className="bg-black/80 border border-white/10 backdrop-blur-3xl rounded-3xl p-8 flex flex-col items-center space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="w-16 h-16 rounded-full border-2 border-[var(--theme-color)] flex items-center justify-center animate-pulse shadow-[0_0_20px_var(--glow-color)]" style={{ borderColor: themeColor }}>
           <Icon size={32} className="text-[var(--theme-color)]" style={{ color: themeColor }} />
        </div>
        
        <div className="w-64 space-y-3">
          <div className="flex justify-between items-center text-[10px] font-orbitron text-white/40 uppercase tracking-[0.2em]">
            <span>{type}_LEVEL</span>
            <span className="text-white font-bold">{Math.round(value * 100)}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--theme-color)] transition-all duration-300" 
              style={{ width: `${value * 100}%`, backgroundColor: themeColor }} 
            />
          </div>
        </div>
        
        <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest">System Override Active</div>
      </div>
    </div>
  );
};

export default DeviceOverlay;
