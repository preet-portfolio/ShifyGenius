import { Employee, Shift, ComplianceAnalysis } from "../types";

// API routes are served from same origin via Vercel Serverless Functions
// No need for separate backend URL - it's all in one deployment!
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const LEGAL_DISCLAIMER = "⚠️ DISCLAIMER: This analysis is for informational purposes only and does not constitute legal advice. Labor laws vary by jurisdiction and change frequently. Always consult with a qualified employment attorney or HR professional for compliance decisions. ShiftGenius is not liable for any violations or penalties resulting from reliance on this analysis.";

export const analyzeScheduleCompliance = async (
  employees: Employee[],
  shifts: Shift[],
  budget: number
): Promise<ComplianceAnalysis> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/compliance/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employees,
        shifts,
        budget
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success && data.analysis) {
      // Parse the markdown analysis from backend
      return {
        violations: [],
        costAnalysis: {
          estimatedTotalCost: 0,
          budgetVariance: 0,
          overtimeCost: 0,
          regularCost: 0
        },
        recommendations: [data.analysis],
        overallRisk: "MEDIUM",
        disclaimer: LEGAL_DISCLAIMER
      };
    }

    throw new Error('Invalid API response');
  } catch (error) {
    console.error("Backend API Error:", error);
    // Return safe fallback structure
    return {
      violations: [{
        type: "BUDGET_OVERRUN",
        severity: "MEDIUM",
        description: "Unable to analyze compliance at this time. Backend service unavailable.",
        suggestedAction: "Ensure backend server is running at " + API_BASE_URL
      }],
      costAnalysis: {
        estimatedTotalCost: 0,
        budgetVariance: 0,
        overtimeCost: 0,
        regularCost: 0
      },
      recommendations: ["Check backend server connection", "Retry analysis"],
      overallRisk: "MEDIUM",
      disclaimer: LEGAL_DISCLAIMER
    };
  }
};

export const generateSmartScheduleSuggestion = async (
  employees: Employee[],
  dayIndex: number
): Promise<string> => {
  // Simple client-side suggestion logic
  // Filter employees by role
  const cooks = employees.filter(e => e.role === 'Cook');
  const servers = employees.filter(e => e.role === 'Server');
  const managers = employees.filter(e => e.role === 'Manager' || e.role === 'Host');

  const suggestions = [];

  if (cooks.length > 0) {
    suggestions.push({ role: 'Cook', suggestedName: cooks[dayIndex % cooks.length].name });
  }

  if (servers.length > 0) {
    suggestions.push({ role: 'Server', suggestedName: servers[dayIndex % servers.length].name });
  }

  if (managers.length > 0) {
    suggestions.push({ role: 'Manager', suggestedName: managers[dayIndex % managers.length].name });
  }

  return JSON.stringify(suggestions);
};