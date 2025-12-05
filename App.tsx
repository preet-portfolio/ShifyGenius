import React, { useState, useMemo, useEffect, lazy, Suspense } from 'react';
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
  Check,
  Megaphone,
  ArrowRight,
  Smartphone
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import { Employee, Shift, AppView, WeeklyStats, AvailabilityRequest, Notification } from './types';
import { INITIAL_EMPLOYEES, INITIAL_SHIFTS, INITIAL_WEEKLY_BUDGET, INITIAL_REQUESTS, INITIAL_NOTIFICATIONS, formatTime } from './constants';
import { StatsCard } from './components/StatsCard';

// Lazy load heavy components for better performance
const ScheduleGrid = lazy(() => import('./components/ScheduleGrid').then(m => ({ default: m.ScheduleGrid })));
const CompliancePanel = lazy(() => import('./components/CompliancePanel').then(m => ({ default: m.CompliancePanel })));
const TeamView = lazy(() => import('./components/TeamView').then(m => ({ default: m.TeamView })));
const EmployeePortal = lazy(() => import('./components/EmployeePortal').then(m => ({ default: m.EmployeePortal })));

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [requests, setRequests] = useState<AvailabilityRequest[]>(INITIAL_REQUESTS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [budget, setBudget] = useState<number>(INITIAL_WEEKLY_BUDGET);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // State to trigger Broadcast Modal from Dashboard
  const [openBroadcastFromDash, setOpenBroadcastFromDash] = useState(false);

  // Derived State: Calculate Stats
  const stats = useMemo<WeeklyStats>(() => {
    let totalCost = 0;
    let totalHours = 0;
    let overtimeHours = 0;

    // Helper: Correctly calculate duration even if shift ends at "00" (midnight)
    const getShiftDuration = (s: Shift) => {
      const start = parseInt(s.startTime);
      const end = parseInt(s.endTime) === 0 ? 24 : parseInt(s.endTime);
      return Math.max(0, end - start);
    };

    // Pre-calculate shifts per employee per day
    const empShifts: Record<string, Record<number, number>> = {};
    employees.forEach(e => {
        empShifts[e.id] = {};
        shifts.filter(s => s.employeeId === e.id).forEach(s => {
            const dur = getShiftDuration(s);
            empShifts[e.id][s.dayIndex] = (empShifts[e.id][s.dayIndex] || 0) + dur;
        });
    });

    employees.forEach(emp => {
        const rule = emp.overtimeRule || 'STANDARD';
        let weeklyRegularHours = 0;
        let empTotalCost = 0;
        const dailyHoursMap = empShifts[emp.id] || {};

        // Iterate through all days to apply Daily Rules
        for (let day = 0; day <= 6; day++) {
            const hours = dailyHoursMap[day] || 0;
            totalHours += hours;

            if (rule === 'SUNDAY_DOUBLE' && day === 6) {
                // Double time for Sunday, separate from weekly OT bucket
                empTotalCost += hours * emp.hourlyRate * 2;
                continue; 
            }

            if (rule === 'CALIFORNIA') {
                if (hours > 8) {
                    const dailyOT = hours - 8;
                    const straight = 8;
                    // Daily Overtime Calculation
                    empTotalCost += (straight * emp.hourlyRate) + (dailyOT * emp.hourlyRate * 1.5);
                    overtimeHours += dailyOT;
                    weeklyRegularHours += straight;
                } else {
                    empTotalCost += hours * emp.hourlyRate;
                    weeklyRegularHours += hours;
                }
            } else {
                // STANDARD or SUNDAY_DOUBLE (non-Sunday days)
                weeklyRegularHours += hours;
            }
        }

        // Apply Weekly Overtime Logic to the accumulated regular hours
        if (weeklyRegularHours > 40) {
            const weeklyOT = weeklyRegularHours - 40;
            
            if (rule === 'CALIFORNIA') {
                // For CA, these hours were already paid at 1.0x (Straight Time), so add 0.5x premium
                empTotalCost += weeklyOT * emp.hourlyRate * 0.5;
            } else {
                // For Standard, split the bucket into Regular (40) and OT (Excess)
                // Note: We haven't added cost for Standard hours yet in the loop, so we do it here
                const regular = 40;
                empTotalCost += (regular * emp.hourlyRate) + (weeklyOT * emp.hourlyRate * 1.5);
            }
            overtimeHours += weeklyOT;
        } else {
            // If under 40 hours
            if (rule !== 'CALIFORNIA') { 
                // CA cost is already accumulated in the loop, only Standard needs adding here
                empTotalCost += weeklyRegularHours * emp.hourlyRate;
            }
        }
        
        totalCost += empTotalCost;
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
          // Fix midnight bug here too for chart accuracy
          const end = parseInt(s.endTime) === 0 ? 24 : parseInt(s.endTime);
          const duration = end - parseInt(s.startTime);
          return acc + (emp ? duration * emp.hourlyRate : 0);
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
  
  const handleMoveShift = (shiftId: string, newDayIndex: number) => {
    setShifts(shifts.map(s => s.id === shiftId ? { ...s, dayIndex: newDayIndex } : s));
  };

  const handleCopyDay = (sourceDay: number, targetDay: number) => {
    const sourceShifts = shifts.filter(s => s.dayIndex === sourceDay);
    const newShifts = sourceShifts.map(s => ({
        ...s,
        id: Math.random().toString(36).substr(2, 9),
        dayIndex: targetDay
    }));
    // Remove existing shifts on target day to prevent duplicates/mess (optional, but cleaner)
    const cleanedShifts = shifts.filter(s => s.dayIndex !== targetDay);
    setShifts([...cleanedShifts, ...newShifts]);
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

  const handleAddRequest = (req: AvailabilityRequest) => {
    setRequests([...requests, req]);
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

  const handleSaveTemplate = () => {
    localStorage.setItem('shift_template', JSON.stringify(shifts));
    alert('Schedule template saved successfully!');
  };

  const handleLoadTemplate = () => {
    const saved = localStorage.getItem('shift_template');
    if (saved && window.confirm('Overwrite current schedule?')) {
      setShifts(JSON.parse(saved));
    }
  };

  const handleClearSchedule = () => {
    if (window.confirm('Clear all shifts?')) setShifts([]);
  };

  const handleExportSchedule = () => {
    const headers = ['Day', 'Employee', 'Role', 'Start Time', 'End Time', 'Hours', 'Cost'];
    const rows = shifts.map(s => {
      const emp = employees.find(e => e.id === s.employeeId);
      const end = parseInt(s.endTime) === 0 ? 24 : parseInt(s.endTime);
      const duration = end - parseInt(s.startTime);
      const cost = duration * (emp?.hourlyRate || 0);
      return [
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][s.dayIndex],
        emp?.name || 'Unknown',
        s.role,
        formatTime(s.startTime),
        formatTime(s.endTime),
        duration,
        cost
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "shift_schedule.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleJumpToBroadcast = () => {
    setCurrentView(AppView.SCHEDULE);
    setTimeout(() => {
        setOpenBroadcastFromDash(true);
    }, 100);
  };

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  // Render Employee Portal View
  if (currentView === AppView.EMPLOYEE_PORTAL) {
    return (
      <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>}>
        <EmployeePortal
          employees={employees}
          shifts={shifts}
          notifications={notifications}
          onRequestAdd={handleAddRequest}
          onBackToAdmin={() => setCurrentView(AppView.DASHBOARD)}
        />
      </Suspense>
    );
  }

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
          <button 
            onClick={() => setCurrentView(AppView.EMPLOYEE_PORTAL)}
            className="w-full py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
             <Smartphone size={16} /> Employee Portal
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header - Mobile & Desktop */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 z-20 shadow-sm md:shadow-none relative">
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
                    <span>${stats.totalCost.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})} / ${stats.budget.toLocaleString()}</span>
                    <Edit2 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                  </div>
                )}
              </div>
            </div>
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
              <button 
                onClick={() => {setCurrentView(AppView.EMPLOYEE_PORTAL); setIsMobileMenuOpen(false);}}
                className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left font-medium text-slate-500 hover:bg-slate-100"
              >
                <Smartphone size={20} /> Employee Portal
              </button>
            </nav>
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* DASHBOARD VIEW */}
            {currentView === AppView.DASHBOARD && (
              <>
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-2.5 rounded-full text-red-600 animate-pulse">
                            <Megaphone size={24} />
                        </div>
                        <div>
                            <h3 className="text-red-900 font-bold text-base">Quick Action: Find Coverage</h3>
                            <p className="text-red-700 text-sm">Employee called out? Broadcast an open shift instantly.</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleJumpToBroadcast}
                        className="w-full md:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        Find Coverage Now <ArrowRight size={16} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard 
                    title="Total Labor Cost" 
                    value={`$${stats.totalCost.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`} 
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
                    subtitle="Hours exceeding rules"
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
                  <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6">Labor Cost Trend</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={chartData}>
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} tickFormatter={(val) => `$${val}`} />
                          <Tooltip cursor={{fill: '#f1f5f9'}} />
                          <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.cost > 600 ? '#818cf8' : '#c7d2fe'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

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

            {currentView === AppView.SCHEDULE && (
              <div className="space-y-4">
                <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>}>
                  <ScheduleGrid
                    shifts={shifts}
                    employees={employees}
                    onAddShift={handleAddShift}
                    onRemoveShift={handleRemoveShift}
                    onSaveTemplate={handleSaveTemplate}
                    onLoadTemplate={handleLoadTemplate}
                    onClearSchedule={handleClearSchedule}
                    onExportSchedule={handleExportSchedule}
                    triggerBroadcast={openBroadcastFromDash}
                    resetBroadcastTrigger={() => setOpenBroadcastFromDash(false)}
                  />
                </Suspense>
              </div>
            )}

            {currentView === AppView.TEAM && (
              <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>}>
                <TeamView
                  employees={employees}
                  requests={requests}
                  onUpdateEmployee={handleUpdateEmployee}
                  onAddEmployee={handleAddEmployee}
                  onRemoveEmployee={handleRemoveEmployee}
                  onApproveRequest={handleApproveRequest}
                  onRejectRequest={handleRejectRequest}
                />
              </Suspense>
            )}

            {currentView === AppView.AI_INSIGHTS && (
              <div className="space-y-6">
                <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>}>
                  <CompliancePanel employees={employees} shifts={shifts} budget={budget} />
                </Suspense>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;