import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
// import authRoutes from './routes/auth.js';
// import webhookRoutes from './routes/webhooks.js';
import complianceRoutes from './routes/compliance.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : true, // Allow all origins in development
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ShiftGenius Backend'
  });
});

// Routes
// Shopify routes temporarily disabled - enable when Shopify integration is needed
// app.use('/auth', authRoutes);
// app.use('/webhooks', webhookRoutes);
app.use('/api/compliance', complianceRoutes);

// API Routes (for your frontend to call)
app.get('/api/shops/:shop', async (req, res) => {
  const { shop } = req.params;
  try {
    // Get shop info from database (you'll need to implement this)
    res.json({ shop, status: 'active' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`ShiftGenius backend running on port ${PORT}`);
  console.log(`OAuth callback URL: ${process.env.HOST}/auth/callback`);
});
