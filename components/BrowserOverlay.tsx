
import React, { useState, useEffect } from 'react';
import { X, Globe, Shield, Activity, RefreshCw, Lock, ExternalLink, MousePointer2, Cpu } from 'lucide-react';

interface BrowserOverlayProps {
  url: string;
  themeColor: string;
  isAutomating: boolean;
  onClose: () => void;
}

const BrowserOverlay: React.FC<BrowserOverlayProps> = ({ url, themeColor, isAutomating, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [securityStatus, setSecurityStatus] = useState('Verifying SSL...');
  const [autoPos, setAutoPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
      setSecurityStatus('Link Established');
    }, 2000);
    return () => clearTimeout(timer);
  }, [url]);

  useEffect(() => {
    if (isAutomating) {
      const interval = setInterval(() => {
        setAutoPos({
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60
        });
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isAutomating]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-20 animate-in fade-in zoom-in duration-500">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full h-full bg-black/90 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-white/10 bg-white/5 flex items-center px-6 justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex space-x-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500/50" /><div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" /><div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" /></div>
            <div className="flex-1 max-w-xl flex items-center bg-black/40 border border-white/5 rounded-lg px-4 py-1.5 space-x-3">
              <Lock size={12} className="text-emerald-400 opacity-50" />
              <span className="text-xs font-mono text-white/40 truncate">{url}</span>
              <RefreshCw size={12} className={`text-white/20 ${loading ? 'animate-spin' : ''}`} />
            </div>
          </div>
          
          <div className="flex items-center space-x-6 pl-6 border-l border-white/5">
            <div className="flex flex-col items-end">
              <p className="text-[7px] font-orbitron text-white/20 uppercase">Network Matrix</p>
              <p className="text-[9px] font-bold text-emerald-400">{securityStatus.toUpperCase()}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"><X size={18} /></button>
          </div>
        </div>

        {/* Browser Content View */}
        <div className="flex-1 relative bg-black/20 overflow-hidden flex">
          <div className="flex-1 relative">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 border-2 border-transparent border-t-[var(--theme-color)] rounded-full animate-spin" />
                <p className="text-[var(--theme-color)] text-[10px] font-orbitron tracking-widest animate-pulse">Syncing Matrix...</p>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                 <Globe size={120} className="text-[var(--theme-color)] opacity-[0.03] absolute" />
                 
                 {/* Automation Indicators */}
                 {isAutomating && (
                   <div className="absolute inset-0 pointer-events-none">
                      {/* Simulated Click Point */}
                      <div 
                        className="absolute transition-all duration-1000 ease-in-out"
                        style={{ left: `${autoPos.x}%`, top: `${autoPos.y}%` }}
                      >
                         <div className="relative">
                            <MousePointer2 size={16} className="text-amber-400 -rotate-12" />
                            <div className="absolute -inset-4 border border-amber-400/50 rounded-full animate-ping" />
                            <div className="absolute top-6 left-2 bg-amber-400/10 border border-amber-400/50 px-2 py-0.5 rounded backdrop-blur">
                               <p className="text-[7px] font-orbitron text-amber-400 whitespace-nowrap">AUTO_INJECT: CLICK_0x7F</p>
                            </div>
                         </div>
                      </div>

                      {/* Scanning HUD Overlay */}
                      <div className="absolute inset-0 border-[20px] border-amber-400/5 opacity-10" />
                      <div className="absolute top-10 right-10 flex flex-col items-end space-y-1">
                         {[...Array(5)].map((_, i) => (
                           <div key={i} className="h-1 bg-amber-400/20 animate-pulse" style={{ width: `${40 + Math.random() * 100}px`, animationDelay: `${i*0.2}s` }} />
                         ))}
                      </div>
                   </div>
                 )}

                 <div className="text-center space-y-4 max-w-lg relative z-10">
                    <h3 className="font-orbitron text-white/80 text-lg uppercase tracking-wider">Web Interface Layer</h3>
                    <p className="text-white/40 text-xs font-mono leading-relaxed">
                       {isAutomating ? 
                        "AI CORE IS ACTIVELY CONTROLLING THIS INSTANCE. KEY STROKES AND MOUSE EVENTS ARE BEING EMULATED VIA THE AUTOMATION ENGINE." :
                        "INTERFACE IS ACTIVE. AGENTS ARE MONITORING FOR DATA EXTRACTION OPPORTUNITIES."
                       }
                    </p>
                    <div className="flex items-center justify-center space-x-12 mt-12">
                       <div className="text-center"><p className="text-[8px] text-white/20 font-orbitron uppercase mb-1">Status</p><p className="text-xs font-bold text-emerald-400">READY</p></div>
                       <div className="text-center"><p className="text-[8px] text-white/20 font-orbitron uppercase mb-1">Latency</p><p className="text-xs font-bold text-white/60">4ms</p></div>
                       <div className="text-center"><p className="text-[8px] text-white/20 font-orbitron uppercase mb-1">Control</p><p className={`text-xs font-bold ${isAutomating ? 'text-amber-400' : 'text-white/60'}`}>{isAutomating ? 'AI_MASTER' : 'USER'}</p></div>
                    </div>
                 </div>
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="w-64 bg-black/40 border-l border-white/5 p-6 space-y-8">
             <div className="space-y-4">
               <h4 className="text-[9px] font-orbitron text-white/30 uppercase tracking-widest flex items-center"><Shield size={10} className="mr-2 text-emerald-400" /> Security Layer</h4>
               <div className="space-y-2 font-mono text-[8px]">
                 <div className="flex justify-between"><span>SSL_CERT</span><span className="text-emerald-400">VALID</span></div>
                 <div className="flex justify-between"><span>ADS_BLOCK</span><span className="text-emerald-400">100%</span></div>
               </div>
             </div>

             <div className="space-y-4">
               <h4 className="text-[9px] font-orbitron text-white/30 uppercase tracking-widest flex items-center"><Activity size={10} className="mr-2 text-[var(--theme-color)]" /> Data Flow</h4>
               <div className="space-y-2 font-mono text-[8px]">
                 <div className="flex justify-between"><span>BANDWIDTH</span><span>840 MB/S</span></div>
                 <div className="flex justify-between"><span>SCRAPE_LVL</span><span>OPTIMIZED</span></div>
               </div>
             </div>

             {isAutomating && (
               <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-4 mt-auto space-y-3">
                  <div className="flex items-center justify-between">
                     <Cpu size={14} className="text-amber-400" />
                     <span className="text-[8px] font-orbitron text-amber-400 animate-pulse">AUTO_OPS</span>
                  </div>
                  <p className="text-[7px] font-mono text-white/40 leading-tight">AI is identifying DOM elements for sequential interaction. Interference not recommended.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserOverlay;
