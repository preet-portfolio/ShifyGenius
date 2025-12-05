import { Employee, Shift, AvailabilityRequest, Notification } from "./types";

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Sarah Chen', role: 'Manager', hourlyRate: 28, avatar: 'https://picsum.photos/100/100?random=1', maxHoursPerWeek: 45, preferredShifts: ['Morning'], unavailableDays: [6], overtimeRule: 'CALIFORNIA' }, // CA Rule Demo
  { id: '2', name: 'Mike Ross', role: 'Cook', hourlyRate: 22, avatar: 'https://picsum.photos/100/100?random=2', maxHoursPerWeek: 40, preferredShifts: ['Evening'], unavailableDays: [0, 1], overtimeRule: 'STANDARD' },
  { id: '3', name: 'Jessica Day', role: 'Server', hourlyRate: 15, avatar: 'https://picsum.photos/100/100?random=3', maxHoursPerWeek: 35, preferredShifts: ['Evening'], unavailableDays: [], overtimeRule: 'STANDARD' },
  { id: '4', name: 'Nick Miller', role: 'Bartender', hourlyRate: 18, avatar: 'https://picsum.photos/100/100?random=4', maxHoursPerWeek: 40, preferredShifts: ['Evening'], unavailableDays: [2], overtimeRule: 'SUNDAY_DOUBLE' }, // Sun Double Demo
  { id: '5', name: 'Winston B.', role: 'Server', hourlyRate: 15, avatar: 'https://picsum.photos/100/100?random=5', maxHoursPerWeek: 30, preferredShifts: ['Morning'], unavailableDays: [5, 6], overtimeRule: 'STANDARD' }, 
];

export const INITIAL_SHIFTS: Shift[] = [
  { id: 's1', employeeId: '1', dayIndex: 0, startTime: '09', endTime: '17', role: 'Manager' },
  { id: 's2', employeeId: '2', dayIndex: 0, startTime: '16', endTime: '23', role: 'Cook' },
  { id: 's3', employeeId: '3', dayIndex: 0, startTime: '17', endTime: '23', role: 'Server' },
  { id: 's4', employeeId: '1', dayIndex: 1, startTime: '09', endTime: '17', role: 'Manager' },
  { id: 's5', employeeId: '4', dayIndex: 1, startTime: '16', endTime: '00', role: 'Bartender' },
];

export const INITIAL_REQUESTS: AvailabilityRequest[] = [
  { 
    id: 'r1', 
    employeeId: '3', 
    employeeName: 'Jessica Day', 
    type: 'AVAILABILITY_CHANGE', 
    note: 'I started a night class on Tuesdays, so I can no longer work that day.', 
    requestedUnavailableDays: [1], // Tue
    date: '2023-10-25', 
    status: 'PENDING' 
  },
  { 
    id: 'r2', 
    employeeId: '5', 
    employeeName: 'Winston B.', 
    type: 'TIME_OFF', 
    note: 'Need next Friday off for a wedding.', 
    date: '2023-10-26', 
    status: 'PENDING' 
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    userId: '3', // Jessica
    title: 'Schedule Published',
    message: 'The schedule for Oct 30 - Nov 5 is now live.',
    type: 'SHIFT_CHANGE',
    timestamp: '2 hours ago',
    read: false
  },
  {
    id: 'n2',
    userId: '3',
    title: 'Open Shift Available',
    message: 'Server needed for Saturday night. Claim it now!',
    type: 'BROADCAST',
    timestamp: '5 hours ago',
    read: true
  }
];

export const INITIAL_WEEKLY_BUDGET = 3500;

/**
 * Helper to format 24h hour string ("09", "17", "00") to 12h format ("9:00 AM")
 */
export const formatTime = (hourStr: string): string => {
  const h = parseInt(hourStr);
  if (isNaN(h)) return hourStr;
  
  // Handle midnight (00 or 24)
  if (h === 0 || h === 24) return "12:00 AM";
  
  const period = h >= 12 && h < 24 ? 'PM' : 'AM';
  let hour = h % 12;
  if (hour === 0) hour = 12; // 12 PM or 12 AM
  
  return `${hour}:00 ${period}`;
};