
import React from 'react';
import { AgentInfo } from '../types';
import { Settings2, Power, ShieldCheck, Zap, Activity } from 'lucide-react';

interface ControlPanelProps {
  agents: AgentInfo[];
  onToggleAgent: (agentId: string) => void;
  themeColor: string;
  isOpen: boolean;
  onClose: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ agents, onToggleAgent, themeColor, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-end p-10 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-96 h-full bg-black/80 border border-white/10 backdrop-blur-3xl rounded-[3.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-in slide-in-from-right duration-500">
        <div className="p-10 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Settings2 size={24} className="text-[var(--theme-color)]" />
            <h2 className="font-orbitron text-xl font-black text-white uppercase tracking-widest">System Configuration</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40">
            <Activity size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
          <div className="space-y-6">
            <h3 className="text-[10px] font-orbitron text-white/30 uppercase tracking-[0.4em]">Sub-Agent Protocols</h3>
            <div className="space-y-4">
              {agents.map((agent) => (
                <div key={agent.id} className="p-5 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between group transition-all hover:bg-white/10">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{agent.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-white uppercase font-orbitron tracking-wider">{agent.name}</p>
                      <p className="text-[9px] text-white/30 font-mono italic">{agent.status === 'working' ? 'CORE_ACTIVE' : 'READY_STANDBY'}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => onToggleAgent(agent.id)}
                    className={`w-14 h-8 rounded-full relative transition-all duration-500 border-2 ${
                      agent.status === 'working' 
                        ? 'bg-[var(--theme-color)]/20 border-[var(--theme-color)]' 
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-500 ${
                      agent.status === 'working' 
                        ? 'left-7 bg-[var(--theme-color)] shadow-[0_0_10px_var(--glow-color)]' 
                        : 'left-1 bg-white/20'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-orbitron text-white/30 uppercase tracking-[0.4em]">Neural Stability</h3>
            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-mono text-white/40 uppercase"><span>Matrix Sync</span><span>98.4%</span></div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-400 w-[98.4%]" /></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-mono text-white/40 uppercase"><span>Emotional Resonance</span><span>MAX</span></div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-[var(--theme-color)] w-full" /></div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-10 border-t border-white/5 bg-white/5">
          <button 
            className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-orbitron text-[10px] tracking-[0.3em] uppercase hover:bg-red-500/20 transition-all flex items-center justify-center space-x-3"
            onClick={() => window.location.reload()}
          >
            <Zap size={14} />
            <span>Emergency Purge</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
