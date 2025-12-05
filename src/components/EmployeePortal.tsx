import React, { useState } from 'react';
import { Employee, Shift, Notification, AvailabilityRequest } from '@/src/types';
import { DAYS_OF_WEEK, formatTime } from '@/src/constants';
import { Calendar, Clock, MapPin, User, LogOut, Phone, Bell, Send, Repeat, PlusCircle, CheckCircle2, Megaphone } from 'lucide-react';

interface EmployeePortalProps {
  employees: Employee[];
  shifts: Shift[];
  notifications: Notification[];
  onRequestAdd: (req: AvailabilityRequest) => void;
  onBackToAdmin: () => void;
}

export const EmployeePortal: React.FC<EmployeePortalProps> = ({ 
    employees, 
    shifts, 
    notifications,
    onRequestAdd,
    onBackToAdmin 
}) => {
  const [currentUserId, setCurrentUserId] = useState<string>(employees[2]?.id || employees[0]?.id); // Default to a Server/Employee
  const [activeTab, setActiveTab] = useState<'MY_SHIFTS' | 'TEAM' | 'REQUESTS' | 'NOTIFICATIONS'>('MY_SHIFTS');

  // Request Form States
  const [requestType, setRequestType] = useState<'TIME_OFF' | 'SHIFT_SWAP'>('TIME_OFF');
  const [requestDate, setRequestDate] = useState('');
  const [requestNote, setRequestNote] = useState('');
  const [swapShiftId, setSwapShiftId] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const currentUser = employees.find(e => e.id === currentUserId);
  
  // Sort shifts by day and time
  const sortedShifts = [...shifts].sort((a, b) => {
    if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
    return parseInt(a.startTime) - parseInt(b.startTime);
  });

  const myShifts = sortedShifts.filter(s => s.employeeId === currentUserId);
  const myNotifications = notifications.filter(n => n.userId === currentUserId || n.type === 'BROADCAST');
  const unreadCount = myNotifications.filter(n => !n.read).length;

  const handleSubmitRequest = () => {
    if (!currentUser) return;

    const newReq: AvailabilityRequest = {
        id: Math.random().toString(36).substr(2, 9),
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        type: requestType,
        date: new Date().toISOString().split('T')[0],
        note: requestNote,
        status: 'PENDING',
        requestedUnavailableDays: requestType === 'TIME_OFF' && requestDate ? [new Date(requestDate).getDay()] : undefined,
        swapShiftId: requestType === 'SHIFT_SWAP' ? swapShiftId : undefined
    };

    onRequestAdd(newReq);
    setFormSubmitted(true);
    setTimeout(() => {
        setFormSubmitted(false);
        setRequestNote('');
        setRequestDate('');
        setSwapShiftId('');
    }, 2000);
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden border-x border-slate-200">
      {/* Mobile Header */}
      <div className="bg-indigo-600 text-white p-4 pt-12 pb-6 rounded-b-3xl shadow-lg relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-xl font-bold">ShiftGenius</h1>
            <p className="text-indigo-200 text-xs">Employee Portal</p>
          </div>
          <div className="flex gap-2">
            <button 
                onClick={() => setActiveTab('NOTIFICATIONS')}
                className="relative p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
                <Bell size={18} />
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-indigo-600"></span>}
            </button>
            <button 
                onClick={onBackToAdmin}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs font-medium backdrop-blur-sm transition-colors flex items-center gap-1"
            >
                <LogOut size={12} /> Admin
            </button>
          </div>
        </div>
        
        {/* User Selector (Simulating Login) */}
        <div className="flex items-center gap-3 bg-indigo-700/50 p-3 rounded-xl backdrop-blur-md border border-indigo-500/30">
          <img src={currentUser?.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-white/50" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-indigo-200">Viewing as</p>
            <select 
              className="bg-transparent font-bold text-white text-sm outline-none w-full cursor-pointer"
              value={currentUserId}
              onChange={(e) => setCurrentUserId(e.target.value)}
            >
              {employees.map(e => (
                <option key={e.id} value={e.id} className="text-slate-900">{e.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-2 gap-2 sticky top-0 bg-slate-50 z-10 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('MY_SHIFTS')}
          className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold shadow-sm transition-all whitespace-nowrap ${activeTab === 'MY_SHIFTS' ? 'bg-white text-indigo-600 ring-2 ring-indigo-500/20' : 'bg-slate-200 text-slate-500'}`}
        >
          My Shifts
        </button>
        <button 
          onClick={() => setActiveTab('TEAM')}
          className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold shadow-sm transition-all whitespace-nowrap ${activeTab === 'TEAM' ? 'bg-white text-indigo-600 ring-2 ring-indigo-500/20' : 'bg-slate-200 text-slate-500'}`}
        >
          Team
        </button>
        <button 
          onClick={() => setActiveTab('REQUESTS')}
          className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold shadow-sm transition-all whitespace-nowrap ${activeTab === 'REQUESTS' ? 'bg-white text-indigo-600 ring-2 ring-indigo-500/20' : 'bg-slate-200 text-slate-500'}`}
        >
          Requests
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-4 pt-2">
        
        {/* MY SHIFTS TAB */}
        {activeTab === 'MY_SHIFTS' && (
          <>
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold text-slate-800">Upcoming Shifts</h2>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                {myShifts.length} this week
              </span>
            </div>
            
            {myShifts.length > 0 ? (
              myShifts.map(shift => (
                <div key={shift.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4 items-center">
                  <div className="flex flex-col items-center justify-center bg-indigo-50 text-indigo-600 w-14 h-14 rounded-lg font-bold">
                    <span className="text-xs uppercase">{DAYS_OF_WEEK[shift.dayIndex]}</span>
                    <span className="text-lg">{shift.dayIndex + 10}</span> {/* Mock Date */}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-slate-800 font-bold mb-1">
                      <Clock size={16} className="text-slate-400" />
                      {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin size={12} /> Main Floor • {shift.role}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400">
                <Calendar size={48} className="mx-auto mb-3 opacity-30" />
                <p>No shifts scheduled this week.</p>
              </div>
            )}

            <div 
                onClick={() => setActiveTab('REQUESTS')}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-5 text-white mt-6 shadow-lg cursor-pointer active:scale-95 transition-transform"
            >
              <h3 className="font-bold mb-1">Need a shift swap?</h3>
              <p className="text-xs text-purple-100 mb-3">You can request a trade with eligible team members.</p>
              <div className="w-full bg-white/20 text-white text-center py-2 rounded-lg font-bold text-sm backdrop-blur-sm">
                Request Trade
              </div>
            </div>
          </>
        )}

        {/* TEAM SCHEDULE TAB */}
        {activeTab === 'TEAM' && (
          <div className="space-y-6">
            {DAYS_OF_WEEK.map((day, index) => {
              const dayShifts = sortedShifts.filter(s => s.dayIndex === index);
              if (dayShifts.length === 0) return null;
              
              return (
                <div key={day}>
                  <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider mb-2 sticky top-0 bg-slate-50 py-2">
                    {day}
                  </h3>
                  <div className="space-y-2">
                    {dayShifts.map(shift => {
                      const emp = employees.find(e => e.id === shift.employeeId);
                      const isMe = emp?.id === currentUserId;
                      return (
                        <div key={shift.id} className={`p-3 rounded-xl border flex items-center gap-3 ${isMe ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'}`}>
                          <img src={emp?.avatar} className="w-8 h-8 rounded-full bg-slate-200" alt="" />
                          <div className="flex-1">
                            <p className={`text-sm font-bold ${isMe ? 'text-indigo-900' : 'text-slate-800'}`}>
                              {emp?.name} {isMe && '(You)'}
                            </p>
                            <p className="text-xs text-slate-500">{shift.role}</p>
                          </div>
                          <div className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                            {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* REQUESTS TAB */}
        {activeTab === 'REQUESTS' && (
            <div className="space-y-4">
                {formSubmitted ? (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-8 text-center animate-in zoom-in">
                        <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
                        <h3 className="text-lg font-bold text-emerald-900">Request Sent!</h3>
                        <p className="text-emerald-700 text-sm mt-2">Your manager has been notified.</p>
                        <button 
                            onClick={() => setFormSubmitted(false)}
                            className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold"
                        >
                            New Request
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="bg-white p-1 rounded-lg border border-slate-200 flex mb-4">
                            <button 
                                onClick={() => setRequestType('TIME_OFF')}
                                className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${requestType === 'TIME_OFF' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500'}`}
                            >
                                Time Off
                            </button>
                            <button 
                                onClick={() => setRequestType('SHIFT_SWAP')}
                                className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${requestType === 'SHIFT_SWAP' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500'}`}
                            >
                                Swap Shift
                            </button>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                {requestType === 'TIME_OFF' ? <Calendar size={18} /> : <Repeat size={18} />}
                                {requestType === 'TIME_OFF' ? 'Request Time Off' : 'Propose Shift Swap'}
                            </h3>

                            <div className="space-y-4">
                                {requestType === 'TIME_OFF' && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                                        <input 
                                            type="date" 
                                            value={requestDate}
                                            onChange={(e) => setRequestDate(e.target.value)}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                        />
                                    </div>
                                )}

                                {requestType === 'SHIFT_SWAP' && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Shift to Give Away</label>
                                        <select 
                                            value={swapShiftId}
                                            onChange={(e) => setSwapShiftId(e.target.value)}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                        >
                                            <option value="">-- Select Shift --</option>
                                            {myShifts.map(s => (
                                                <option key={s.id} value={s.id}>
                                                    {DAYS_OF_WEEK[s.dayIndex]} ({formatTime(s.startTime)} - {formatTime(s.endTime)})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reason / Note</label>
                                    <textarea 
                                        value={requestNote}
                                        onChange={(e) => setRequestNote(e.target.value)}
                                        placeholder={requestType === 'TIME_OFF' ? "e.g. Doctor's appointment" : "e.g. Can anyone take this? I have a family event."}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm h-24 resize-none"
                                    ></textarea>
                                </div>

                                <button 
                                    onClick={handleSubmitRequest}
                                    disabled={!requestNote || (requestType === 'SHIFT_SWAP' && !swapShiftId) || (requestType === 'TIME_OFF' && !requestDate)}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Send size={16} /> Submit Request
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'NOTIFICATIONS' && (
            <div className="space-y-3">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-slate-800">Notifications</h2>
                    <button className="text-xs text-indigo-600 font-medium">Mark all read</button>
                </div>
                
                {myNotifications.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        <Bell size={48} className="mx-auto mb-3 opacity-30" />
                        <p>No new notifications.</p>
                    </div>
                ) : (
                    myNotifications.map(notif => (
                        <div key={notif.id} className={`p-4 rounded-xl border flex gap-3 ${notif.read ? 'bg-white border-slate-100 opacity-70' : 'bg-indigo-50 border-indigo-100'}`}>
                            <div className={`mt-1 p-2 rounded-full ${notif.type === 'BROADCAST' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                {notif.type === 'BROADCAST' ? <Megaphone size={16} /> : <Bell size={16} />}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">{notif.title}</h4>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                                <span className="text-[10px] text-slate-400 mt-2 block">{notif.timestamp}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}

      </div>

      {/* Bottom Nav */}
      <div className="bg-white border-t border-slate-200 p-4 flex justify-between items-center text-xs text-slate-400">
        <button onClick={() => setActiveTab('MY_SHIFTS')} className={`flex flex-col items-center gap-1 ${activeTab === 'MY_SHIFTS' ? 'text-indigo-600' : ''}`}>
           <Calendar size={20} />
           <span>Schedule</span>
        </button>
        <button onClick={() => setActiveTab('REQUESTS')} className={`flex flex-col items-center gap-1 ${activeTab === 'REQUESTS' ? 'text-indigo-600' : ''}`}>
           <PlusCircle size={20} />
           <span>Requests</span>
        </button>
        <button onClick={() => setActiveTab('NOTIFICATIONS')} className={`flex flex-col items-center gap-1 ${activeTab === 'NOTIFICATIONS' ? 'text-indigo-600' : ''}`}>
           <Bell size={20} />
           <span>Alerts</span>
        </button>
        <div className="flex flex-col items-center gap-1">
           <User size={20} />
           <span>Profile</span>
        </div>
      </div>
    </div>
  );
};