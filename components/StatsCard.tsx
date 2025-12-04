import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: React.ReactNode;
  alert?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, trend, trendValue, icon, alert }) => {
  return (
    <div className={`p-5 rounded-xl border ${alert ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'} shadow-sm transition-all hover:shadow-md`}>
      <div className="flex justify-between items-start mb-2">
        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-medium ${trend === 'up' ? 'text-red-500' : 'text-emerald-500'}`}>
            {trendValue}
            {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          </div>
        )}
      </div>
      <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold ${alert ? 'text-red-700' : 'text-slate-900'}`}>{value}</span>
      </div>
      {subtitle && <p className="text-slate-400 text-xs mt-2">{subtitle}</p>}
    </div>
  );
};