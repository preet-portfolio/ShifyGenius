import React, { useEffect, useState } from 'react';
import { analyzeScheduleCompliance } from '../services/geminiService';
import { Employee, Shift, ComplianceAnalysis, ViolationSeverity } from '../types';
import { ShieldCheck, AlertTriangle, RefreshCw, AlertCircle, DollarSign, TrendingUp, Info } from 'lucide-react';

interface CompliancePanelProps {
  employees: Employee[];
  shifts: Shift[];
  budget: number;
}

const SeverityBadge: React.FC<{ severity: ViolationSeverity }> = ({ severity }) => {
  const colors = {
    HIGH: 'bg-red-500/20 text-red-200 border-red-400',
    MEDIUM: 'bg-yellow-500/20 text-yellow-200 border-yellow-400',
    LOW: 'bg-blue-500/20 text-blue-200 border-blue-400'
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold border ${colors[severity]}`}>
      {severity}
    </span>
  );
};

const RiskIndicator: React.FC<{ risk: 'HIGH' | 'MEDIUM' | 'LOW' }> = ({ risk }) => {
  const config = {
    HIGH: { color: 'text-red-400', bg: 'bg-red-500/20', icon: AlertCircle, label: 'High Risk' },
    MEDIUM: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: AlertTriangle, label: 'Medium Risk' },
    LOW: { color: 'text-green-400', bg: 'bg-green-500/20', icon: ShieldCheck, label: 'Low Risk' }
  };

  const { color, bg, icon: Icon, label } = config[risk];

  return (
    <div className={`flex items-center gap-2 ${bg} px-3 py-2 rounded-lg`}>
      <Icon size={18} className={color} />
      <span className={`font-semibold text-sm ${color}`}>{label}</span>
    </div>
  );
};

export const CompliancePanel: React.FC<CompliancePanelProps> = ({ employees, shifts, budget }) => {
  const [analysis, setAnalysis] = useState<ComplianceAnalysis | null>(null);
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
        <div className="flex items-center gap-2">
          {analysis && <RiskIndicator risk={analysis.overallRisk} />}
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
            title="Refresh Analysis"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/10">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-300 border-t-transparent rounded-full"></div>
              <p className="text-indigo-200 text-sm animate-pulse">Analyzing labor laws and cost efficiency...</p>
            </div>
          </div>
        ) : analysis ? (
          <>
            {/* Cost Analysis Section */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign size={18} className="text-emerald-300" />
                <h3 className="font-bold text-base">Cost Analysis</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded p-3">
                  <p className="text-xs text-indigo-300 mb-1">Estimated Total</p>
                  <p className="text-lg font-bold">${analysis.costAnalysis.estimatedTotalCost.toFixed(2)}</p>
                </div>
                <div className="bg-white/5 rounded p-3">
                  <p className="text-xs text-indigo-300 mb-1">Budget Variance</p>
                  <p className={`text-lg font-bold ${analysis.costAnalysis.budgetVariance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {analysis.costAnalysis.budgetVariance > 0 ? '+' : ''}${analysis.costAnalysis.budgetVariance.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white/5 rounded p-3">
                  <p className="text-xs text-indigo-300 mb-1">Regular Pay</p>
                  <p className="text-lg font-bold">${analysis.costAnalysis.regularCost.toFixed(2)}</p>
                </div>
                <div className="bg-white/5 rounded p-3">
                  <p className="text-xs text-indigo-300 mb-1">Overtime Cost</p>
                  <p className="text-lg font-bold text-yellow-400">${analysis.costAnalysis.overtimeCost.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Violations Section */}
            {analysis.violations.length > 0 ? (
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={18} className="text-red-300" />
                  <h3 className="font-bold text-base">Compliance Violations ({analysis.violations.length})</h3>
                </div>
                <div className="space-y-2">
                  {analysis.violations.map((violation, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <SeverityBadge severity={violation.severity} />
                            <span className="text-xs text-indigo-300">{violation.type.replace(/_/g, ' ')}</span>
                          </div>
                          {violation.affectedEmployee && (
                            <p className="text-sm font-semibold text-white mb-1">
                              Employee: {violation.affectedEmployee}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-indigo-100 mb-2">{violation.description}</p>
                      <div className="bg-indigo-900/30 rounded px-3 py-2">
                        <p className="text-xs text-emerald-300 font-medium">💡 Suggested Action:</p>
                        <p className="text-xs text-indigo-200 mt-1">{violation.suggestedAction}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 text-green-400">
                  <ShieldCheck size={20} />
                  <p className="font-semibold">No compliance violations detected</p>
                </div>
              </div>
            )}

            {/* Recommendations Section */}
            {analysis.recommendations.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={18} className="text-green-300" />
                  <h3 className="font-bold text-base">Optimization Recommendations</h3>
                </div>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-indigo-100">
                      <span className="text-green-400 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Legal Disclaimer */}
            <div className="bg-yellow-900/20 backdrop-blur-md rounded-lg p-3 border border-yellow-700/30">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-yellow-300 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-100 leading-relaxed">{analysis.disclaimer}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/10">
            <div className="text-center text-indigo-300">
              <AlertTriangle className="mx-auto mb-2 opacity-50" size={32} />
              <p>No analysis available yet.</p>
            </div>
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