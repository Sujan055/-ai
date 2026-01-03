
import React from 'react';
import { BrainCircuit, CheckCircle, AlertTriangle, XCircle, Info, MessageSquare } from 'lucide-react';

interface Report {
  id: string;
  agentId: string;
  message: string;
  status: string;
  time: string;
}

interface AgentInsightsProps {
  reports: Report[];
  themeColor: string;
}

const AgentInsights: React.FC<AgentInsightsProps> = ({ reports, themeColor }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle size={12} className="text-emerald-400" />;
      case 'failure': return <XCircle size={12} className="text-red-400" />;
      case 'warning': return <AlertTriangle size={12} className="text-amber-400" />;
      case 'nuance': return <Info size={12} className="text-[var(--theme-color)]" />;
      default: return <MessageSquare size={12} className="text-white/20" />;
    }
  };

  return (
    <div className="p-5 bg-black/50 border-r-4 border-[var(--theme-color)] backdrop-blur-xl rounded-xl shadow-lg flex flex-col h-64 overflow-hidden text-right">
      <div className="flex items-center justify-end mb-4 space-x-3">
        <h3 className="text-[11px] font-orbitron text-white/60 uppercase tracking-wider">Neural Insights</h3>
        <BrainCircuit size={16} className="text-[var(--theme-color)]" />
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
        {reports.length === 0 ? (
          <div className="text-white/20 text-[10px] font-mono italic mt-12">Awaiting agent execution data...</div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="bg-white/5 border border-white/5 rounded-lg p-3 space-y-2 group hover:bg-white/10 transition-all border-r-2" style={{ borderRightColor: report.status === 'failure' ? '#ef4444' : themeColor }}>
              <div className="flex items-center justify-between">
                <span className="text-[8px] text-white/20 font-mono">{report.time}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] font-orbitron text-[var(--theme-color)] uppercase">{report.agentId}</span>
                  {getStatusIcon(report.status)}
                </div>
              </div>
              <p className="text-[10px] font-mono text-white/50 leading-relaxed text-right">
                {report.message}
              </p>
            </div>
          ))
        )}
      </div>
      
      {reports.length > 0 && (
        <div className="mt-3 pt-2 border-t border-white/5 flex justify-between items-center text-[8px] font-orbitron text-white/20 uppercase">
          <div className="flex items-center space-x-1">
             <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
             <span>Loop Active</span>
          </div>
          <span>Refinement Count: {reports.length}</span>
        </div>
      )}
    </div>
  );
};

export default AgentInsights;
