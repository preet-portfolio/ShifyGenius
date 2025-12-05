# ShiftGenius - Development Guide

**Production App:** https://shiftgenius.vercel.app
**Status:** Production-Ready
**Last Updated:** December 4, 2024

---

## Quick Start

**Frontend:**
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

**Backend API:**
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your Gemini API key to .env
# GEMINI_API_KEY=your_key_here

# Start backend server
npm run dev
```

**Deployment:**
See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete deployment instructions.

---

## Architecture

### Tech Stack
- **Frontend:** React 19 + TypeScript + Vite + Zustand
- **Backend:** Express.js + Node.js
- **AI:** Google Gemini 2.0 Flash (server-side)
- **State Management:** Zustand with persistence
- **Testing:** Vitest + React Testing Library
- **Styling:** TailwindCSS
- **Charts:** Recharts
- **Error Monitoring:** Sentry
- **Deployment:** Vercel (Frontend) + Railway (Backend)

### Project Structure
```
ShiftGenius/
├── src/                      # Frontend source
│   ├── components/           # React components
│   ├── features/            # Feature modules
│   ├── lib/                 # Utilities and stores
│   └── services/            # API clients
├── server/                   # Backend API
│   ├── routes/              # API endpoints
│   │   ├── compliance.js    # AI compliance analysis
│   │   ├── auth.js          # Shopify OAuth
│   │   └── webhooks.js      # Shopify webhooks
│   ├── utils/               # Server utilities
│   ├── index.js             # Express server
│   └── README.md            # Backend docs
├── tests/                    # Test suites
│   └── unit/                # Unit tests
├── .github/                  # CI/CD workflows
│   ├── workflows/ci.yml     # GitHub Actions
│   └── CLAUDE.md            # Project context
├── DEVELOPMENT.md           # This file
├── DEPLOYMENT_GUIDE.md      # Deployment instructions
└── package.json             # Dependencies
├── types.ts           # TypeScript definitions
├── constants.ts       # App constants
├── App.tsx           # Main app component
└── index.tsx         # Entry point

server/                # Backend (for Shopify integration)
├── index.js          # Express server
├── routes/
│   ├── auth.js       # OAuth flow
│   └── webhooks.js   # Shopify webhooks
├── utils/
│   └── shopify.js    # Shopify SDK setup
└── database/
    └── schema.sql    # PostgreSQL schema
```

---

## Environment Variables

### Frontend (.env.local)
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Backend (server/.env)
```env
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_secret
DATABASE_URL=postgresql://...
HOST=https://shiftgenius.vercel.app
SCOPES=read_products,read_orders
```

---

## Key Features

### 1. AI Compliance Analysis (Unique Value Prop)
- Structured JSON responses (not markdown)
- Violation detection with severity levels
- Cost analysis with overtime calculations
- Legal disclaimers on all outputs
- Supports: Standard, California, Sunday Double overtime rules

### 2. Schedule Management
- Drag-and-drop scheduling
- AI auto-fill suggestions
- Template save/load
- CSV export
- Broadcast to employees

### 3. Employee Management
- Overtime rule configuration
- Unavailability tracking
- Time-off request workflow
- Role-based scheduling

### 4. Real-Time Analytics
- Cost tracking with budget variance
- Overtime hour detection
- Daily cost breakdown chart
- Live updates as schedule changes

---

## Production Optimizations

### Performance
- ✅ Code splitting (React.lazy + Suspense)
- ✅ Main bundle: 170KB gzipped
- ✅ Components lazy-loaded on demand
- ✅ Memoized expensive calculations
- ✅ Optimized re-renders

### Security
- ✅ API key in environment variables
- ✅ Legal disclaimers on AI outputs
- ✅ No sensitive data in localStorage
- ✅ HTTPS via Vercel
- ⏳ TODO: API key domain restrictions
- ⏳ TODO: Rate limiting

---

## Deployment

### Vercel (Frontend)
```bash
vercel --prod

# Set environment variable via dashboard:
# GEMINI_API_KEY = your_key
```

### Railway (Backend - when needed)
```bash
cd server
railway login
railway init
railway up

# Set variables
railway variables set SHOPIFY_API_KEY=...
railway variables set SHOPIFY_API_SECRET=...
railway variables set DATABASE_URL=...
```

---

## API Integration

### Gemini AI
```typescript
import { analyzeScheduleCompliance } from './services/geminiService';

