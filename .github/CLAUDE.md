# ShiftGenius - AI-Powered Employee Scheduling

## Project Context

**What:** AI-powered scheduling app that prevents overtime violations and optimizes labor costs
**Target:** Restaurants & retail stores with 5-30 hourly employees
**Tech Stack:** React 19 + TypeScript + Vite + Gemini AI + Zustand + Vercel
**Business Model:** SaaS at $29/month, targeting $1,450 MRR (50 customers)

## Core Value Proposition

> "Prevent one $500 overtime violation = 17 months of ShiftGenius paid for"

**Unique Features:**
1. AI-powered compliance analysis (no competitor has this)
2. Structured violation detection with severity levels
3. Real-time cost tracking with overtime calculations
4. Legal disclaimers to protect from AI liability

## Architecture Overview

### Frontend Structure
```
src/
├── features/          # Domain-driven feature modules
│   ├── schedule/      # Schedule builder, shift management
│   ├── compliance/    # AI compliance analysis
│   ├── team/          # Employee management
│   ├── dashboard/     # Analytics & stats
│   └── employee-portal/ # Employee self-service
├── shared/            # Reusable UI components & hooks
├── lib/               # Core infrastructure (API, store, monitoring)
└── config/            # Environment & app configuration
```

### Backend Structure
```
server/
├── src/
│   ├── api/routes/    # Express routes (auth, schedule, compliance)
│   ├── services/      # Business logic (Gemini AI, notifications)
│   └── db/            # Database client & migrations
```

## Domain Concepts

### Overtime Rules
- **STANDARD:** 1.5x after 40 hours/week
- **CALIFORNIA:** 1.5x after 8 hours/day AND 40 hours/week (compound)
- **SUNDAY_DOUBLE:** 2x pay for Sunday hours

### Compliance Analysis
AI analyzes schedules and returns:
- `violations[]` - Specific issues with severity (HIGH/MEDIUM/LOW)
- `costAnalysis` - Total cost, overtime cost, budget variance
- `recommendations` - Actionable optimization suggestions
- `disclaimer` - Legal protection text

### Shift Broadcasting
Emergency coverage finder:
1. Manager broadcasts open shift
2. Available employees notified
3. First to claim gets the shift

## Development Workflow

### Starting Development
```bash
npm install
npm run dev          # Start dev server on :3000
npm run build        # Build for production
npm run preview      # Preview production build
```

### Before Committing
1. Run linter: `npm run lint`
2. Check types: `npm run type-check`
3. Run tests: `npm run test`
4. Verify bundle size: `npm run build` (should be < 200KB)

### Creating New Features
1. Create feature folder in `src/features/[feature-name]/`
2. Add components, hooks, services following existing patterns
3. Update types in `[feature]/types/`
4. Add tests in `tests/unit/features/[feature-name]/`
5. Update API endpoints in `src/lib/api/endpoints.ts` if needed

## Tech Stack Decisions

### Why These Choices?
- **Zustand over Redux:** 93% smaller, no boilerplate, TypeScript-first
- **Vitest over Jest:** Faster, Vite-native, better DX
- **Sentry:** Industry standard error tracking, excellent DX
- **PostHog:** Open-source analytics, GDPR-friendly, includes feature flags
- **Vercel:** Zero-config deployment, instant preview URLs
- **Zod:** Type-safe validation, composable, runtime safety

## Common Tasks

### Adding a New Component
```typescript
// Use shadcn/ui patterns from src/shared/components/ui/
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
```

### Adding a New API Endpoint
```typescript
// src/lib/api/endpoints.ts
export const scheduleApi = {
  analyzeCompliance: (data: AnalyzeRequest) =>
    api.post<ComplianceAnalysis>('/api/compliance/analyze', data)
};
```

### Adding Analytics Event
```typescript
import { analytics } from '@/lib/monitoring/analytics';
analytics.track('schedule_published', { shifts: 42, cost: 2847 });
```

### Adding a Feature Flag
```typescript
const isBroadcastV2Enabled = useFeatureFlag('broadcast_v2');
if (isBroadcastV2Enabled) {
  // Show new broadcast UI
}
```

## Code Conventions

### TypeScript
- Strict mode enabled
- Explicit return types for public functions
- Use `interface` for public APIs, `type` for unions/intersections
- Zod schemas for runtime validation

