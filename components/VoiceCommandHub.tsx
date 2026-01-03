
import React from 'react';
import { Mic, Terminal, Zap, ShieldAlert, Cpu, Globe, PlayCircle } from 'lucide-react';

interface VoiceCommandHubProps {
  themeColor: string;
  isUserTalking: boolean;
  isSessionActive: boolean;
  onStartSession: () => void;
  onSelectSuggestion: (text: string) => void;
  lastCommand?: string;
}

const COMMAND_SUGGESTIONS = [
  { icon: <Zap size={12} />, text: "Switch theme to Friday", category: "System" },
  { icon: <ShieldAlert size={12} />, text: "Activate Vision module", category: "Security" },
  { icon: <Globe size={12} />, text: "Search for today's top space news", category: "Web" },
  { icon: <Cpu size={12} />, text: "Run system diagnostics", category: "Hardware" },
  { icon: <Terminal size={12} />, text: "Engage Devotion mode", category: "Emotional" }
];

const VoiceCommandHub: React.FC<VoiceCommandHubProps> = ({ 
  themeColor, 
  isUserTalking, 
  isSessionActive,
  onStartSession,
  onSelectSuggestion,
  lastCommand 
}) => {
  return (
    <div className="flex flex-col space-y-4 w-full">
      <div className="bg-black/40 border border-white/5 backdrop-blur-3xl rounded-[2.5rem] p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-orbitron text-white/30 uppercase tracking-[0.3em] flex items-center">
            <Terminal size={14} className="mr-3" /> Commands
          </h3>
          {!isSessionActive && (
            <button 
              onClick={onStartSession}
              className="flex items-center space-x-2 bg-[var(--theme-color)]/20 px-3 py-1 rounded-full border border-[var(--theme-color)]/40 text-[9px] font-orbitron text-[var(--theme-color)] uppercase tracking-wider hover:bg-[var(--theme-color)]/30 transition-all active:scale-95"
              style={{ '--theme-color': themeColor } as any}
            >
              <PlayCircle size={10} />
              <span>Link</span>
            </button>
          )}
          {isUserTalking && (
            <div className="flex items-center space-x-2 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[8px] font-mono text-emerald-400 uppercase font-bold">Streaming</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          {COMMAND_SUGGESTIONS.map((cmd, idx) => (
            <button 
              key={idx} 
              onClick={() => onSelectSuggestion(cmd.text)}
              className="w-full group flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-[var(--theme-color)]/30 hover:bg-[var(--theme-color)]/5 transition-all text-left outline-none"
              style={{ '--theme-color': themeColor } as any}
            >
              <div className="flex items-center space-x-3">
                <span className="text-white/20 group-hover:text-[var(--theme-color)] transition-colors">
                  {cmd.icon}
                </span>
                <span className="text-[10px] font-quicksand text-white/50 group-hover:text-white/80 transition-colors italic">
                  "{cmd.text}"
                </span>
              </div>
              <span className="text-[7px] font-orbitron text-white/10 uppercase tracking-widest">{cmd.category}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-black/60 border-l-4 border-[var(--theme-color)] backdrop-blur-2xl rounded-r-[2rem] p-4 flex items-center space-x-4 h-16 overflow-hidden" style={{ borderColor: themeColor }}>
        <div className={`p-2 rounded-lg ${isUserTalking ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-white/5 text-white/20'} transition-all`}>
          <Mic size={16} className={isUserTalking ? 'animate-bounce' : ''} />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-[8px] font-orbitron text-white/20 uppercase tracking-tighter mb-1">Intent_Engine</p>
          <p className="text-[11px] font-mono text-white/60 truncate italic">
            {isUserTalking ? 'Multiplexing stream...' : lastCommand ? `Triggered: ${lastCommand}` : 'Awaiting input sequence...'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceCommandHub;
