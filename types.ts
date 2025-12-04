export interface Employee {
  id: string;
  name: string;
  role: 'Server' | 'Cook' | 'Manager' | 'Retail' | 'Host' | 'Bartender';
  hourlyRate: number;
  avatar: string;
  maxHoursPerWeek: number;
  preferredShifts: ('Morning' | 'Evening')[];
  unavailableDays: number[]; // Array of day indices (0=Mon, 6=Sun) where employee cannot work
}

export interface Shift {
  id: string;
  employeeId: string;
  dayIndex: number; // 0 = Monday, 6 = Sunday
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  role: string;
}

export interface WeeklyStats {
  totalCost: number;
  totalHours: number;
  overtimeHours: number;
  budget: number;
}

export interface AvailabilityRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'AVAILABILITY_CHANGE' | 'TIME_OFF';
  note: string;
  requestedUnavailableDays?: number[]; // If approved, these overwrite the employee's unavailableDays
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  SCHEDULE = 'SCHEDULE',
  TEAM = 'TEAM',
  AI_INSIGHTS = 'AI_INSIGHTS'
}