### React
- Functional components with hooks
- Lazy load heavy components with `React.lazy()`
- Memoize expensive calculations with `useMemo`
- Keep components under 300 lines (split if larger)

### Naming
- Components: PascalCase (`ScheduleGrid.tsx`)
- Hooks: camelCase with `use` prefix (`useShifts.ts`)
- Utils: camelCase (`calculateOvertimeCost.ts`)
- Constants: UPPER_SNAKE_CASE (`MAX_SHIFTS_PER_DAY`)

### State Management
- Use Zustand stores for global state
- Use React state for local UI state
- Use SWR/TanStack Query for server state (future)

## Testing Strategy

### What to Test
✅ **Critical:** Overtime calculations, compliance logic, cost calculations
✅ **Important:** API client, data transformations, business logic
⚠️ **Nice-to-have:** UI components (focus on critical paths)

### Test Structure
```typescript
describe('Feature: Overtime Calculation', () => {
  describe('Scenario: California Daily OT', () => {
    it('should apply 1.5x after 8 hours/day', () => {
      // Arrange, Act, Assert
    });
  });
});
```

### Coverage Targets
- Utils & Services: 85%+
- Hooks: 80%+
- Components: 70%+
- Overall: 75%+

## Deployment

### Environments
- **Development:** `npm run dev` (localhost:3000)
- **Preview:** Vercel preview URL (per PR)
- **Production:** https://shiftgenius.vercel.app

### Deployment Process
1. Merge PR to `main`
2. GitHub Actions runs CI checks
3. Auto-deploys to Vercel production
4. Sentry release created
5. Team notified in Slack

### Rollback Plan
- Vercel: 1-click rollback in dashboard
- Database: Versioned migrations (forward + backward)
- Feature Flags: Kill switch for buggy features

## Performance Budgets

- **Initial Bundle:** < 150KB (gzipped)
- **Feature Chunks:** < 50KB each
- **Total:** < 300KB
- **LCP:** < 2.5s
- **FID:** < 100ms
- **CLS:** < 0.1

## Security

### API Keys
- ❌ Never expose in frontend
- ✅ Store in server environment variables
- ✅ Use Vercel environment variables UI

### Data Privacy
- No PII stored (just employee names + schedules)
- HTTPS enforced by Vercel
- Legal disclaimers on all AI outputs

### Input Validation
- All user inputs validated with Zod
- SQL injection prevention (parameterized queries)
- XSS prevention (React escapes by default)

## Monitoring & Observability

### Error Tracking (Sentry)
- Automatic error capture
- Source maps for production debugging
- User context (employee ID, org ID)
- Custom tags (feature, severity)

### Analytics (PostHog)
Key events:
- `schedule_created`
- `compliance_analysis_run`
- `violation_detected` (severity)
- `shift_broadcast_sent`
- `budget_exceeded`

### Performance (Vercel Analytics)
- Web Vitals tracking
- Bundle size monitoring
- API response times

## Troubleshooting

### App won't start
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors
```bash
npm run type-check
# Fix errors shown
```

### Tests failing
```bash
npm run test -- --reporter=verbose
# Check detailed output
```

### Build size too large
```bash
npm run build
# Check dist/assets/ for large chunks
# Consider lazy loading heavy features
```

## Resources

- **Production App:** https://shiftgenius.vercel.app
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Sentry:** https://sentry.io/organizations/shiftgenius
- **PostHog:** https://app.posthog.com
- **Gemini API:** https://aistudio.google.com/apikey

## Team Guidelines

### PR Process
1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes, add tests
3. Run checks: `npm run lint && npm run test`
4. Open PR with description
5. Auto-preview deployed by Vercel
6. Get review approval
7. Squash merge to main

### Code Review Checklist
- [ ] Tests added for new features
- [ ] Types updated
- [ ] Bundle size acceptable
- [ ] No console.logs
- [ ] Error handling added
- [ ] Analytics events added (if user-facing)

### Git Commit Convention
```
feat: Add broadcast v2 UI
fix: Correct CA overtime calculation
docs: Update API documentation
test: Add overtime calculation tests
refactor: Extract schedule utils
perf: Lazy load compliance panel
```

---

**Last Updated:** December 4, 2024
**Maintainer:** Preet
**Status:** Production-Ready ✅
