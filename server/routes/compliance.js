import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * POST /api/compliance/analyze
 * Analyze schedule for labor law compliance
 */
router.post('/analyze', async (req, res) => {
  try {
    const { shifts, employees, budget } = req.body;

    // Validation
    if (!shifts || !Array.isArray(shifts)) {
      return res.status(400).json({ error: 'Invalid shifts data' });
    }

    // Prepare prompt for Gemini
    const prompt = `As a labor law compliance expert, analyze this employee schedule for potential violations:

SHIFTS:
${shifts.map(s => `- ${s.day} ${s.time}: ${s.employee} (${s.hours}h, ${s.role})`).join('\n')}

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

    res.json({
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
});

/**
 * GET /api/compliance/health
 * Check if Gemini AI is configured and working
 */
router.get('/health', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        status: 'error',
        message: 'Gemini API key not configured',
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent('Hello');

    res.json({
      status: 'ok',
      message: 'Gemini AI is configured and operational',
      model: 'gemini-2.0-flash-exp',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Gemini AI service unavailable',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;
