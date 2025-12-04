import { GoogleGenAI } from "@google/genai";
import { Employee, Shift } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeScheduleCompliance = async (
  employees: Employee[],
  shifts: Shift[],
  budget: number
): Promise<string> => {
  const model = "gemini-2.5-flash";
  
  const scheduleContext = JSON.stringify({
    employees: employees.map(e => ({ name: e.name, rate: e.hourlyRate, maxHours: e.maxHoursPerWeek })),
    shifts: shifts.map(s => ({ 
      employee: employees.find(e => e.id === s.employeeId)?.name,
      day: s.dayIndex,
      duration: parseInt(s.endTime) - parseInt(s.startTime) 
    })),
    budget: budget
  });

  const prompt = `
    You are an expert labor compliance and cost optimization consultant for a small business.
    Analyze the following schedule data JSON:
    ${scheduleContext}

    Please provide a concise analysis covering:
    1. **Compliance Risks**: Identify any employees working overtime (over 40 hours) or nearing burnout based on max hours.
    2. **Cost Analysis**: Compare estimated labor cost against the budget.
    3. **Optimization Suggestion**: One specific actionable tip to reduce cost or improve coverage.

    Format the output in clean Markdown. Use bullet points and bold text for emphasis.
    Keep it friendly but professional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text || "Unable to generate analysis at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to AI Assistant. Please check your internet connection.";
  }
};

export const generateSmartScheduleSuggestion = async (
  employees: Employee[],
  dayIndex: number
): Promise<string> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    I need a staffing suggestion for Day ${dayIndex} (0=Mon, 6=Sun) for a busy restaurant.
    Available Staff: ${JSON.stringify(employees.map(e => ({ name: e.name, role: e.role })))}.
    
    Suggest a balanced 3-person shift lineup (1 Cook, 1 Server, 1 Manager/Host) for the evening rush (5PM - 10PM).
    Return ONLY a JSON array of objects with property "role" and "suggestedName". Do not include markdown formatting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    return response.text || "[]";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "[]";
  }
};