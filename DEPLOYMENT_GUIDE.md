# ShiftGenius Deployment Guide

Complete deployment instructions for production deployment.

## Overview

ShiftGenius uses a split architecture:
- **Frontend**: Deployed to Vercel
- **Backend API**: Deployed to Railway (or Render/Heroku)

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Railway account (free tier works)
- Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Part 1: Deploy Backend to Railway

### Option A: Railway CLI (Recommended)

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login**
   ```bash
   railway login
   ```

3. **Navigate to server directory**
   ```bash
   cd server
   ```

4. **Initialize Railway project**
   ```bash
   railway init
   ```
   - Select "Empty Project"
   - Name it "shiftgenius-api"

5. **Link to project**
   ```bash
   railway link
   ```

6. **Set environment variables**
   ```bash
   railway variables set GEMINI_API_KEY="your_gemini_api_key_here"
   railway variables set NODE_ENV="production"
   railway variables set FRONTEND_URL="https://shiftgenius.vercel.app"
   ```

7. **Deploy**
   ```bash
   railway up
   ```

8. **Generate public domain**
   ```bash
   railway domain
   ```

   Save this URL - you'll need it for frontend configuration.
   Example: `shiftgenius-api-production.up.railway.app`

### Option B: Railway Dashboard

1. Go to [railway.app](https://railway.app) and create new project
2. Select "Deploy from GitHub repo"
3. Connect your ShiftGenius repository
4. **Important**: Set root directory to `server`
5. Add environment variables:
   - `GEMINI_API_KEY` = your API key
   - `NODE_ENV` = production
   - `FRONTEND_URL` = https://shiftgenius.vercel.app
6. Deploy and generate domain

### Verify Backend Deployment

Test your Railway deployment:
```bash
curl https://your-app.up.railway.app/health
# Should return: {"status":"ok",...}

curl https://your-app.up.railway.app/api/compliance/health
# Should return: {"status":"ok","message":"Gemini AI is configured and operational"}
```

## Part 2: Deploy Frontend to Vercel

### Option A: Vercel CLI

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm install -g vercel
   ```

2. **From project root, deploy**
   ```bash
   vercel
   ```

3. **Set environment variable**
   ```bash
   vercel env add VITE_API_URL production
   ```
   Enter your Railway backend URL: `https://your-app.up.railway.app`

4. **Deploy to production**
   ```bash
   vercel --prod
   ```

### Option B: Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and import your GitHub repository

2. Configure build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add environment variable**:
   - Go to Settings → Environment Variables
   - Add `VITE_API_URL`
   - Value: `https://your-railway-app.up.railway.app`
   - Select all environments (Production, Preview, Development)

4. Deploy

### Verify Frontend Deployment

Visit `https://shiftgenius.vercel.app` and:
1. Add some shifts to the schedule
2. Click "Analyze Compliance with AI"
3. Check that it successfully connects to backend API
4. Verify no CORS errors in browser console

## Part 3: Connect Frontend and Backend

### Update Railway Environment

If you deployed backend first and used placeholder frontend URL:

```bash
railway variables set FRONTEND_URL="https://your-actual-vercel-url.vercel.app"
```

Then redeploy:
```bash
cd server
railway up
```

### Update Vercel Environment

If Railway URL changed:

1. Vercel Dashboard → Settings → Environment Variables
2. Edit `VITE_API_URL`
3. Update to new Railway URL
4. Redeploy from Vercel Dashboard

## Troubleshooting

### CORS Errors

**Problem**: Browser shows "CORS policy" error

**Solution**:
1. Verify `FRONTEND_URL` in Railway matches your Vercel domain exactly
2. Check Railway logs: `railway logs`
3. Ensure no trailing slash in URLs

### Backend 500 Errors

**Problem**: API returns 500 Internal Server Error

**Solution**:
1. Check Railway logs: `railway logs`
2. Verify `GEMINI_API_KEY` is set correctly
3. Test Gemini API health: `curl https://your-app.up.railway.app/api/compliance/health`

### Frontend Can't Connect to Backend

**Problem**: Frontend shows "Backend service unavailable"

**Solution**:
1. Verify `VITE_API_URL` is set in Vercel
2. Check Railway service is running
3. Test backend health endpoint directly
4. Ensure Railway domain is publicly accessible

### Environment Variables Not Working

**Problem**: Changes to env vars not taking effect

**Solution**:
1. **Railway**: Must redeploy after changing variables
2. **Vercel**: Must redeploy after changing variables
3. Clear browser cache
4. Check correct environment (production vs preview)

## Monitoring

### Railway Monitoring

```bash
# View logs
railway logs

# Check status
railway status

# Monitor deployments
railway open
```

### Vercel Monitoring

1. Dashboard → Your Project → Deployments
2. View real-time logs
3. Check Analytics tab for usage metrics

## Cost Estimates

### Free Tier Limits

**Railway**:
- $5/month free credit
- ~500 hours of uptime per month
- Enough for MVP and testing

**Vercel**:
- 100GB bandwidth/month
- Unlimited deployments
- Commercial use allowed

### Scaling Considerations

When you exceed free tier:
- Railway: ~$5-20/month for small app
- Vercel: ~$20/month Pro plan
- Consider CloudFlare for CDN

## Alternative Deployment Platforms

### Backend Alternatives

**Render** (Similar to Railway):
```bash
# Create new Web Service
# Root Directory: server
# Build Command: npm install
# Start Command: node index.js
```

**Fly.io**:
```bash
cd server
fly launch
fly secrets set GEMINI_API_KEY=your_key
fly deploy
```

**Heroku**:
```bash
heroku create shiftgenius-api
git subtree push --prefix server heroku main
heroku config:set GEMINI_API_KEY=your_key
```

### Frontend Alternatives

**Netlify**:
- Similar to Vercel
- Import from GitHub
- Add build command: `npm run build`

**Cloudflare Pages**:
- Free tier with better bandwidth
- Connect via GitHub
- Framework preset: Vite

## Security Checklist

Before going live:

- [ ] API key is stored server-side only (not in frontend)
- [ ] CORS is configured with specific frontend URL (not `*`)
- [ ] HTTPS is enabled (automatic on Railway/Vercel)
- [ ] Environment variables are not committed to git
- [ ] Rate limiting is considered (future enhancement)
- [ ] Error messages don't leak sensitive information

## Next Steps

After successful deployment:

1. **Set up monitoring**: Consider Sentry for error tracking
2. **Configure custom domain**:
   - Railway: Add custom domain in settings
   - Vercel: Add domain and configure DNS
3. **Enable analytics**: Vercel Analytics, PostHog, etc.
4. **Set up CI/CD**: GitHub Actions for automated testing
5. **Database**: Consider adding PostgreSQL for persistent storage

## Support

For deployment issues:
- Railway: https://railway.app/help
- Vercel: https://vercel.com/support
- Project issues: https://github.com/your-username/shiftgenius/issues
