
import React, { useRef, useEffect } from 'react';
import { Mic, MicOff, Terminal, Zap, ShieldAlert, Cpu, Globe, PlayCircle, MessageSquare, Activity, User } from 'lucide-react';
import { ChatMessage } from '../App';

interface VoiceCommandHubProps {
  themeColor: string;
  isUserTalking: boolean;
  isSpeaking: boolean;
  isSessionActive: boolean;
  onStartSession: () => void;
  onStopSession: () => void;
  onSelectSuggestion: (text: string) => void;
  chatHistory: ChatMessage[];
  currentInput: string;
  currentOutput: string;
}

const COMMAND_SUGGESTIONS = [
  { icon: <Zap size={12} />, text: "Switch theme to Amara", category: "System" },
  { icon: <Globe size={12} />, text: "Create an image of a cybernetic forest", category: "Creative" },
  { icon: <Cpu size={12} />, text: "Analyze a video file", category: "Vision" },
  { icon: <Terminal size={12} />, text: "Switch theme to Eclipse", category: "Emotional" }
];

const VoiceCommandHub: React.FC<VoiceCommandHubProps> = ({ 
  themeColor, 
  isUserTalking,
  isSpeaking,
  isSessionActive,
  onStartSession,
  onStopSession,
  onSelectSuggestion,
  chatHistory,
  currentInput,
  currentOutput
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, currentInput, currentOutput]);

  return (
    <div className="flex flex-col space-y-4 w-full h-full max-h-[60vh]">
      {/* Transcript Feed */}
      <div className="flex-1 bg-black/40 border border-white/5 backdrop-blur-3xl rounded-[2.5rem] p-6 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-orbitron text-white/30 uppercase tracking-[0.3em] flex items-center">
            <MessageSquare size={14} className="mr-3 text-[var(--theme-color)]" /> Neural Transcript
          </h3>
          <div className="flex items-center space-x-2">
            {isSessionActive ? (
              <button 
                onClick={onStopSession}
                className="bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 text-[7px] font-orbitron text-red-400 uppercase tracking-widest hover:bg-red-500/20 transition-all"
              >
                Disconnect
              </button>
            ) : (
              <button 
                onClick={onStartSession}
                className="bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[7px] font-orbitron text-emerald-400 uppercase tracking-widest hover:bg-emerald-500/20 transition-all"
              >
                Connect
              </button>
            )}
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide font-quicksand"
        >
          {chatHistory.length === 0 && !currentInput && !currentOutput && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-8">
              <Activity size={32} className="mb-2" />
              <p className="text-[10px] font-orbitron uppercase tracking-widest">Awaiting Neural Link</p>
            </div>
          )}

          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center space-x-2 mb-1 opacity-40">
                {msg.role === 'user' ? (
                  <>
                    <span className="text-[8px] font-orbitron">USER</span>
                    <User size={10} />
                  </>
                ) : (
                  <>
                    <Zap size={10} className="text-[var(--theme-color)]" />
                    <span className="text-[8px] font-orbitron">NAMI</span>
                  </>
                )}
              </div>
              <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-[11px] leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-white/5 border border-white/5 text-white/70' 
                  : 'bg-[var(--theme-color)]/10 border border-[var(--theme-color)]/20 text-white/90'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {/* Real-time Streams */}
          {currentInput && (
            <div className="flex flex-col items-end animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center space-x-2 mb-1 opacity-40">
                <span className="text-[8px] font-orbitron">USER</span>
                <User size={10} />
              </div>
              <div className="max-w-[85%] px-4 py-2 rounded-2xl text-[11px] bg-white/5 border border-white/5 text-white/40 italic">
                {currentInput}
                <span className="inline-block w-1.5 h-3 bg-white/20 ml-1 animate-pulse" />
              </div>
            </div>
          )}

          {currentOutput && (
            <div className="flex flex-col items-start animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="flex items-center space-x-2 mb-1 opacity-40">
                <Zap size={10} className="text-[var(--theme-color)]" />
                <span className="text-[8px] font-orbitron">NAMI</span>
              </div>
              <div className="max-w-[85%] px-4 py-2 rounded-2xl text-[11px] bg-[var(--theme-color)]/10 border border-[var(--theme-color)]/20 text-white/60 italic">
                {currentOutput}
                <span className="inline-block w-1.5 h-3 bg-[var(--theme-color)]/40 ml-1 animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions Tray */}
      <div className="bg-black/40 border border-white/5 backdrop-blur-3xl rounded-[2.5rem] p-6 space-y-3">
        <h4 className="text-[9px] font-orbitron text-white/20 uppercase tracking-[0.3em]">Synaptic Shortcuts</h4>
        <div className="grid grid-cols-1 gap-2">
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
                <span className="text-[9px] font-quicksand text-white/50 group-hover:text-white/80 transition-colors italic">
                  "{cmd.text}"
                </span>
              </div>
              <span className="text-[6px] font-orbitron text-white/10 uppercase tracking-widest">{cmd.category}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-black/60 border-l-4 border-[var(--theme-color)] backdrop-blur-2xl rounded-r-[2rem] p-4 flex items-center space-x-4 h-16 overflow-hidden shadow-xl" style={{ borderColor: themeColor }}>
        <div className={`p-2 rounded-lg transition-all ${
          isUserTalking 
            ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse' 
            : isSpeaking 
              ? 'bg-[var(--theme-color)]/20 text-[var(--theme-color)] shadow-[0_0_15px_var(--glow-color)] animate-bounce'
              : 'bg-white/5 text-white/20'
        }`}>
          {isUserTalking ? <Mic size={16} /> : isSpeaking ? <Activity size={16} /> : <MicOff size={16} />}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-[8px] font-orbitron text-white/20 uppercase tracking-tighter mb-1">
            {isUserTalking ? 'Link_Input' : isSpeaking ? 'Link_Output' : 'Link_Standby'}
          </p>
          <p className="text-[10px] font-mono text-white/60 truncate italic">
            {isUserTalking ? 'Capturing user audio...' : isSpeaking ? 'Synthesizing response...' : 'Awaiting input sequence...'}
          </p>
        </div>
        {isSessionActive && (
          <div className="flex space-x-1">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className={`w-1 h-3 rounded-full bg-[var(--theme-color)] ${isUserTalking || isSpeaking ? 'animate-[pulse_1s_infinite]' : 'opacity-20'}`}
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceCommandHub;
