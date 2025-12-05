import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        status: 'error',
        message: 'Gemini API key not configured',
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent('Hello');

    res.status(200).json({
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
}
