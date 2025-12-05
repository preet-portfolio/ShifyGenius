# 🚀 ShiftGenius - AI-Powered Employee Scheduling

**Production App:** https://shiftgenius.vercel.app

AI-powered scheduling platform that prevents overtime violations and optimizes labor costs for restaurants and retail stores.

## ⚡ Key Features

- **AI Compliance Analysis** - Real-time overtime violation detection
- **Cost Optimization** - Live labor cost tracking vs budget
- **Smart Scheduling** - AI-powered shift suggestions
- **Employee Portal** - Self-service time-off requests
- **Broadcast System** - Emergency coverage finder
- **Analytics Dashboard** - Cost trends and insights

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit http://localhost:5173

**Note:** Backend API is deployed as Vercel Serverless Functions - no separate backend server needed!

## 📦 Scripts

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run validate` - Lint + TypeCheck + Tests
- `vercel` - Deploy to production

## 🏗️ Architecture

**Frontend:** React 19 + TypeScript + Vite + Zustand
**Backend:** Vercel Serverless Functions + Google Gemini AI
**Deployment:** Vercel (all-in-one)

Everything deployed together - no separate backend needed!

See [DEVELOPMENT.md](DEVELOPMENT.md) for complete documentation.
See [api/README.md](api/README.md) for serverless functions guide.

## 📊 Status

✅ Tests: 15/15 passing
✅ Production: Live at https://shiftgenius.vercel.app
✅ Coverage: 75%+ target
