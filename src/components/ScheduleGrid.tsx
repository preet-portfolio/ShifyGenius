import React, { useState, useEffect } from 'react';
import { Employee, Shift } from '@/src/types';
import { DAYS_OF_WEEK, formatTime } from '@/src/constants';
import { Plus, X, Clock, Sparkles, AlertTriangle, Save, Download, Trash2, FileDown, Megaphone, Search, CheckCircle2, BellRing, Copy, MessageSquare, Send, GripVertical, UserPlus } from 'lucide-react';
import { generateSmartScheduleSuggestion } from '@/src/services/geminiService';

interface ScheduleGridProps {
  shifts: Shift[];
  employees: Employee[];
  onAddShift: (shift: Shift) => void;
  onRemoveShift: (shiftId: string) => void;
  onSaveTemplate?: () => void;
  onLoadTemplate?: () => void;
  onClearSchedule?: () => void;
  onExportSchedule?: () => void;
  triggerBroadcast?: boolean;
  resetBroadcastTrigger?: () => void;
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({ 
  shifts, 
  employees, 
  onAddShift, 
  onRemoveShift,
  onSaveTemplate,
  onLoadTemplate,
  onClearSchedule,
  onExportSchedule,
  triggerBroadcast,
  resetBroadcastTrigger
}) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ day: number, hour: number } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<number | null>(null);
  const [draggedEmployeeId, setDraggedEmployeeId] = useState<string | null>(null);

  // Broadcast Modal State
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastStep, setBroadcastStep] = useState<'SELECT' | 'SENT'>('SELECT');
  const [broadcastConfig, setBroadcastConfig] = useState({
    dayIndex: new Date().getDay() - 1 < 0 ? 0 : new Date().getDay() - 1, // Default to today
    startTime: '17',
    endTime: '22',
    role: 'Server' as const
  });
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Helper to get shift for a cell
  const getShiftsForDay = (dayIndex: number) => shifts.filter(s => s.dayIndex === dayIndex);

  useEffect(() => {
    if (triggerBroadcast) {
        setIsBroadcastOpen(true);
        if (resetBroadcastTrigger) resetBroadcastTrigger();
    }
  }, [triggerBroadcast, resetBroadcastTrigger]);

  const handleAddShift = (employeeId: string, role: string, dayIndex?: number, startHour?: number) => {
    const day = dayIndex !== undefined ? dayIndex : (selectedSlot?.day || 0);
    const start = startHour !== undefined ? startHour : (selectedSlot?.hour || 9);
    
    const newShift: Shift = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId,
      dayIndex: day,
      startTime: start.toString().padStart(2, '0'),
      endTime: (start + 8).toString().padStart(2, '0'), // Default 8 hr shift
      role
    };
    onAddShift(newShift);
    setSelectedSlot(null);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, employeeId: string) => {
    e.dataTransfer.setData("text/plain", employeeId);
    setDraggedEmployeeId(employeeId);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent, dayIndex: number) => {
    e.preventDefault();
    const employeeId = e.dataTransfer.getData("text/plain");
    const emp = employees.find(e => e.id === employeeId);
    if (emp) {
        // Default to 9am start for dropped shifts
        handleAddShift(employeeId, emp.role, dayIndex, 9);
    }
    setDraggedEmployeeId(null);
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

  useEffect(() => {
    const dayName = DAYS_OF_WEEK[broadcastConfig.dayIndex];
    // Use formatTime for the message so it reads nicely (e.g. 5:00 PM)
    const startStr = formatTime(broadcastConfig.startTime);
    const endStr = formatTime(broadcastConfig.endTime);
    
    const msg = `📢 URGENT: Shift Cover Needed!\n\nRole: ${broadcastConfig.role}\nWhen: ${dayName} @ ${startStr} - ${endStr}\n\nReply ASAP if you can take this! First come, first served.`;
    setBroadcastMessage(msg);
  }, [broadcastConfig]);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(broadcastMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBroadcast = () => {
    setTimeout(() => {
      setBroadcastStep('SENT');
    }, 800);
  };

  const closeBroadcast = () => {
    setIsBroadcastOpen(false);
    setTimeout(() => setBroadcastStep('SELECT'), 300);
  };

  const getEmployeeWeeklyHours = (empId: string) => {
    return shifts
      .filter(s => s.employeeId === empId)
      .reduce((acc, s) => {
        const end = parseInt(s.endTime) === 0 ? 24 : parseInt(s.endTime);
        return acc + (end - parseInt(s.startTime));
      }, 0);
  };

  const getEligibleForBroadcast = () => {
    return employees.filter(emp => {
      if (emp.role !== broadcastConfig.role) return false;
      if (emp.unavailableDays.includes(broadcastConfig.dayIndex)) return false;
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-200px)] min-h-[600px]">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50 gap-4 flex-none">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="text-sm text-slate-500 font-medium whitespace-nowrap">
            Manage Schedule
          </div>
          <button 
            onClick={() => setIsBroadcastOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm shadow-red-200 rounded-md transition-all animate-pulse"
          >
            <Megaphone size={14} /> 
            <span>Find Coverage</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
           <button onClick={onLoadTemplate} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50">
             <Download size={14} /> <span className="hidden sm:inline">Load</span>
           </button>
           <button onClick={onSaveTemplate} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50">
             <Save size={14} /> <span className="hidden sm:inline">Save</span>
           </button>
           <button onClick={onClearSchedule} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 border border-transparent hover:bg-red-50 rounded">
             <Trash2 size={14} /> <span className="hidden sm:inline">Clear</span>
           </button>
           <button onClick={onExportSchedule} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 rounded">
             <FileDown size={14} /> <span className="hidden sm:inline">Export</span>
           </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* DRAG & DROP SIDEBAR - QUICK SCHEDULE */}
        <div className="w-56 border-r border-slate-200 bg-slate-50 overflow-y-auto hidden md:block">
            <div className="p-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <GripVertical size={14} /> Quick Drag
                </h3>
                <div className="space-y-3">
                    {employees.map(emp => {
                        const hours = getEmployeeWeeklyHours(emp.id);
                        const isOt = hours >= 40;
                        return (
                            <div 
                                key={emp.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, emp.id)}
                                className={`p-3 bg-white border rounded-lg shadow-sm cursor-move hover:shadow-md hover:border-indigo-400 transition-all group active:cursor-grabbing ${isOt ? 'border-red-200' : 'border-slate-200'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <img src={emp.avatar} className="w-8 h-8 rounded-full pointer-events-none" alt="" />
                                    <div>
                                        <div className="text-sm font-semibold text-slate-700">{emp.name}</div>
                                        <div className="text-xs text-slate-400">{emp.role}</div>
                                    </div>
                                </div>
                                <div className="mt-2 flex justify-between items-center text-xs">
                                    <span className={`${isOt ? 'text-red-600 font-bold' : 'text-slate-500'}`}>{hours} hrs</span>
                                    <span className="text-slate-300 group-hover:text-indigo-400">Drag me</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="mt-8 p-4 bg-indigo-50 rounded-lg border border-indigo-100 text-center">
                    <p className="text-xs text-indigo-600 font-medium">💡 Tip: Drag staff onto any day to instantly add a 9-5 shift.</p>
                </div>
            </div>
        </div>

        {/* MAIN SCHEDULE GRID */}
        <div className="flex-1 overflow-auto bg-slate-100/50">
            <div className="grid grid-cols-1 md:grid-cols-7 h-full min-h-[600px] divide-y md:divide-y-0 md:divide-x divide-slate-200">
                {DAYS_OF_WEEK.map((day, index) => {
                const dayShifts = getShiftsForDay(index);
                const totalHours = dayShifts.reduce((acc, s) => {
                    const end = parseInt(s.endTime) === 0 ? 24 : parseInt(s.endTime);
                    return acc + (end - parseInt(s.startTime));
                }, 0);
                
                return (
                    <div 
                        key={day} 
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className="flex flex-col group relative bg-slate-50/30 hover:bg-indigo-50/20 transition-colors min-h-[150px]"
                    >
                    <div className="p-3 border-b border-slate-200/50 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
                        <div>
                        <span className="font-semibold text-slate-700">{day}</span>
                        <div className="text-xs text-slate-400">{totalHours} hrs</div>
                        </div>
                        <button 
                        onClick={() => handleAiSuggest(index)}
                        disabled={isAiLoading === index}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors"
                        title="AI Auto-Fill"
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
                            <div key={shift.id} className="bg-white border-l-4 border-l-indigo-500 rounded p-2 shadow-sm text-sm relative group/card hover:shadow-md transition-shadow animate-in zoom-in duration-200">
                            <button 
                                onClick={() => onRemoveShift(shift.id)}
                                className="absolute top-1 right-1 text-slate-300 hover:text-red-500 opacity-0 group-hover/card:opacity-100 transition-opacity p-1"
                            >
                                <X size={14} />
                            </button>
                            <div className="font-medium text-slate-800 pr-4">{emp.name}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                <Clock size={10} /> {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                            </div>
                            <div className="text-xs text-indigo-600 mt-1 font-medium">{shift.role}</div>
                            </div>
                        );
                        })}
                        
                        <button 
                        onClick={() => setSelectedSlot({ day: index, hour: 9 })}
                        className="w-full py-2 border border-dashed border-slate-300 rounded text-slate-400 text-xs hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-1 opacity-50 hover:opacity-100"
                        >
                        <Plus size={12} /> Add
                        </button>
                    </div>
                    </div>
                );
                })}
            </div>
        </div>
      </div>

      {/* Add Shift Modal (Kept for manual entry) */}
      {selectedSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800">Add Shift for {DAYS_OF_WEEK[selectedSlot.day]}</h3>
              <button onClick={() => setSelectedSlot(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                {employees.map(emp => {
                  const isUnavailable = emp.unavailableDays?.includes(selectedSlot.day);
                  const shiftsToday = shifts.filter(s => s.employeeId === emp.id && s.dayIndex === selectedSlot.day).length;
                  const weeklyHours = getEmployeeWeeklyHours(emp.id);
                  const isOvertime = weeklyHours >= 40;
                  
                  return (
                    <button 
                      key={emp.id}
                      onClick={() => !isUnavailable && handleAddShift(emp.id, emp.role)}
                      disabled={isUnavailable}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left group
                        ${isUnavailable 
                          ? 'border-red-100 bg-red-50/50 opacity-70 cursor-not-allowed' 
                          : shiftsToday > 0
                            ? 'border-amber-100 bg-amber-50/30'
                            : 'border-slate-200 hover:border-indigo-500 hover:bg-indigo-50'
                        }
                      `}
                    >
                       <img src={emp.avatar} alt="" className="w-10 h-10 rounded-full grayscale-0" />
                       <div className="flex-1">
                         <div className="font-medium text-slate-800">{emp.name}</div>
                         <div className="flex gap-2 text-xs mt-0.5">
                            {isUnavailable && <span className="text-red-500 font-bold">UNAVAILABLE</span>}
                            {!isUnavailable && isOvertime && <span className="text-red-600 font-bold flex items-center gap-1"><AlertTriangle size={10}/> {weeklyHours} hrs (OT)</span>}
                            {!isUnavailable && !isOvertime && <span className="text-slate-500">{weeklyHours} hrs/wk</span>}
                         </div>
                       </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {isBroadcastOpen && (
        <div className="fixed inset-0 bg-indigo-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-5 sm:zoom-in duration-200">
            <div className="bg-red-600 p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Megaphone size={120} /></div>
              <button onClick={closeBroadcast} className="absolute top-4 right-4 text-red-200 hover:text-white transition-colors"><X size={24} /></button>
              <h2 className="text-2xl font-bold flex items-center gap-3"><Megaphone className="animate-pulse" /> Find Coverage</h2>
              <p className="text-red-100 mt-2 text-sm opacity-90">Instantly notify available employees.</p>
            </div>

            <div className="p-6">
              {broadcastStep === 'SELECT' ? (
                <>
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Day</label>
                        <select 
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                          value={broadcastConfig.dayIndex}
                          onChange={(e) => setBroadcastConfig({...broadcastConfig, dayIndex: parseInt(e.target.value)})}
                        >
                          {DAYS_OF_WEEK.map((day, i) => <option key={day} value={i}>{day}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Role</label>
                        <select 
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                          value={broadcastConfig.role}
                          onChange={(e) => setBroadcastConfig({...broadcastConfig, role: e.target.value as any})}
                        >
                            <option value="Server">Server</option>
                            <option value="Cook">Cook</option>
                            <option value="Bartender">Bartender</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Message Preview</label>
                        <button onClick={handleCopyMessage} className="text-indigo-600 text-xs font-medium flex items-center gap-1">
                            {copied ? <CheckCircle2 size={12}/> : <Copy size={12}/>} {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                    <textarea 
                        className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 resize-none"
                        value={broadcastMessage}
                        readOnly
                    />
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Search size={14} /> Eligible Employees ({eligibleEmployees.length})</h4>
                    </div>
                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                      {eligibleEmployees.map(emp => (
                          <div key={emp.id} className="flex items-center gap-3 p-2 bg-white border border-slate-100 rounded-lg">
                            <img src={emp.avatar} className="w-8 h-8 rounded-full" alt="" />
                            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-800 truncate">{emp.name}</p></div>
                            <a href={`sms:?body=${encodeURIComponent(broadcastMessage)}`} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">
                                <MessageSquare size={14} /> Text
                            </a>
                          </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={handleBroadcast}
                    className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Send size={18} /> Log Broadcast
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500" />
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Sent!</h3>
                  <button onClick={closeBroadcast} className="px-8 py-3 bg-slate-100 rounded-xl font-bold">Done</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};