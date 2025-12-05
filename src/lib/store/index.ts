/**
 * Zustand Store - Centralized State Management
 * Uses slices pattern for modularity
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Employee, Shift, AvailabilityRequest, Notification } from '../../types';

// ===== Schedule Slice =====
interface ScheduleSlice {
  shifts: Shift[];
  budget: number;
  addShift: (shift: Shift) => void;
  removeShift: (id: string) => void;
  updateShift: (id: string, updates: Partial<Shift>) => void;
  clearShifts: () => void;
  setBudget: (budget: number) => void;
}

const createScheduleSlice = (set: any): ScheduleSlice => ({
  shifts: [],
  budget: 3000,
  addShift: (shift) =>
    set((state: any) => ({
      shifts: [...state.shifts, shift]
    })),
  removeShift: (id) =>
    set((state: any) => ({
      shifts: state.shifts.filter((s: Shift) => s.id !== id)
    })),
  updateShift: (id, updates) =>
    set((state: any) => ({
      shifts: state.shifts.map((s: Shift) =>
        s.id === id ? { ...s, ...updates } : s
      )
    })),
  clearShifts: () => set({ shifts: [] }),
  setBudget: (budget) => set({ budget })
});

// ===== Team Slice =====
interface TeamSlice {
  employees: Employee[];
  requests: AvailabilityRequest[];
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  removeEmployee: (id: string) => void;
  addRequest: (request: AvailabilityRequest) => void;
  updateRequest: (id: string, updates: Partial<AvailabilityRequest>) => void;
}

const createTeamSlice = (set: any): TeamSlice => ({
  employees: [],
  requests: [],
  addEmployee: (employee) =>
    set((state: any) => ({
      employees: [...state.employees, employee]
    })),
  updateEmployee: (id, updates) =>
    set((state: any) => ({
      employees: state.employees.map((e: Employee) =>
        e.id === id ? { ...e, ...updates } : e
      )
    })),
  removeEmployee: (id) =>
    set((state: any) => ({
      employees: state.employees.filter((e: Employee) => e.id !== id)
    })),
  addRequest: (request) =>
    set((state: any) => ({
      requests: [...state.requests, request]
    })),
  updateRequest: (id, updates) =>
    set((state: any) => ({
      requests: state.requests.map((r: AvailabilityRequest) =>
        r.id === id ? { ...r, ...updates } : r
      )
    }))
});

// ===== UI Slice =====
interface UISlice {
  currentView: string;
  isSidebarOpen: boolean;
  isLoading: boolean;
  notifications: Notification[];
  setCurrentView: (view: string) => void;
  toggleSidebar: () => void;
  setLoading: (loading: boolean) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
}

const createUISlice = (set: any): UISlice => ({
  currentView: 'DASHBOARD',
  isSidebarOpen: true,
  isLoading: false,
  notifications: [],
  setCurrentView: (view) => set({ currentView: view }),
  toggleSidebar: () =>
    set((state: any) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setLoading: (loading) => set({ isLoading: loading }),
  addNotification: (notification) =>
    set((state: any) => ({
      notifications: [...state.notifications, notification]
    })),
  removeNotification: (id) =>
    set((state: any) => ({
      notifications: state.notifications.filter((n: Notification) => n.id !== id)
    })),
  markNotificationAsRead: (id) =>
    set((state: any) => ({
      notifications: state.notifications.map((n: Notification) =>
        n.id === id ? { ...n, read: true } : n
      )
    }))
});

// ===== Combined Store =====
type Store = ScheduleSlice & TeamSlice & UISlice;

export const useStore = create<Store>()(
  devtools(
    persist(
      (set) => ({
        ...createScheduleSlice(set),
        ...createTeamSlice(set),
        ...createUISlice(set)
      }),
      {
        name: 'shiftgenius-storage',
        // Only persist necessary data
        partialize: (state) => ({
          shifts: state.shifts,
          employees: state.employees,
          budget: state.budget,
          requests: state.requests
        })
      }
    ),
    { name: 'ShiftGeniusStore' }
  )
);

// ===== Hooks for easy access =====
export const useSchedule = () => useStore((state) => ({
  shifts: state.shifts,
  budget: state.budget,
  addShift: state.addShift,
  removeShift: state.removeShift,
  updateShift: state.updateShift,
  clearShifts: state.clearShifts,
  setBudget: state.setBudget
}));

export const useTeam = () => useStore((state) => ({
  employees: state.employees,
  requests: state.requests,
  addEmployee: state.addEmployee,
  updateEmployee: state.updateEmployee,
  removeEmployee: state.removeEmployee,
  addRequest: state.addRequest,
  updateRequest: state.updateRequest
}));

export const useUI = () => useStore((state) => ({
  currentView: state.currentView,
  isSidebarOpen: state.isSidebarOpen,
  isLoading: state.isLoading,
  notifications: state.notifications,
  setCurrentView: state.setCurrentView,
  toggleSidebar: state.toggleSidebar,
  setLoading: state.setLoading,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  markNotificationAsRead: state.markNotificationAsRead
}));
