import { Employee, Shift, AvailabilityRequest } from "./types";

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Sarah Chen', role: 'Manager', hourlyRate: 28, avatar: 'https://picsum.photos/100/100?random=1', maxHoursPerWeek: 45, preferredShifts: ['Morning'], unavailableDays: [6] }, // No Sundays
  { id: '2', name: 'Mike Ross', role: 'Cook', hourlyRate: 22, avatar: 'https://picsum.photos/100/100?random=2', maxHoursPerWeek: 40, preferredShifts: ['Evening'], unavailableDays: [0, 1] }, // No Mon/Tue
  { id: '3', name: 'Jessica Day', role: 'Server', hourlyRate: 15, avatar: 'https://picsum.photos/100/100?random=3', maxHoursPerWeek: 35, preferredShifts: ['Evening'], unavailableDays: [] },
  { id: '4', name: 'Nick Miller', role: 'Bartender', hourlyRate: 18, avatar: 'https://picsum.photos/100/100?random=4', maxHoursPerWeek: 40, preferredShifts: ['Evening'], unavailableDays: [2] }, // No Wed
  { id: '5', name: 'Winston B.', role: 'Server', hourlyRate: 15, avatar: 'https://picsum.photos/100/100?random=5', maxHoursPerWeek: 30, preferredShifts: ['Morning'], unavailableDays: [5, 6] }, // No weekends
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

export const WEEKLY_BUDGET = 3500;