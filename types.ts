export type OvertimeRule = 'STANDARD' | 'CALIFORNIA' | 'SUNDAY_DOUBLE';

export interface Employee {
  id: string;
  name: string;
  role: 'Server' | 'Cook' | 'Manager' | 'Retail' | 'Host' | 'Bartender';
  hourlyRate: number;
  avatar: string;
  maxHoursPerWeek: number;
  preferredShifts: ('Morning' | 'Evening')[];
  unavailableDays: number[]; // Array of day indices (0=Mon, 6=Sun) where employee cannot work
  overtimeRule?: OvertimeRule;
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
  type: 'AVAILABILITY_CHANGE' | 'TIME_OFF' | 'SHIFT_SWAP';
  note: string;
  requestedUnavailableDays?: number[]; // If approved, these overwrite the employee's unavailableDays
  swapShiftId?: string; // For SHIFT_SWAP
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Notification {
  id: string;
  userId: string; // The employee seeing this
  title: string;
  message: string;
  type: 'SHIFT_CHANGE' | 'BROADCAST' | 'APPROVAL' | 'ALERT';
  timestamp: string;
  read: boolean;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  SCHEDULE = 'SCHEDULE',
  TEAM = 'TEAM',
  AI_INSIGHTS = 'AI_INSIGHTS',
  EMPLOYEE_PORTAL = 'EMPLOYEE_PORTAL'
}