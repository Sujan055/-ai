
import React from 'react';
import { Play, CheckCircle2, Loader2, AlertCircle, Cpu, Code } from 'lucide-react';

interface Task {
  id: string;
  task: string;
  status: 'queued' | 'executing' | 'completed' | 'failed';
}

interface AutomationHubProps {
  queue: Task[];
  themeColor: string;
}

const AutomationHub: React.FC<AutomationHubProps> = ({ queue, themeColor }) => {
  return (
    <div className="p-5 bg-black/50 border-r-4 border-amber-400 backdrop-blur-xl rounded-xl shadow-lg flex flex-col h-48 overflow-hidden">
      <h3 className="text-[11px] font-orbitron text-white/60 mb-4 flex items-center justify-end uppercase tracking-wider">
        <Code size={14} className="mr-3 text-amber-400" /> Automation Engine
      </h3>
      
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
        {queue.length === 0 ? (
          <div className="text-right text-[10px] text-white/20 italic mt-8 font-mono">Kernel idle. No active scripts.</div>
        ) : (
          queue.map((task) => (
            <div key={task.id} className="bg-white/5 border border-white/5 rounded p-2 flex items-center justify-between group transition-all hover:bg-white/10">
              <div className="flex items-center space-x-3 overflow-hidden">
                {task.status === 'executing' ? (
                  <Loader2 size={12} className="text-amber-400 animate-spin shrink-0" />
                ) : task.status === 'completed' ? (
                  <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                ) : task.status === 'failed' ? (
                  <AlertCircle size={12} className="text-red-400 shrink-0" />
                ) : (
                  <Play size={12} className="text-white/20 shrink-0" />
                )}
                <span className={`text-[9px] font-mono truncate ${task.status === 'executing' ? 'text-white' : 'text-white/30'}`}>
                  {task.task}
                </span>
              </div>
              <span className={`text-[8px] font-orbitron shrink-0 ml-2 ${task.status === 'executing' ? 'text-amber-400' : 'text-white/10'}`}>
                {task.status.toUpperCase()}
              </span>
            </div>
          ))
        )}
      </div>
      
      {queue.some(t => t.status === 'executing') && (
        <div className="mt-3 pt-2 border-t border-white/5 flex justify-between items-center text-[7px] font-mono text-white/20 uppercase">
          <div className="flex items-center space-x-2">
             <div className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
             <span>Thread_0x7: Running</span>
          </div>
          <span className="text-amber-400/50">Injecting...</span>
        </div>
      )}
    </div>
  );
};

export default AutomationHub;
