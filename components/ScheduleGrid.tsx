import React, { useState } from 'react';
import { Employee, Shift } from '../types';
import { DAYS_OF_WEEK } from '../constants';
import { Plus, X, Clock, Sparkles, AlertTriangle, Save, Download, Trash2, FileDown, Megaphone, Search, CheckCircle2, BellRing } from 'lucide-react';
import { generateSmartScheduleSuggestion } from '../services/geminiService';

interface ScheduleGridProps {
  shifts: Shift[];
  employees: Employee[];
  onAddShift: (shift: Shift) => void;
  onRemoveShift: (shiftId: string) => void;
  onSaveTemplate?: () => void;
  onLoadTemplate?: () => void;
  onClearSchedule?: () => void;
  onExportSchedule?: () => void;
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({ 
  shifts, 
  employees, 
  onAddShift, 
  onRemoveShift,
  onSaveTemplate,
  onLoadTemplate,
  onClearSchedule,
  onExportSchedule
}) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ day: number, hour: number } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<number | null>(null);

  // Broadcast Modal State
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastStep, setBroadcastStep] = useState<'SELECT' | 'SENT'>('SELECT');
  const [broadcastConfig, setBroadcastConfig] = useState({
    dayIndex: new Date().getDay() - 1 < 0 ? 0 : new Date().getDay() - 1, // Default to today (approx)
    startTime: '17',
    role: 'Server' as const
  });

  // Helper to get shift for a cell
  const getShiftsForDay = (dayIndex: number) => shifts.filter(s => s.dayIndex === dayIndex);

  const handleAddShift = (employeeId: string, role: string) => {
    if (selectedSlot) {
      const newShift: Shift = {
        id: Math.random().toString(36).substr(2, 9),
        employeeId,
        dayIndex: selectedSlot.day,
        startTime: selectedSlot.hour.toString().padStart(2, '0'),
        endTime: (selectedSlot.hour + 8).toString().padStart(2, '0'), // Default 8 hr shift
        role
      };
      onAddShift(newShift);
      setSelectedSlot(null);
    }
  };

  const handleAiSuggest = async (dayIndex: number) => {
    setIsAiLoading(dayIndex);
    try {
      const resultJson = await generateSmartScheduleSuggestion(employees, dayIndex);
      const suggestions = JSON.parse(resultJson);
      
      suggestions.forEach((sug: any) => {
        const emp = employees.find(e => e.name === sug.suggestedName) || employees[0];
        const newShift: Shift = {
          id: Math.random().toString(36).substr(2, 9),
          employeeId: emp.id,
          dayIndex: dayIndex,
          startTime: '17', // Evening rush
          endTime: '22',
          role: sug.role
        };
        onAddShift(newShift);
      });
    } catch (e) {
      alert("AI Suggestion failed. Try again.");
    } finally {
      setIsAiLoading(null);
    }
  };

  const handleBroadcast = () => {
    // Simulate sending notifications
    setTimeout(() => {
      setBroadcastStep('SENT');
    }, 800);
  };

  const closeBroadcast = () => {
    setIsBroadcastOpen(false);
    setTimeout(() => setBroadcastStep('SELECT'), 300);
  };

  // Helper to calculate total hours for an employee
  const getEmployeeWeeklyHours = (empId: string) => {
    return shifts
      .filter(s => s.employeeId === empId)
      .reduce((acc, s) => acc + (parseInt(s.endTime) - parseInt(s.startTime)), 0);
  };

  // Filter eligible employees for broadcast
  const getEligibleForBroadcast = () => {
    return employees.filter(emp => {
      // Role match
      if (emp.role !== broadcastConfig.role) return false;
      
      // Unavailable match
      if (emp.unavailableDays.includes(broadcastConfig.dayIndex)) return false;
      
      // Already working check
      const isWorking = shifts.some(s => 
        s.employeeId === emp.id && 
        s.dayIndex === broadcastConfig.dayIndex &&
        parseInt(s.startTime) <= parseInt(broadcastConfig.startTime) &&
        parseInt(s.endTime) > parseInt(broadcastConfig.startTime)
      );
      if (isWorking) return false;

      return true;
    });
  };

  const eligibleEmployees = getEligibleForBroadcast();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50 gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="text-sm text-slate-500 font-medium whitespace-nowrap">
            Manage Schedule
          </div>
          {/* Mobile-friendly Broadcast Button */}
          <button 
            onClick={() => setIsBroadcastOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 rounded-md transition-all animate-pulse"
            title="Find Coverage ASAP"
          >
            <Megaphone size={14} /> 
            <span>Find Coverage</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
           <button 
             onClick={onLoadTemplate}
             className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-white hover:shadow-sm rounded-md border border-slate-200 transition-all"
             title="Load Saved Template"
           >
             <Download size={14} /> <span className="hidden sm:inline">Load</span>
           </button>
           <button 
             onClick={onSaveTemplate}
             className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-white hover:shadow-sm rounded-md border border-slate-200 transition-all"
             title="Save Current as Template"
           >
             <Save size={14} /> <span className="hidden sm:inline">Save</span>
           </button>
           <div className="w-px h-6 bg-slate-300 mx-1 hidden md:block"></div>
           <button 
             onClick={onClearSchedule}
             className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md border border-transparent transition-all"
             title="Clear All Shifts"
           >
             <Trash2 size={14} /> <span className="hidden sm:inline">Clear</span>
           </button>
           <button 
             onClick={onExportSchedule}
             className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-md border border-indigo-100 transition-all ml-2"
             title="Export CSV"
           >
             <FileDown size={14} /> <span className="hidden sm:inline">Export</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-slate-200">
        {DAYS_OF_WEEK.map((day, index) => {
          const dayShifts = getShiftsForDay(index);
          const totalHours = dayShifts.reduce((acc, s) => acc + (parseInt(s.endTime) - parseInt(s.startTime)), 0);
          
          return (
            <div key={day} className="min-h-[120px] md:min-h-[500px] flex flex-col group relative bg-slate-50/50 hover:bg-white transition-colors">
              <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10 md:static">
                <div>
                  <span className="font-semibold text-slate-700">{day}</span>
                  <div className="text-xs text-slate-400">{totalHours} hrs scheduled</div>
                </div>
                <button 
                  onClick={() => handleAiSuggest(index)}
                  disabled={isAiLoading === index}
                  className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors"
                  title="AI Auto-Fill Shift"
                >
                  {isAiLoading === index ? (
                    <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                  ) : (
                    <Sparkles size={16} />
                  )}
                </button>
              </div>
              
              <div className="p-2 flex-1 space-y-2">
                {dayShifts.map(shift => {
                  const emp = employees.find(e => e.id === shift.employeeId);
                  if (!emp) return null;
                  return (
                    <div key={shift.id} className="bg-white border border-l-4 border-slate-200 border-l-indigo-500 rounded p-2 shadow-sm text-sm relative group/card hover:shadow-md transition-shadow">
                      <button 
                        onClick={() => onRemoveShift(shift.id)}
                        className="absolute top-1 right-1 text-slate-300 hover:text-red-500 opacity-100 md:opacity-0 group-hover/card:opacity-100 transition-opacity p-1"
                      >
                        <X size={14} />
                      </button>
                      <div className="font-medium text-slate-800 pr-4">{emp.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Clock size={10} /> {shift.startTime}:00 - {shift.endTime}:00
                      </div>
                      <div className="text-xs text-indigo-600 mt-1 font-medium">{shift.role}</div>
                    </div>
                  );
                })}
                
                <button 
                  onClick={() => setSelectedSlot({ day: index, hour: 9 })}
                  className="w-full py-3 md:py-2 border border-dashed border-slate-300 rounded text-slate-400 text-sm hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-1 mt-2"
                >
                  <Plus size={14} /> Add Shift
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Shift Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800">Add Shift for {DAYS_OF_WEEK[selectedSlot.day]}</h3>
              <button onClick={() => setSelectedSlot(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <p className="text-sm text-slate-500 mb-4">Select an employee to assign a default 8-hour shift.</p>
              <div className="space-y-2">
                {employees.map(emp => {
                  const isUnavailable = emp.unavailableDays?.includes(selectedSlot.day);
                  const shiftsToday = shifts.filter(s => s.employeeId === emp.id && s.dayIndex === selectedSlot.day).length;
                  const weeklyHours = getEmployeeWeeklyHours(emp.id);
                  const isOvertime = weeklyHours >= 40;
                  const isApproachingOvertime = weeklyHours >= 32 && weeklyHours < 40;
                  
                  return (
                    <button 
                      key={emp.id}
                      onClick={() => !isUnavailable && handleAddShift(emp.id, emp.role)}
                      disabled={isUnavailable}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left group
                        ${isUnavailable 
                          ? 'border-red-100 bg-red-50/50 opacity-70 cursor-not-allowed' 
                          : shiftsToday > 0
                            ? 'border-amber-100 bg-amber-50/30 hover:border-amber-300'
                            : 'border-slate-200 hover:border-indigo-500 hover:bg-indigo-50'
                        }
                      `}
                    >
                      <div className="relative">
                        <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full object-cover grayscale-0" />
                        {isUnavailable && (
                          <div className="absolute -bottom-1 -right-1 bg-red-500 text-white rounded-full p-0.5 border-2 border-white">
                            <X size={10} />
                          </div>
                        )}
                        {!isUnavailable && isOvertime && (
                          <div className="absolute -bottom-1 -right-1 bg-red-600 text-white rounded-full p-0.5 border-2 border-white" title="Overtime Alert">
                            <AlertTriangle size={10} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div className={`font-medium ${isUnavailable ? 'text-slate-500' : 'text-slate-800 group-hover:text-indigo-700'}`}>
                            {emp.name}
                          </div>
                          
                          {/* Status Badges */}
                          <div className="flex gap-1">
                            {!isUnavailable && !isOvertime && !isApproachingOvertime && (
                                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {weeklyHours} hrs
                                </span>
                            )}
                            {!isUnavailable && isApproachingOvertime && (
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                                  {weeklyHours} hrs
                                </span>
                            )}
                            {!isUnavailable && isOvertime && (
                                <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <AlertTriangle size={8} /> {weeklyHours} hrs
                                </span>
                            )}
                            {isUnavailable && (
                                <span className="text-[10px] font-bold text-red-500 bg-red-100 px-1.5 py-0.5 rounded">
                                UNAVAILABLE
                                </span>
                            )}
                            {!isUnavailable && shiftsToday > 0 && (
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                                ALREADY SCHEDULED
                                </span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500">{emp.role} • ${emp.hourlyRate}/hr</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal (The "Oh Shit" Button) */}
      {isBroadcastOpen && (
        <div className="fixed inset-0 bg-indigo-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-5 sm:zoom-in duration-200">
            
            {/* Header */}
            <div className="bg-indigo-600 p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Megaphone size={120} />
              </div>
              <button 
                onClick={closeBroadcast}
                className="absolute top-4 right-4 text-indigo-200 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Megaphone className="animate-pulse" />
                Find Coverage
              </h2>
              <p className="text-indigo-100 mt-2 text-sm opacity-90">
                Instantly notify available employees about an open shift.
              </p>
            </div>

            <div className="p-6">
              {broadcastStep === 'SELECT' ? (
                <>
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Day</label>
                        <select 
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={broadcastConfig.dayIndex}
                          onChange={(e) => setBroadcastConfig({...broadcastConfig, dayIndex: parseInt(e.target.value)})}
                        >
                          {DAYS_OF_WEEK.map((day, i) => (
                            <option key={day} value={i}>{day}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Start Time</label>
                        <select 
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={broadcastConfig.startTime}
                          onChange={(e) => setBroadcastConfig({...broadcastConfig, startTime: e.target.value})}
                        >
                          {Array.from({length: 15}, (_, i) => i + 8).map(hour => (
                            <option key={hour} value={hour}>{hour}:00</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Role Needed</label>
                      <select 
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={broadcastConfig.role}
                        onChange={(e) => setBroadcastConfig({...broadcastConfig, role: e.target.value as any})}
                      >
                         <option value="Server">Server</option>
                         <option value="Cook">Cook</option>
                         <option value="Bartender">Bartender</option>
                         <option value="Host">Host</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Search size={14} /> 
                        Eligible Employees ({eligibleEmployees.length})
                      </h4>
                      <span className="text-[10px] text-slate-400 bg-white px-2 py-1 rounded-full border border-slate-100">
                        Available & Not Working
                      </span>
                    </div>
                    
                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                      {eligibleEmployees.length > 0 ? (
                        eligibleEmployees.map(emp => (
                          <div key={emp.id} className="flex items-center gap-3 p-2 bg-white border border-slate-100 rounded-lg">
                            <img src={emp.avatar} className="w-8 h-8 rounded-full" alt="" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800 truncate">{emp.name}</p>
                              <p className="text-xs text-slate-500">{emp.role}</p>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-slate-400 text-sm">
                          No eligible employees found for this slot.
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={handleBroadcast}
                    disabled={eligibleEmployees.length === 0}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <BellRing size={18} />
                    Broadcast Open Shift
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Notifications Sent!</h3>
                  <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                    We've alerted <span className="font-bold text-slate-800">{eligibleEmployees.length}</span> available staff members. You'll be notified when someone claims the shift.
                  </p>
                  <button 
                    onClick={closeBroadcast}
                    className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
