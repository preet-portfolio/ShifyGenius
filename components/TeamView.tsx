import React, { useState } from 'react';
import { Employee, AvailabilityRequest, OvertimeRule } from '../types';
import { DAYS_OF_WEEK } from '../constants';
import { Mail, Check, X, Edit2, User, Clock, Trash2, AlertTriangle, Info } from 'lucide-react';

interface TeamViewProps {
  employees: Employee[];
  requests: AvailabilityRequest[];
  onUpdateEmployee: (updatedEmployee: Employee) => void;
  onAddEmployee: (newEmployee: Employee) => void;
  onRemoveEmployee: (id: string) => void;
  onApproveRequest: (request: AvailabilityRequest) => void;
  onRejectRequest: (requestId: string) => void;
}

export const TeamView: React.FC<TeamViewProps> = ({ 
  employees, 
  requests, 
  onUpdateEmployee,
  onAddEmployee,
  onRemoveEmployee,
  onApproveRequest,
  onRejectRequest 
}) => {
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'REQUESTS'>('DIRECTORY');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  
  // New Employee Form State
  const [newEmployeeData, setNewEmployeeData] = useState<Partial<Employee>>({
    name: '',
    role: 'Server',
    hourlyRate: 15,
    maxHoursPerWeek: 40,
    unavailableDays: [],
    preferredShifts: [],
    overtimeRule: 'STANDARD'
  });

  const pendingRequests = requests.filter(r => r.status === 'PENDING');

  const handleToggleDay = (dayIndex: number) => {
    if (!editingEmployee) return;
    
    const currentUnavailable = editingEmployee.unavailableDays || [];
    const isUnavailable = currentUnavailable.includes(dayIndex);
    
    let newUnavailable;
    if (isUnavailable) {
      newUnavailable = currentUnavailable.filter(d => d !== dayIndex);
    } else {
      newUnavailable = [...currentUnavailable, dayIndex].sort();
    }
    
    setEditingEmployee({
      ...editingEmployee,
      unavailableDays: newUnavailable
    });
  };

  const saveEmployee = () => {
    if (editingEmployee) {
      onUpdateEmployee(editingEmployee);
      setEditingEmployee(null);
    }
  };

  const toggleNewEmployeeDay = (dayIndex: number) => {
    const current = newEmployeeData.unavailableDays || [];
    if (current.includes(dayIndex)) {
      setNewEmployeeData({...newEmployeeData, unavailableDays: current.filter(d => d !== dayIndex)});
    } else {
      setNewEmployeeData({...newEmployeeData, unavailableDays: [...current, dayIndex].sort()});
    }
  };

  const handleSaveNewEmployee = () => {
    if (!newEmployeeData.name || !newEmployeeData.role) return;

    const newEmployee: Employee = {
      id: Math.random().toString(36).substr(2, 9),
      name: newEmployeeData.name,
      role: newEmployeeData.role as any,
      hourlyRate: newEmployeeData.hourlyRate || 15,
      maxHoursPerWeek: newEmployeeData.maxHoursPerWeek || 40,
      unavailableDays: newEmployeeData.unavailableDays || [],
      preferredShifts: [],
      overtimeRule: newEmployeeData.overtimeRule || 'STANDARD',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newEmployeeData.name)}&background=random`
    };

    onAddEmployee(newEmployee);
    setIsAddingEmployee(false);
    // Reset form
    setNewEmployeeData({
      name: '',
      role: 'Server',
      hourlyRate: 15,
      maxHoursPerWeek: 40,
      unavailableDays: [],
      preferredShifts: [],
      overtimeRule: 'STANDARD'
    });
  };

  const confirmDeleteEmployee = () => {
    if (employeeToDelete) {
      onRemoveEmployee(employeeToDelete.id);
      setEmployeeToDelete(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
      {/* Tabs Header */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('DIRECTORY')}
          className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'DIRECTORY' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
        >
          Staff Directory
        </button>
        <button 
          onClick={() => setActiveTab('REQUESTS')}
          className={`flex-1 py-4 text-sm font-medium transition-colors relative ${activeTab === 'REQUESTS' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
        >
          Availability Requests
          {pendingRequests.length > 0 && (
            <span className="absolute top-3 ml-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      <div className="p-0">
        {/* DIRECTORY TAB */}
        {activeTab === 'DIRECTORY' && (
          <>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800">Team Members ({employees.length})</h3>
              <button 
                onClick={() => setIsAddingEmployee(true)}
                className="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
              >
                <User size={16} /> Add Employee
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {employees.map(emp => (
                <div key={emp.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4">
                  <div className="flex items-center gap-4">
                    <img src={emp.avatar} alt={emp.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                    <div>
                      <h4 className="font-medium text-slate-900">{emp.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">{emp.role}</span>
                        <span>•</span>
                        <span>${emp.hourlyRate}/hr</span>
                        {emp.overtimeRule && emp.overtimeRule !== 'STANDARD' && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded font-bold text-[10px] border border-amber-200">
                            {emp.overtimeRule === 'CALIFORNIA' ? 'CA Rules' : 'Sun 2x'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 sm:gap-8 text-sm">
                    <div className="flex-1 sm:text-right">
                      <span className="block text-slate-400 text-xs mb-1">Availability</span>
                      <div className="flex gap-1 justify-end flex-wrap">
                        {DAYS_OF_WEEK.map((day, idx) => {
                          const isUnavailable = emp.unavailableDays?.includes(idx);
                          return (
                            <span 
                              key={day} 
                              className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${isUnavailable ? 'bg-slate-100 text-slate-300' : 'bg-emerald-100 text-emerald-700'}`}
                              title={isUnavailable ? 'Unavailable' : 'Available'}
                            >
                              {day.charAt(0)}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setEditingEmployee(emp)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                        title="Edit Availability"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => setEmployeeToDelete(emp)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Remove Employee"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* REQUESTS TAB */}
        {activeTab === 'REQUESTS' && (
          <div className="p-4 bg-slate-50/50 min-h-[400px]">
            {pendingRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Mail size={48} className="mb-4 opacity-50" />
                <p>No pending requests.</p>
              </div>
            ) : (
              <div className="space-y-3">
                 {pendingRequests.map(req => (
                   <div key={req.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                     <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center gap-2">
                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${req.type === 'AVAILABILITY_CHANGE' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                           {req.type.replace('_', ' ')}
                         </span>
                         <span className="text-xs text-slate-400">{req.date}</span>
                       </div>
                     </div>
                     
                     <div className="flex items-start gap-3 mb-4">
                       <div className="bg-slate-100 p-2 rounded-full">
                         <User size={20} className="text-slate-500" />
                       </div>
                       <div>
                         <h4 className="font-medium text-slate-900">{req.employeeName}</h4>
                         <p className="text-sm text-slate-600 mt-1 bg-slate-50 p-3 rounded-lg border border-slate-100">"{req.note}"</p>
                         {req.requestedUnavailableDays && (
                            <div className="mt-2 text-xs flex items-center gap-2">
                                <span className="text-slate-400">Requesting OFF:</span> 
                                {req.requestedUnavailableDays.map(d => DAYS_OF_WEEK[d]).join(', ')}
                            </div>
                         )}
                       </div>
                     </div>
                     
                     <div className="flex gap-2 justify-end border-t border-slate-50 pt-3">
                       <button 
                         onClick={() => onRejectRequest(req.id)}
                         className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                       >
                         <X size={16} /> Reject
                       </button>
                       <button 
                         onClick={() => onApproveRequest(req)}
                         className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition-colors flex items-center gap-2"
                       >
                         <Check size={16} /> Approve
                       </button>
                     </div>
                   </div>
                 ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Edit Employee: {editingEmployee.name}</h3>
              <button onClick={() => setEditingEmployee(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                 <img src={editingEmployee.avatar} alt="" className="w-16 h-16 rounded-full border-2 border-white shadow-sm" />
                 <div>
                    <p className="text-sm text-slate-500">Hourly Rate</p>
                    <p className="font-semibold text-slate-800">${editingEmployee.hourlyRate}</p>
                 </div>
                 <div>
                    <p className="text-sm text-slate-500">Max Hours</p>
                    <p className="font-semibold text-slate-800">{editingEmployee.maxHoursPerWeek} hrs/wk</p>
                 </div>
              </div>

              {/* Overtime Rule Selector (Edit Mode) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                   Overtime Rule <Info size={14} className="text-slate-400" />
                </label>
                <select 
                    value={editingEmployee.overtimeRule || 'STANDARD'}
                    onChange={(e) => setEditingEmployee({...editingEmployee, overtimeRule: e.target.value as OvertimeRule})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                    <option value="STANDARD">Standard (1.5x after 40hrs/wk)</option>
                    <option value="CALIFORNIA">California (Daily 8h + Weekly 40h)</option>
                    <option value="SUNDAY_DOUBLE">Sunday Double Pay (2x Sun)</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">Determines how overtime pay is calculated for this employee.</p>
              </div>

              <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                <Clock size={16} /> Availability
              </h4>
              <p className="text-xs text-slate-500 mb-4">Click days to toggle availability. <span className="text-red-500 font-medium">Red</span> days are marked as unavailable.</p>
              
              <div className="flex justify-between gap-2 mb-8">
                {DAYS_OF_WEEK.map((day, idx) => {
                  const isUnavailable = editingEmployee.unavailableDays?.includes(idx);
                  return (
                    <button
                      key={day}
                      onClick={() => handleToggleDay(idx)}
                      className={`flex-1 aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all ${
                        isUnavailable 
                          ? 'bg-red-50 text-red-600 border border-red-200' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      <span>{day}</span>
                      {isUnavailable ? <X size={12} className="mt-1" /> : <Check size={12} className="mt-1" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setEditingEmployee(null)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                <button onClick={saveEmployee} className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {employeeToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Remove Employee?</h3>
              <p className="text-slate-500 text-sm mb-6">
                Are you sure you want to remove <span className="font-semibold text-slate-800">{employeeToDelete.name}</span>? 
                This action will delete all their scheduled shifts and cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setEmployeeToDelete(null)}
                  className="flex-1 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteEmployee}
                  className="flex-1 py-2.5 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg shadow-md shadow-red-200 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddingEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Onboard New Employee</h3>
              <button onClick={() => setIsAddingEmployee(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={newEmployeeData.name}
                  onChange={(e) => setNewEmployeeData({...newEmployeeData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select 
                    value={newEmployeeData.role}
                    onChange={(e) => setNewEmployeeData({...newEmployeeData, role: e.target.value as any})}
                    className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Server">Server</option>
                    <option value="Cook">Cook</option>
                    <option value="Bartender">Bartender</option>
                    <option value="Manager">Manager</option>
                    <option value="Host">Host</option>
                    <option value="Retail">Retail</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hourly Rate ($)</label>
                  <input 
                    type="number" 
                    value={newEmployeeData.hourlyRate}
                    onChange={(e) => setNewEmployeeData({...newEmployeeData, hourlyRate: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Max Hours / Week</label>
                    <input 
                        type="number" 
                        value={newEmployeeData.maxHoursPerWeek}
                        onChange={(e) => setNewEmployeeData({...newEmployeeData, maxHoursPerWeek: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Overtime Rule</label>
                    <select 
                        value={newEmployeeData.overtimeRule || 'STANDARD'}
                        onChange={(e) => setNewEmployeeData({...newEmployeeData, overtimeRule: e.target.value as OvertimeRule})}
                        className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="STANDARD">Standard</option>
                        <option value="CALIFORNIA">California</option>
                        <option value="SUNDAY_DOUBLE">Sun 2x</option>
                    </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Initial Availability</label>
                <p className="text-xs text-slate-500 mb-2">Select days the employee <span className="text-red-600 font-bold">CANNOT</span> work.</p>
                <div className="flex justify-between gap-2">
                  {DAYS_OF_WEEK.map((day, idx) => {
                    const isUnavailable = newEmployeeData.unavailableDays?.includes(idx);
                    return (
                      <button
                        key={day}
                        onClick={() => toggleNewEmployeeDay(idx)}
                        className={`flex-1 aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all ${
                          isUnavailable 
                            ? 'bg-red-50 text-red-600 border border-red-200' 
                            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{day}</span>
                        {isUnavailable && <X size={12} className="mt-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setIsAddingEmployee(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                <button 
                  onClick={handleSaveNewEmployee} 
                  disabled={!newEmployeeData.name}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};