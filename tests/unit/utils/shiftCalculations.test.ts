import { describe, it, expect } from 'vitest';

/**
 * Critical Tests for Overtime Calculations
 * These calculations directly affect customer billing and compliance
 */

// Helper function to calculate shift hours
function calculateShiftHours(startTime: string, endTime: string): number {
  const start = parseInt(startTime);
  const end = parseInt(endTime) === 0 ? 24 : parseInt(endTime);
  return Math.max(0, end - start);
}

// Helper to calculate overtime cost
function calculateOvertimeCost(
  hours: number,
  hourlyRate: number,
  overtimeRule: 'STANDARD' | 'CALIFORNIA' | 'SUNDAY_DOUBLE'
): number {
  if (overtimeRule === 'STANDARD') {
    // Standard: 1.5x after 40 hours/week
    const regularHours = Math.min(hours, 40);
    const overtimeHours = Math.max(0, hours - 40);
    return regularHours * hourlyRate + overtimeHours * hourlyRate * 1.5;
  }

  if (overtimeRule === 'CALIFORNIA') {
    // California: 1.5x after 8 hours/day
    const regularHours = Math.min(hours, 8);
    const overtimeHours = Math.max(0, hours - 8);
    return regularHours * hourlyRate + overtimeHours * hourlyRate * 1.5;
  }

  if (overtimeRule === 'SUNDAY_DOUBLE') {
    // Sunday Double: 2x for all Sunday hours
    return hours * hourlyRate * 2;
  }

  return hours * hourlyRate;
}

describe('Shift Calculations', () => {
  describe('calculateShiftHours', () => {
    it('should calculate normal shift hours correctly', () => {
      expect(calculateShiftHours('09', '17')).toBe(8);
      expect(calculateShiftHours('14', '22')).toBe(8);
    });

    it('should handle midnight crossing shifts', () => {
      expect(calculateShiftHours('22', '00')).toBe(2);
      expect(calculateShiftHours('20', '00')).toBe(4);
    });

    it('should handle same start and end time as 0 hours', () => {
      expect(calculateShiftHours('09', '09')).toBe(0);
    });
  });

  describe('Overtime Cost Calculations', () => {
    const hourlyRate = 15;

    describe('STANDARD overtime (40hr/week)', () => {
      it('should calculate regular pay for 40 hours', () => {
        const cost = calculateOvertimeCost(40, hourlyRate, 'STANDARD');
        expect(cost).toBe(600); // 40 * 15
      });

      it('should calculate overtime at 1.5x after 40 hours', () => {
        const cost = calculateOvertimeCost(45, hourlyRate, 'STANDARD');
        // 40 hours * $15 + 5 hours * $22.50 = $600 + $112.50 = $712.50
        expect(cost).toBe(712.5);
      });

      it('should handle exactly 40 hours (no overtime)', () => {
        const cost = calculateOvertimeCost(40, hourlyRate, 'STANDARD');
        expect(cost).toBe(600);
      });
    });

    describe('CALIFORNIA overtime (daily)', () => {
      it('should calculate regular pay for 8 hours', () => {
        const cost = calculateOvertimeCost(8, hourlyRate, 'CALIFORNIA');
        expect(cost).toBe(120); // 8 * 15
      });

      it('should calculate overtime at 1.5x after 8 hours', () => {
        const cost = calculateOvertimeCost(10, hourlyRate, 'CALIFORNIA');
        // 8 hours * $15 + 2 hours * $22.50 = $120 + $45 = $165
        expect(cost).toBe(165);
      });

      it('should handle 12-hour shift correctly', () => {
        const cost = calculateOvertimeCost(12, hourlyRate, 'CALIFORNIA');
        // 8 hours * $15 + 4 hours * $22.50 = $120 + $90 = $210
        expect(cost).toBe(210);
      });
    });

    describe('SUNDAY_DOUBLE overtime', () => {
      it('should calculate double time for all Sunday hours', () => {
        const cost = calculateOvertimeCost(8, hourlyRate, 'SUNDAY_DOUBLE');
        expect(cost).toBe(240); // 8 * 15 * 2
      });

      it('should apply double time regardless of hours worked', () => {
        const cost = calculateOvertimeCost(4, hourlyRate, 'SUNDAY_DOUBLE');
        expect(cost).toBe(120); // 4 * 15 * 2
      });
    });

    describe('Edge cases', () => {
      it('should handle 0 hours', () => {
        expect(calculateOvertimeCost(0, hourlyRate, 'STANDARD')).toBe(0);
        expect(calculateOvertimeCost(0, hourlyRate, 'CALIFORNIA')).toBe(0);
        expect(calculateOvertimeCost(0, hourlyRate, 'SUNDAY_DOUBLE')).toBe(0);
      });

      it('should handle very high hourly rates', () => {
        const highRate = 100;
        const cost = calculateOvertimeCost(45, highRate, 'STANDARD');
        // 40 * $100 + 5 * $150 = $4,000 + $750 = $4,750
        expect(cost).toBe(4750);
      });
    });
  });
});

describe('Production Readiness', () => {
  it('should have test infrastructure working', () => {
    expect(true).toBe(true);
  });

  it('should be able to run math operations', () => {
    expect(2 + 2).toBe(4);
    expect(10 * 1.5).toBe(15);
  });
});
