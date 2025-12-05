# ShiftGenius Backend API

Express.js backend server for ShiftGenius with Google Gemini AI integration.

## Features

- **Compliance Analysis API**: AI-powered schedule compliance checking
- **Gemini AI Integration**: Secure server-side API key handling
- **CORS Configuration**: Flexible for development, restricted for production
- **Health Monitoring**: Built-in health check endpoints
- **Shopify Integration**: OAuth and webhook handlers (disabled by default)

## Local Development

### Prerequisites

- Node.js 18+ (recommended: Node 20)
- npm or yarn
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Setup

1. **Install dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   FRONTEND_URL=http://localhost:5173
   PORT=3001
   NODE_ENV=development
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   Server will run on http://localhost:3001

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload

## API Endpoints

### Health Check
```bash
GET /health
```
Returns server status and timestamp.

### Compliance Analysis
```bash
POST /api/compliance/analyze
Content-Type: application/json

{
  "employees": [...],
  "shifts": [...],
  "budget": 5000
}
```
Analyzes schedule for labor law violations using Gemini AI.

### Gemini Health Check
```bash
GET /api/compliance/health
```
Verifies Gemini AI configuration and connectivity.

## Deployment to Railway

### One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

### Manual Deployment

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize project** (from server directory)
   ```bash
   cd server
   railway init
   ```

4. **Set environment variables**
   ```bash
   railway variables set GEMINI_API_KEY=your_api_key_here
   railway variables set FRONTEND_URL=https://shiftgenius.vercel.app
   railway variables set NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   railway up
   ```

6. **Get deployment URL**
   ```bash
   railway domain
   ```

### Environment Variables (Railway Dashboard)

Required variables:
- `GEMINI_API_KEY` - Google Gemini API key
- `FRONTEND_URL` - Frontend URL for CORS (e.g., https://shiftgenius.vercel.app)
- `NODE_ENV` - Set to `production`

Optional variables:
- `PORT` - Railway sets this automatically
- `SHOPIFY_API_KEY` - Only needed for Shopify integration
- `SHOPIFY_API_SECRET` - Only needed for Shopify integration

## Deployment to Other Platforms

### Render

1. Create new Web Service
2. Connect your GitHub repository
3. Set root directory to `server`
4. Build command: `npm install`
5. Start command: `node index.js`
6. Add environment variables in dashboard

### Heroku

```bash
# From project root
heroku create shiftgenius-api
git subtree push --prefix server heroku main
heroku config:set GEMINI_API_KEY=your_key_here
heroku config:set FRONTEND_URL=https://shiftgenius.vercel.app
```

### Fly.io

```bash
cd server
fly launch
fly secrets set GEMINI_API_KEY=your_key_here
fly secrets set FRONTEND_URL=https://shiftgenius.vercel.app
fly deploy
```

## Connecting Frontend to Backend

After deploying, update your frontend environment variables:

**Vercel Dashboard → Settings → Environment Variables:**
```
VITE_API_URL=https://your-railway-app.up.railway.app
```

Or for local `.env`:
```
VITE_API_URL=http://localhost:3001
```

## Architecture

```
server/
├── index.js              # Main Express app
├── routes/
│   ├── compliance.js     # AI compliance analysis endpoints
│   ├── auth.js          # Shopify OAuth (disabled)
│   └── webhooks.js      # Shopify webhooks (disabled)
├── utils/
│   └── shopify.js       # Shopify API configuration
├── .env.example         # Environment template
├── railway.json         # Railway deployment config
└── package.json         # Dependencies
```

## Security Notes

- API keys are stored server-side only
- CORS is restricted in production
- Rate limiting recommended for production (not yet implemented)
- HTTPS enforced in production

## Troubleshooting

### Port already in use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Gemini API errors
- Verify API key is correct in `.env`
- Check API quota at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Test with `/api/compliance/health` endpoint

### CORS errors
- Ensure `FRONTEND_URL` matches your frontend domain
- In development, CORS allows all origins
- In production, only specified `FRONTEND_URL` is allowed

## License

MIT
