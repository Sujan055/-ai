
import React from 'react';
import { AgentInfo, ThemeMode } from '../types';

interface AgentDashboardProps {
  activeAgentId?: string;
  theme: ThemeMode;
  onAgentSelect?: (agentId: string) => void;
  agents: AgentInfo[];
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({ activeAgentId, theme, onAgentSelect, agents }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 bg-black/40 backdrop-blur-md border-t border-white/10">
      <style>{`
        @keyframes scan {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(100%) skewX(-12deg); }
        }
      `}</style>
      {agents.map((agent) => {
        const isActive = activeAgentId === agent.id;
        const isWorking = agent.status === 'working';
        
        return (
          <button 
            key={agent.id}
            onClick={() => onAgentSelect && onAgentSelect(agent.id)}
            className={`relative overflow-hidden flex items-center space-x-3 p-3 rounded-lg border transition-all duration-300 group text-left outline-none focus:ring-1 focus:ring-[var(--theme-color)] ${
              isActive 
                ? 'border-[var(--theme-color)] bg-[var(--theme-color)]/10 shadow-[0_0_20px_var(--glow-color)] scale-105 z-10' 
                : 'border-white/5 bg-white/5 opacity-60 hover:opacity-100 hover:border-white/20'
            }`}
          >
            {/* Processing Scanline Effect for Active or Working Agent */}
            {(isActive || isWorking) && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--theme-color)]/20 to-transparent -skew-x-12 w-[200%] -ml-[50%]" style={{ animation: 'scan 2s linear infinite' }} />
            )}
            
            <span className={`text-2xl transition-transform duration-300 ${isActive ? 'scale-125 animate-pulse' : 'group-hover:scale-110'}`}>
              {agent.icon}
            </span>
            
            <div className="overflow-hidden relative z-10">
              <h4 className={`text-xs font-bold font-orbitron uppercase tracking-tighter truncate ${isActive ? 'text-[var(--theme-color)] shadow-[0_0_8px_var(--glow-color)]' : 'text-white/90'}`}>
                {agent.name}
              </h4>
              <p className={`text-[9px] font-mono tracking-wide truncate ${isActive || isWorking ? 'text-white animate-pulse font-bold' : 'text-white/40'}`}>
                {isActive || isWorking ? 'PROCESSING...' : agent.status.toUpperCase()}
              </p>
            </div>

            {/* Status Dot */}
            <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${
              agent.status === 'ready' ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 
              agent.status === 'working' ? 'bg-amber-500 animate-pulse' : 'bg-white/10'
            }`} />
          </button>
        );
      })}
    </div>
  );
};

export default AgentDashboard;
