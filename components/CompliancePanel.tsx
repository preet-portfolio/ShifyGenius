import React, { useEffect, useState } from 'react';
import { analyzeScheduleCompliance } from '../services/geminiService';
import { Employee, Shift } from '../types';
import { ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Assuming standard markdown rendering or simple text

interface CompliancePanelProps {
  employees: Employee[];
  shifts: Shift[];
  budget: number;
}

export const CompliancePanel: React.FC<CompliancePanelProps> = ({ employees, shifts, budget }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    const result = await analyzeScheduleCompliance(employees, shifts, budget);
    setAnalysis(result);
    setLastUpdated(new Date());
    setLoading(false);
  };

  useEffect(() => {
    // Run initial analysis on mount
    runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-xl text-white p-6 shadow-xl">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <ShieldCheck size={24} className="text-emerald-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Smart Compliance Assistant</h2>
            <p className="text-indigo-200 text-xs">Powered by Gemini AI</p>
          </div>
        </div>
        <button 
          onClick={runAnalysis}
          disabled={loading}
          className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
          title="Refresh Analysis"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-lg p-5 border border-white/10 min-h-[200px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full py-8 space-y-3">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-300 border-t-transparent rounded-full"></div>
            <p className="text-indigo-200 text-sm animate-pulse">Analyzing labor laws and cost efficiency...</p>
          </div>
        ) : analysis ? (
          <div className="prose prose-invert prose-sm max-w-none">
             {/* Simple renderer for the markdown response */}
             <div className="whitespace-pre-wrap font-light leading-relaxed">
                {analysis.split('\n').map((line, i) => {
                    if (line.startsWith('**Compliance')) return <h3 key={i} className="text-emerald-300 font-bold mt-4 mb-2 text-base">{line.replace(/\*\*/g, '')}</h3>;
                    if (line.startsWith('**Cost')) return <h3 key={i} className="text-emerald-300 font-bold mt-4 mb-2 text-base">{line.replace(/\*\*/g, '')}</h3>;
                    if (line.startsWith('**Optimization')) return <h3 key={i} className="text-emerald-300 font-bold mt-4 mb-2 text-base">{line.replace(/\*\*/g, '')}</h3>;
                    if (line.trim().startsWith('-')) return <li key={i} className="ml-4 mb-1 text-indigo-100">{line.replace('-', '').trim()}</li>;
                    return <p key={i} className="mb-2 text-indigo-50">{line}</p>;
                })}
             </div>
          </div>
        ) : (
          <div className="text-center text-indigo-300 py-8">
            <AlertTriangle className="mx-auto mb-2 opacity-50" />
            <p>No analysis available yet.</p>
          </div>
        )}
      </div>
      
      {lastUpdated && (
        <div className="mt-4 text-xs text-indigo-300 text-right">
          Last checked: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};