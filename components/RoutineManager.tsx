
import React from 'react';
import { CheckCircle2, Circle, ListTodo, Sparkles, ArrowRight, Zap } from 'lucide-react';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  type?: 'manual' | 'automation';
  trigger?: string;
}

interface RoutineManagerProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  themeColor: string;
}

const RoutineManager: React.FC<RoutineManagerProps> = ({ tasks, onToggleTask, themeColor }) => {
  return (
    <div className="flex flex-col space-y-4 w-full h-full">
      <style>{`
        @keyframes task-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        @keyframes line-draw {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes sparkles-float {
          0% { transform: translateY(0) opacity(0); }
          50% { opacity: 1; }
          100% { transform: translateY(-20px) opacity(0); }
        }
        .task-item-completed {
          animation: task-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .strike-line {
          position: absolute;
          left: 0;
          top: 50%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--theme-color), transparent);
          animation: line-draw 0.4s ease-out forwards;
        }
      `}</style>

      <div className="bg-black/40 border border-white/5 backdrop-blur-3xl rounded-[2.5rem] p-8 space-y-6 flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-orbitron text-white/30 uppercase tracking-[0.3em] flex items-center">
            <ListTodo size={14} className="mr-3 text-[var(--theme-color)]" /> Synaptic Routines
          </h3>
          <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest">
            {tasks.filter(t => t.completed).length}/{tasks.length} Resolved
          </div>
        </div>

        <div className="space-y-4 overflow-y-auto pr-2 scrollbar-hide flex-1">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onToggleTask(task.id)}
              className={`group relative flex flex-col p-5 rounded-3xl border transition-all cursor-pointer ${
                task.completed 
                  ? 'bg-[var(--theme-color)]/5 border-[var(--theme-color)]/20 task-item-completed' 
                  : 'bg-white/5 border-white/5 hover:border-white/10'
              }`}
              style={{ '--theme-color': themeColor } as any}
            >
              <div className="flex items-center space-x-4 mb-2">
                <div className={`shrink-0 transition-transform duration-300 ${task.completed ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {task.completed ? (
                    <CheckCircle2 size={18} className="text-[var(--theme-color)] drop-shadow-[0_0_8px_var(--glow-color)]" />
                  ) : (
                    <Circle size={18} className="text-white/10 group-hover:text-white/30" />
                  )}
                </div>

                <div className="flex-1 relative overflow-hidden">
                  <span className={`text-[13px] font-quicksand font-medium transition-all duration-500 ${
                    task.completed ? 'text-white/30 italic' : 'text-white/80'
                  }`}>
                    {task.text}
                  </span>
                  {task.completed && <div className="strike-line" />}
                </div>

                {task.type === 'automation' && !task.completed && (
                  <Zap size={14} className="text-amber-400 animate-pulse" />
                )}
              </div>

              {task.trigger && (
                <div className="flex items-center space-x-2 pl-8 opacity-40">
                  <span className="text-[8px] font-orbitron uppercase tracking-widest">Trigger</span>
                  <ArrowRight size={8} />
                  <span className="text-[9px] font-mono italic text-[var(--theme-color)]">{task.trigger}</span>
                </div>
              )}

              {task.completed && (
                <div className="absolute top-2 right-4 animate-[sparkles-float_1s_ease-out_forwards]">
                  <Sparkles size={12} className="text-[var(--theme-color)] opacity-40" />
                </div>
              )}
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
              <ListTodo size={40} />
              <p className="text-[10px] font-orbitron uppercase tracking-widest">Awaiting Command Input</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutineManager;
