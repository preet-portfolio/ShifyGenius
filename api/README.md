# Vercel Serverless Functions

This directory contains Vercel Serverless Functions that provide backend API functionality.

## Structure

```
api/
└── compliance/
    ├── analyze.js   # POST /api/compliance/analyze - AI compliance analysis
    └── health.js    # GET /api/compliance/health - Health check
```

## How It Works

Vercel automatically deploys files in the `/api` directory as serverless functions:
- Each `.js` file becomes an API endpoint
- Functions run on-demand (serverless)
- No separate backend server needed
- Deployed with your frontend in a single deployment

## Environment Variables

Required in Vercel Dashboard → Settings → Environment Variables:

- `GEMINI_API_KEY` - Your Google Gemini API key

## Local Development

These functions work automatically with `vercel dev`:

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally (both frontend + API)
vercel dev
```

Or use the standalone Express server in `/server` for development:

```bash
cd server
npm run dev
```

## Endpoints

### POST /api/compliance/analyze

Analyzes employee schedule for labor law violations.

**Request:**
```json
{
  "employees": [...],
  "shifts": [...],
  "budget": 5000
}
```

**Response:**
```json
{
  "success": true,
  "analysis": "markdown formatted analysis",
  "timestamp": "2024-12-05T..."
}
```

### GET /api/compliance/health

Health check for Gemini AI integration.

**Response:**
```json
{
  "status": "ok",
  "message": "Gemini AI is configured and operational",
  "model": "gemini-2.0-flash-exp"
}
```

## Benefits of Vercel Serverless Functions

1. **Simpler Deployment** - One command deploys everything
2. **No Backend Management** - No servers to maintain
3. **Auto-Scaling** - Scales automatically with traffic
4. **Free Tier** - Generous free limits (100K requests/month)
5. **Same Origin** - No CORS configuration needed
6. **Built-in CDN** - Global edge network
7. **Environment Variables** - Secure secret management

## Cost

Free Hobby Plan includes:
- 100GB bandwidth
- 100K serverless function invocations/month
- 100 GB-hours compute time

More than enough for small to medium apps!

## Migration Note

These serverless functions replace the Express.js backend in `/server`. The standalone server is still available for local development or if you prefer traditional server deployment to Railway/Render.