const analysis = await analyzeScheduleCompliance(employees, shifts, budget);
// Returns: ComplianceAnalysis with violations[], costAnalysis, recommendations[]
```

### Response Structure
```typescript
interface ComplianceAnalysis {
  violations: ComplianceViolation[];
  costAnalysis: {
    estimatedTotalCost: number;
    budgetVariance: number;
    overtimeCost: number;
    regularCost: number;
  };
  recommendations: string[];
  overallRisk: 'HIGH' | 'MEDIUM' | 'LOW';
  disclaimer: string;
}
```

---

## Business Model

### Pricing
- **Free:** 1-5 employees (freemium to drive adoption)
- **Pro:** $29/month for 6-25 employees (sweet spot)
- **Enterprise:** $79/month for 26+ employees

### Value Proposition
> "Prevent one $500 overtime violation = 17 months of ShiftGenius paid for"

### Target Customers
1. **Primary:** Retail stores using Shopify (5-30 employees)
2. **Secondary:** Restaurants, hospitality businesses
3. **Market Size:** 50K+ potential customers = $17.4M/year TAM

---

## Shopify Integration (Future)

### When to Build
- ✅ Have 10+ paying standalone customers
- ✅ Validated product-market fit
- ✅ Multiple requests for Shopify integration

### Implementation Steps
1. Upgrade Node.js to v20+
2. Create Shopify Partner account
3. Deploy backend to Railway
4. Configure OAuth + webhooks
5. Submit to App Store
6. Wait 5-10 days for approval

### Backend Already Built
- Express server with OAuth flow
- Webhook handlers (app/uninstalled, GDPR endpoints)
- Database schema (8 tables)
- HMAC verification middleware

---

## Development Workflow

### Adding New Features
1. Create new component in `src/components/`
2. Add types to `types.ts`
3. Update App.tsx to integrate
4. Test locally with `npm run dev`
5. Build and check bundle size
6. Deploy with `vercel --prod`

### Code Style
- Use TypeScript for all new code
- Functional components with hooks
- Lazy load heavy components
- Memoize expensive calculations
- Keep components under 300 lines

### Testing Checklist
- [ ] All tabs load without errors
- [ ] AI Compliance analysis works
- [ ] Schedule creation/editing works
- [ ] Employee management works
- [ ] Mobile responsive
- [ ] No console errors

---

## Troubleshooting

### App won't load
- Check browser console (F12)
- Verify Gemini API key is set
- Clear browser cache
- Check Vercel deployment logs

### AI analysis fails
- Verify API key in Vercel dashboard
- Check Google AI Console quotas
- Review error in browser console
- Fallback response should appear

### Build errors
- Run `npm install` to update dependencies
- Delete `node_modules` and reinstall
- Check TypeScript errors: `npm run build`

---

## Performance Monitoring

### Metrics to Track
- **Bundle Size:** Target <200KB gzipped
- **Initial Load:** Target <2 seconds
- **AI Response Time:** Typically 2-4 seconds
- **Cost per Customer:** $0.006/month (Gemini API)

### Optimization Opportunities
- Further code splitting (Recharts is 40KB)
- Image optimization (if added)
- Service worker caching
- Preload critical chunks

---

## Security Checklist

### Before Public Launch
- [ ] API key domain restrictions (Google AI Console)
- [ ] Rate limiting on AI requests
- [ ] Terms of Service page
- [ ] Privacy Policy page
- [ ] E&O insurance ($2-5K/year recommended)
- [ ] Legal review of AI disclaimers

### Data Privacy
- No PII stored (just schedules + employee names)
- localStorage only (no backend database yet)
- HTTPS enforced by Vercel
- No third-party tracking (yet)

---

## Costs & Economics

### Infrastructure Costs
- **Vercel:** $0/month (free tier)
- **Gemini API:** $0.006/customer/month
- **At 100 customers:** ~$1/month total
- **Gross Margin:** 99%+

### Revenue Model
- **MRR Target:** $1,450 (50 customers @ $29/mo)
- **Break-even:** 1 customer
- **Payback Period:** Immediate (no CAC with organic)

---

## Roadmap

### Phase 1: MVP (✅ Complete)
- [x] Core scheduling features
- [x] AI compliance analysis
- [x] Production deployment
- [x] Code optimization

### Phase 2: Growth (Current)
- [ ] Get first 10 paying customers
- [ ] Collect feature requests
- [ ] Add toast notifications
- [ ] Add error boundaries
- [ ] Simple analytics tracking

### Phase 3: Scale (Month 2+)
- [ ] Multi-user database (Supabase)
- [ ] Stripe subscription billing
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics

### Phase 4: Enterprise (Month 3+)
- [ ] Shopify App Store launch
- [ ] Multi-location support
- [ ] Team permissions/roles
- [ ] API for integrations
- [ ] White-label option

---

## Support & Resources

### Documentation
- **This File:** Complete development reference
- **README.md:** Project overview for GitHub

### External Links
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Google AI Studio:** https://aistudio.google.com/apikey
- **Shopify Partners:** https://partners.shopify.com
- **Railway:** https://railway.app

### Getting Help
- Check this guide first
- Review browser console for errors
- Check Vercel deployment logs
- Test API key in Google AI Studio

---

## Contributing

### Code Standards
- TypeScript for type safety
- Functional React components
- ESLint + Prettier (TODO: add)
- Component-level documentation
- Descriptive commit messages

### Git Workflow
```bash
# Feature branch
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "feat: Add new feature"

# Deploy
git push origin feature/new-feature
vercel --prod
```

---

## Legal & Compliance

### AI Disclaimer (Required)
Every AI response includes:
> "⚠️ DISCLAIMER: This analysis is for informational purposes only and does not constitute legal advice..."

### Why This Matters
- Protects against AI hallucination lawsuits
- Sets correct user expectations
- Required for E&O insurance coverage
- Industry best practice

### Liability Protection
- Never claim "legal advice"
- Use hedging language ("potential risk" not "violation")
- Recommend consulting employment attorney
- Maintain comprehensive disclaimers

---

## Success Metrics

### Week 1
- [x] App deployed to production
- [ ] 3 people test the app
- [ ] 1 person says "I'd pay for this"

### Month 1
- [ ] 5 paying customers ($145 MRR)
- [ ] NPS score 8+
- [ ] 0 critical bugs

### Month 3
- [ ] 50 paying customers ($1,450 MRR)
- [ ] Feature requests prioritized
- [ ] Shopify integration decision

---

## Contact & Support

**App:** https://shiftgenius.vercel.app
**Repository:** (Add GitHub URL)
**Issues:** (Add GitHub Issues URL)

---

**Last Updated:** December 4, 2024
**Version:** 1.0.0
**Status:** Production-Ready ✅
