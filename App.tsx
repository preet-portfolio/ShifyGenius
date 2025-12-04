import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Bot, 
  Menu, 
  Bell, 
  DollarSign, 
  Clock, 
  AlertCircle,
  Edit2,
  Check
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import { Employee, Shift, AppView, WeeklyStats, AvailabilityRequest } from './types';
import { INITIAL_EMPLOYEES, INITIAL_SHIFTS, INITIAL_WEEKLY_BUDGET, INITIAL_REQUESTS } from './constants';
import { StatsCard } from './components/StatsCard';
import { ScheduleGrid } from './components/ScheduleGrid';
import { CompliancePanel } from './components/CompliancePanel';
import { TeamView } from './components/TeamView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [requests, setRequests] = useState<AvailabilityRequest[]>(INITIAL_REQUESTS);
  const [budget, setBudget] = useState<number>(INITIAL_WEEKLY_BUDGET);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Derived State: Calculate Stats
  const stats = useMemo<WeeklyStats>(() => {
    let totalCost = 0;
    let totalHours = 0;
    const employeeHours: Record<string, number> = {};

    shifts.forEach(shift => {
      const emp = employees.find(e => e.id === shift.employeeId);
      if (emp) {
        const duration = parseInt(shift.endTime) - parseInt(shift.startTime);
        const cost = duration * emp.hourlyRate;
        totalCost += cost;
        totalHours += duration;
        employeeHours[emp.id] = (employeeHours[emp.id] || 0) + duration;
      }
    });

    let overtimeHours = 0;
    Object.values(employeeHours).forEach(hours => {
      if (hours > 40) overtimeHours += (hours - 40);
    });

    return {
      totalCost,
      totalHours,
      overtimeHours,
      budget: budget
    };
  }, [shifts, employees, budget]);

  // Derived State: Chart Data
  const chartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, index) => {
      const cost = shifts
        .filter(s => s.dayIndex === index)
        .reduce((acc, s) => {
          const emp = employees.find(e => e.id === s.employeeId);
          return acc + (emp ? (parseInt(s.endTime) - parseInt(s.startTime)) * emp.hourlyRate : 0);
        }, 0);
      return { name: day, cost };
    });
  }, [shifts, employees]);

  const handleAddShift = (newShift: Shift) => {
    setShifts([...shifts, newShift]);
  };

  const handleRemoveShift = (id: string) => {
    setShifts(shifts.filter(s => s.id !== id));
  };

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    setEmployees(employees.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
  };
  
  const handleAddEmployee = (newEmployee: Employee) => {
    setEmployees([...employees, newEmployee]);
  };

  const handleRemoveEmployee = (employeeId: string) => {
    setEmployees(employees.filter(e => e.id !== employeeId));
    setShifts(shifts.filter(s => s.employeeId !== employeeId));
    setRequests(requests.filter(r => r.employeeId !== employeeId));
  };

  const handleApproveRequest = (request: AvailabilityRequest) => {
    setRequests(requests.map(r => r.id === request.id ? { ...r, status: 'APPROVED' } : r));
    
    if (request.type === 'AVAILABILITY_CHANGE' && request.requestedUnavailableDays) {
      setEmployees(employees.map(emp => {
        if (emp.id === request.employeeId) {
          const uniqueDays = Array.from(new Set([...(emp.unavailableDays || []), ...request.requestedUnavailableDays]));
          return { ...emp, unavailableDays: uniqueDays.sort() };
        }
        return emp;
      }));
    }
  };

  const handleRejectRequest = (requestId: string) => {
    setRequests(requests.map(r => r.id === requestId ? { ...r, status: 'REJECTED' } : r));
  };

  // Schedule Actions
  const handleSaveTemplate = () => {
    try {
      localStorage.setItem('shift_template', JSON.stringify(shifts));
      alert('Schedule template saved successfully!');
    } catch (e) {
      console.error('Failed to save template', e);
    }
  };

  const handleLoadTemplate = () => {
    try {
      const saved = localStorage.getItem('shift_template');
      if (saved) {
        if (window.confirm('This will overwrite the current schedule. Continue?')) {
          setShifts(JSON.parse(saved));
        }
      } else {
        alert('No saved template found.');
      }
    } catch (e) {
      console.error('Failed to load template', e);
    }
  };

  const handleClearSchedule = () => {
    if (window.confirm('Are you sure you want to clear all shifts?')) {
      setShifts([]);
    }
  };

  const handleExportSchedule = () => {
    const headers = ['Day', 'Employee', 'Role', 'Start Time', 'End Time', 'Hours', 'Cost'];
    const rows = shifts.map(s => {
      const emp = employees.find(e => e.id === s.employeeId);
      const duration = parseInt(s.endTime) - parseInt(s.startTime);
      const cost = duration * (emp?.hourlyRate || 0);
      return [
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][s.dayIndex],
        emp?.name || 'Unknown',
        s.role,
        `${s.startTime}:00`,
        `${s.endTime}:00`,
        duration,
        cost
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "shift_schedule_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  const NavItem = ({ view, icon: Icon, label, badge }: { view: AppView, icon: any, label: string, badge?: number }) => (
    <button
      onClick={() => { setCurrentView(view); setIsMobileMenuOpen(false); }}
      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all w-full text-left font-medium ${
        currentView === view 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} />
        {label}
      </div>
      {badge ? (
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${currentView === view ? 'bg-indigo-500 text-white' : 'bg-red-100 text-red-600'}`}>
          {badge}
        </span>
      ) : null}
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-full">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Clock className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">ShiftGenius</h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
          <NavItem view={AppView.SCHEDULE} icon={CalendarDays} label="Schedule" />
          <NavItem view={AppView.TEAM} icon={Users} label="Team" badge={pendingCount > 0 ? pendingCount : undefined} />
          <NavItem view={AppView.AI_INSIGHTS} icon={Bot} label="AI Compliance" />
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="bg-slate-900 rounded-xl p-4 text-white">
            <h4 className="text-sm font-semibold mb-1">Pro Plan</h4>
            <p className="text-xs text-slate-400 mb-3">5/15 Employees used</p>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full w-1/3"></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header - Mobile & Desktop */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 z-20">
          <div className="flex items-center gap-4 md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
              <Menu size={24} />
            </button>
            <span className="font-bold text-lg text-slate-800">ShiftGenius</span>
          </div>
          
          <div className="hidden md:block">
            <h2 className="text-xl font-semibold text-slate-800">
              {currentView === AppView.DASHBOARD && 'Dashboard Overview'}
              {currentView === AppView.SCHEDULE && 'Weekly Schedule'}
              {currentView === AppView.TEAM && 'Team Management'}
              {currentView === AppView.AI_INSIGHTS && 'Compliance & Insights'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-xs text-slate-500">Weekly Budget</span>
              <div className="flex items-center gap-1 font-semibold text-slate-700 group cursor-pointer" onClick={() => setIsEditingBudget(true)}>
                <div className={`w-2 h-2 rounded-full ${stats.totalCost > stats.budget ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                
                {isEditingBudget ? (
                  <div className="flex items-center">
                    <span className="text-slate-400 text-xs mr-1">$</span>
                    <input 
                      type="number" 
                      autoFocus
                      className="w-20 border-b border-indigo-500 focus:outline-none text-right"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      onBlur={() => setIsEditingBudget(false)}
                      onKeyDown={(e) => e.key === 'Enter' && setIsEditingBudget(false)}
                    />
                    <button onClick={(e) => { e.stopPropagation(); setIsEditingBudget(false); }} className="ml-1 text-emerald-600"><Check size={14}/></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 hover:text-indigo-600">
                    <span>${stats.totalCost.toLocaleString()} / ${stats.budget.toLocaleString()}</span>
                    <Edit2 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                  </div>
                )}
              </div>
            </div>
            <button className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              {pendingCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
            </button>
            <img 
              src="https://picsum.photos/40/40?random=99" 
              alt="User" 
              className="w-9 h-9 rounded-full border border-slate-200" 
            />
          </div>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-white shadow-xl border-b border-slate-200 z-30 p-4 md:hidden animate-in slide-in-from-top-2">
            <nav className="space-y-2">
              <NavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
              <NavItem view={AppView.SCHEDULE} icon={CalendarDays} label="Schedule" />
              <NavItem view={AppView.TEAM} icon={Users} label="Team" badge={pendingCount > 0 ? pendingCount : undefined} />
              <NavItem view={AppView.AI_INSIGHTS} icon={Bot} label="AI Insights" />
            </nav>
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* DASHBOARD VIEW */}
            {currentView === AppView.DASHBOARD && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard 
                    title="Total Labor Cost" 
                    value={`$${stats.totalCost.toLocaleString()}`} 
                    subtitle="Last 7 Days"
                    icon={<DollarSign size={20} />}
                    trend={stats.totalCost > stats.budget ? 'up' : 'down'}
                    trendValue={stats.totalCost > stats.budget ? "Over Budget" : "Under Budget"}
                    alert={stats.totalCost > stats.budget}
                  />
                  <StatsCard 
                    title="Total Hours" 
                    value={`${stats.totalHours} hrs`} 
                    subtitle="Scheduled this week"
                    icon={<Clock size={20} />}
                  />
                  <StatsCard 
                    title="Overtime Risk" 
                    value={`${stats.overtimeHours} hrs`} 
                    subtitle="Hours exceeding 40/emp"
                    icon={<AlertCircle size={20} />}
                    alert={stats.overtimeHours > 0}
                  />
                  <StatsCard 
                    title="Staff Count" 
                    value={employees.length.toString()} 
                    subtitle="Active employees"
                    icon={<Users size={20} />}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Chart */}
                  <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6">Labor Cost Trend</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={chartData}>
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} tickFormatter={(val) => `$${val}`} />
                          <Tooltip 
                            cursor={{fill: '#f1f5f9'}}
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                          />
                          <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.cost > 600 ? '#818cf8' : '#c7d2fe'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* AI Quick Insight Mini Panel */}
                  <div className="bg-indigo-900 rounded-xl p-6 text-white flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Bot className="text-indigo-300" />
                        <h3 className="font-semibold">Compliance Status</h3>
                      </div>
                      <p className="text-indigo-100 text-sm leading-relaxed mb-4">
                        {stats.overtimeHours > 0 
                          ? "⚠️ Warning: You have potential overtime costs this week. Check the AI Compliance tab for details."
                          : "✅ All clear. No overtime detected. You are trending under budget."
                        }
                      </p>
                    </div>
                    <button 
                      onClick={() => setCurrentView(AppView.AI_INSIGHTS)}
                      className="w-full py-2 bg-white text-indigo-900 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                    >
                      View Full Report
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* SCHEDULE VIEW */}
            {currentView === AppView.SCHEDULE && (
              <div className="space-y-4">
                <ScheduleGrid 
                  shifts={shifts} 
                  employees={employees} 
                  onAddShift={handleAddShift} 
                  onRemoveShift={handleRemoveShift}
                  onSaveTemplate={handleSaveTemplate}
                  onLoadTemplate={handleLoadTemplate}
                  onClearSchedule={handleClearSchedule}
                  onExportSchedule={handleExportSchedule}
                />
              </div>
            )}

            {/* TEAM VIEW */}
            {currentView === AppView.TEAM && (
               <TeamView 
                 employees={employees} 
                 requests={requests}
                 onUpdateEmployee={handleUpdateEmployee}
                 onAddEmployee={handleAddEmployee}
                 onRemoveEmployee={handleRemoveEmployee}
                 onApproveRequest={handleApproveRequest}
                 onRejectRequest={handleRejectRequest}
               />
            )}

            {/* AI INSIGHTS VIEW */}
            {currentView === AppView.AI_INSIGHTS && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Why this matters</h3>
                  <p className="text-slate-600 leading-relaxed">
                    ShiftGenius uses Gemini AI to analyze your schedule against local labor laws and your budget. 
                    It helps avoid "accidental overtime" which costs SMBs thousands per year.
                  </p>
                </div>
                <CompliancePanel employees={employees} shifts={shifts} budget={budget} />
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;