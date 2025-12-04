import React, { useState } from 'react';
import { Employee, Shift } from '../types';
import { DAYS_OF_WEEK } from '../constants';
import { Plus, X, Clock, Sparkles, AlertTriangle } from 'lucide-react';
import { generateSmartScheduleSuggestion } from '../services/geminiService';

interface ScheduleGridProps {
  shifts: Shift[];
  employees: Employee[];
  onAddShift: (shift: Shift) => void;
  onRemoveShift: (shiftId: string) => void;
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({ shifts, employees, onAddShift, onRemoveShift }) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ day: number, hour: number } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<number | null>(null);

  // Helper to get shift for a cell (simplified view: 1 shift per person per day usually, but here we just list them)
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-slate-200">
        {DAYS_OF_WEEK.map((day, index) => {
          const dayShifts = getShiftsForDay(index);
          const totalHours = dayShifts.reduce((acc, s) => acc + (parseInt(s.endTime) - parseInt(s.startTime)), 0);
          
          return (
            <div key={day} className="min-h-[200px] md:min-h-[500px] flex flex-col group relative bg-slate-50/50 hover:bg-white transition-colors">
              <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
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
                        className="absolute top-1 right-1 text-slate-300 hover:text-red-500 opacity-0 group-hover/card:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                      <div className="font-medium text-slate-800">{emp.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Clock size={10} /> {shift.startTime}:00 - {shift.endTime}:00
                      </div>
                      <div className="text-xs text-indigo-600 mt-1 font-medium">{shift.role}</div>
                    </div>
                  );
                })}
                
                <button 
                  onClick={() => setSelectedSlot({ day: index, hour: 9 })}
                  className="w-full py-2 border border-dashed border-slate-300 rounded text-slate-400 text-sm hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-1"
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
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div className={`font-medium ${isUnavailable ? 'text-slate-500' : 'text-slate-800 group-hover:text-indigo-700'}`}>
                            {emp.name}
                          </div>
                          {isUnavailable && (
                            <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 bg-red-100 px-1.5 py-0.5 rounded">
                              UNAVAILABLE
                            </span>
                          )}
                          {!isUnavailable && shiftsToday > 0 && (
                             <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1 bg-amber-100 px-1.5 py-0.5 rounded">
                               ALREADY SCHEDULED
                             </span>
                          )}
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
    </div>
  );
};