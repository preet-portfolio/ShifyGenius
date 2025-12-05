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

// Structured AI Compliance Response Types
export type ViolationType = 'OVERTIME_RISK' | 'UNDERSTAFFED' | 'BREAK_RULE' | 'BUDGET_OVERRUN' | 'BURNOUT_RISK';
export type ViolationSeverity = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ComplianceViolation {
  type: ViolationType;
  severity: ViolationSeverity;
  affectedEmployee?: string;
  description: string;
  suggestedAction: string;
}

export interface CostAnalysis {
  estimatedTotalCost: number;
  budgetVariance: number; // Positive = over budget, Negative = under budget
  overtimeCost: number;
  regularCost: number;
}

export interface ComplianceAnalysis {
  violations: ComplianceViolation[];
  costAnalysis: CostAnalysis;
  recommendations: string[];
  overallRisk: 'HIGH' | 'MEDIUM' | 'LOW';
  disclaimer: string;
}

export interface Shift {
  id: string;
  employeeId: string;
  dayIndex: number; // 0 = Monday, 6 = Sunday (kept for backward compatibility)
  startTime: string; // "09:00" (kept for backward compatibility)
  endTime: string; // "17:00" (kept for backward compatibility)
  role: string;
  // New fields for production (optional for now to maintain compatibility)
  startDateTime?: string; // ISO8601: "2025-01-06T09:00:00Z"
  endDateTime?: string; // ISO8601: "2025-01-06T17:00:00Z"
  recurrence?: string; // RRULE format (RFC 5545) for repeating shifts
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