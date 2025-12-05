import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  // Secure CORS - only allow same origin (Vercel deployment)
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://shiftgenius.vercel.app',
    'https://shift-genius.vercel.app'
  ];

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shifts, employees, budget } = req.body;

    // Validation
    if (!shifts || !Array.isArray(shifts)) {
      return res.status(400).json({ error: 'Invalid shifts data' });
    }

    // Prepare prompt for Gemini
    const prompt = `As a labor law compliance expert, analyze this employee schedule for potential violations:

SHIFTS:
${shifts.map(s => `- ${s.day} ${s.time}: ${s.employee || 'Unknown'} (${s.hours || 0}h, ${s.role || 'Staff'})`).join('\n')}

EMPLOYEES:
${employees?.map(e => `- ${e.name}: $${e.hourlyRate}/hr, ${e.overtimeRule}`).join('\n') || 'Not provided'}

BUDGET: $${budget || 'Not specified'}

Analyze for:
1. Overtime violations (Federal: >40hrs/week = 1.5x, California: >8hrs/day = 1.5x)
2. Adequate rest periods between shifts
3. Weekly hour caps per employee
4. Budget adherence
5. Any other labor law concerns

Provide:
- Risk level (LOW/MEDIUM/HIGH)
- Specific violations found
- Recommendations to fix issues
- Cost implications

Format response in markdown.`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const analysis = response.text();

    res.status(200).json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Compliance analysis error:', error);

    // Handle specific API errors
    if (error.message?.includes('API key')) {
      return res.status(500).json({
        error: 'API configuration error',
        message: 'Gemini API key is not configured',
      });
    }

    res.status(500).json({
      error: 'Failed to analyze compliance',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
}
