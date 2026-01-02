
import React from 'react';

interface DiagnosticOverlayProps {
  themeColor: string;
}

const DiagnosticOverlay: React.FC<DiagnosticOverlayProps> = ({ themeColor }) => {
  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-pulse" />
      
      {/* Scan Lines */}
      <div className="absolute inset-0 flex flex-col justify-around">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="w-full h-[1px] bg-white/20 animate-[slide_4s_linear_infinite]"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="w-96 h-96 relative border border-white/10 rounded-full flex items-center justify-center">
          <div 
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--theme-color)] animate-spin" 
            style={{ borderColor: `${themeColor} transparent transparent transparent` }}
          />
          <div 
            className="absolute inset-8 rounded-full border-2 border-transparent border-b-[var(--theme-color)] animate-[spin_2s_linear_infinite_reverse]" 
            style={{ borderColor: `transparent transparent ${themeColor} transparent` }}
          />
          <div className="text-center font-orbitron">
            <h2 className="text-[var(--theme-color)] text-2xl font-black tracking-widest uppercase mb-2 animate-pulse">
              Diagnostic Scan
            </h2>
            <div className="text-white/40 text-[10px] tracking-[0.4em] uppercase font-bold">
              Subsystem Analysis In Progress
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide {
          0% { transform: translateY(-100vh); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default DiagnosticOverlay;
