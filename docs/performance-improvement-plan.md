# Next.js "Bricks" App — End-to-End Performance Improvement Plan

> Scope: App Router + Server Actions + TanStack Query + feature-based architecture.
> Goal: fix the three symptoms you called out (fat pages, dashboard live-data via server actions, slow `next/link` navigation) and put guardrails in place so it doesn't regress.

"100%" is a mindset, not a literal number — treat it as "remove every avoidable millisecond," measured against real metrics (LCP, TTFB, INP, TBT, bundle KB) before/after each phase. Section 1 tells you how to measure that.

---

## 0. TL;DR — Priority Order

| # | Fix | Impact | Effort |
|---|-----|--------|--------|
| 1 | Add `loading.tsx` + Suspense streaming to every route | 🔴 High | 🟢 Low |
| 2 | Move dashboard live data from Server Action → Route Handler + TanStack Query | 🔴 High | 🟡 Medium |
| 3 | Split fat pages into feature components + custom hooks | 🔴 High | 🟡 Medium |
| 4 | Audit & kill unnecessary `useEffect`s | 🟠 Medium-High | 🟡 Medium |
| 5 | Bundle analysis + `next/dynamic` for heavy components | 🟠 Medium | 🟢 Low |
| 6 | Fix barrel-file (`index.ts`) re-exports in feature folders | 🟠 Medium | 🟢 Low |
| 7 | TanStack Query cache tuning (`staleTime`, `gcTime`) | 🟠 Medium | 🟢 Low |
| 8 | `next/image` + `next/font` audit | 🟡 Low-Medium | 🟢 Low |
| 9 | Monitoring: Web Vitals + bundle budget in CI | 🟡 Ongoing | 🟢 Low |

Do items 1–3 first — they map directly to your three reported symptoms.

---

## 1. Diagnose Before You Touch Code

Don't refactor blind. Spend half a day measuring so you know what "fixed" looks like.

**Tools:**
- `React DevTools Profiler` (Components tab → Profiler) — record a click/navigation, find components re-rendering that shouldn't.
- Chrome DevTools → Performance tab — record page load, look at Long Tasks and hydration time.
- Chrome DevTools → Lighthouse — run on the dashboard page and one heavy feature page.
- `@next/bundle-analyzer` — see exactly what's in each route's JS bundle.

```bash
npm install -D @next/bundle-analyzer
```

```js
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
module.exports = withBundleAnalyzer({ /* ...your config */ });
```

```bash
ANALYZE=true npm run build
```

- `next build` output itself — check the "First Load JS" column per route. Anything over ~150–200KB per route is worth investigating.
- Add `reportWebVitals` (see Section 10) so you have LCP/INP/TTFB numbers, not vibes.

**Write down 3 baseline numbers before starting:** dashboard First Load JS, dashboard LCP, and time-to-next-page on a button click. Compare against these after each phase.

---

## 2. Symptom → Likely Root Cause Map

| Symptom | Likely Root Cause |
|---|---|
| Page slow to load, has many handlers/hooks/useEffects | Business logic + state living directly in `page.tsx` instead of being decomposed into feature components/hooks; too many `useEffect`s doing derived-state work that doesn't need an effect at all |
| Dashboard "live" data via Server Action | Server Actions are just POST endpoints under the hood — they're built for **mutations**, not for repeated/polled reads. Calling one repeatedly (or on every interaction) triggers full round-trips with no client cache, no dedupe, no background refetch |
| `next/link` navigation feels slow | Almost never the `<Link>` itself (it prefetches by default). Usually: the destination route has no `loading.tsx`/Suspense boundary, so Next.js blocks the transition on a slow RSC data fetch; or the destination's client bundle is huge; or there's a sequential (waterfall) data-fetch chain in the layout/page |

---

## 3. Fix #1 — Split Fat Pages (Feature-Based Refactor)

**Rule of thumb:** `page.tsx` should be almost pure composition. If you're scrolling past 15+ `useState`/`useEffect` calls in one file, the page is doing too much.

### 3.1 Target folder shape (per feature)

```
features/
  dashboard/
    components/
      DashboardHeader.tsx
      LiveStatsGrid.tsx
      RecentActivityList.tsx
    hooks/
      useDashboardStats.ts     // TanStack Query hook
      useDashboardFilters.ts   // local UI state only
    api/
      dashboard.api.ts         // fetch functions, called by hooks
    types/
      dashboard.types.ts
    index.ts                   // export ONLY what other features/pages need
```

```
app/
  dashboard/
    page.tsx        // composition only
    loading.tsx      // instant skeleton
```

### 3.2 Pull logic out of the page

**Before (typical fat page):**
```tsx
// app/dashboard/page.tsx
'use client';
export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // ...10 more useState
  useEffect(() => { /* fetch stats */ }, []);
  useEffect(() => { /* refilter */ }, [filters]);
  useEffect(() => { /* sync something */ }, [stats]);
  // 5 more effects, 8 handlers...
  return ( /* 300 lines of JSX */ );
}
```

**After:**
```tsx
// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <>
      <DashboardHeader />
      <Suspense fallback={<StatsGridSkeleton />}>
        <LiveStatsGrid />
      </Suspense>
      <Suspense fallback={<ActivitySkeleton />}>
        <RecentActivityList />
      </Suspense>
    </>
  );
}
```

```tsx
// features/dashboard/components/LiveStatsGrid.tsx
'use client';
import { useDashboardStats } from '../hooks/useDashboardStats';

export function LiveStatsGrid() {
  const { data, isLoading } = useDashboardStats();
  if (isLoading) return <StatsGridSkeleton />;
  return <StatsGrid stats={data} />;
}
```

Each feature component owns **only its own** state/effects. Nothing bleeds across the page.

### 3.3 Kill unnecessary `useEffect`s

Most `useEffect`s in fat pages fall into patterns that don't need an effect at all:

- **Deriving state from props/state** → just compute it inline or with `useMemo`, don't `setState` in an effect.
  ```tsx
  // ❌ before
  useEffect(() => { setTotal(items.reduce((a,b)=>a+b.price,0)); }, [items]);
  // ✅ after
  const total = useMemo(() => items.reduce((a,b)=>a+b.price,0), [items]);
  ```
- **Resetting state on prop change** → use a `key` prop on the child component instead of an effect.
- **Event-driven logic living in an effect** (e.g. "when button clicked, do X") → put it directly in the handler, not behind a state flag watched by `useEffect`.
- **Data fetching in `useEffect`** → replace with TanStack Query (Section 4). This alone usually removes 3–5 effects per page (loading state, error state, abort-controller cleanup, refetch-on-deps-change — React Query gives you all of this for free).

### 3.4 Consolidate related `useState`s

If you have 6+ `useState`s that change together, that's a sign to use `useReducer` (or a small state machine) instead — fewer re-renders, one source of truth, easier to reason about.

### 3.5 Memoization — use it deliberately, not everywhere

- `useCallback`/`useMemo` are worth it when the value/function is passed to a **memoized child** (`React.memo`) or used in a dependency array elsewhere.
- Wrapping every handler in `useCallback` "just in case" adds overhead without benefit if nothing downstream is memoized. Audit, don't blanket-apply.
- `React.memo` heavy list-item components (table rows, cards) that re-render on unrelated parent state changes.

---

## 4. Fix #2 — Dashboard Live Data: Server Action → Route Handler + TanStack Query

### 4.1 Why the current approach is slow

Server Actions are designed for **mutations** (form submits, writes) — each call is a fresh POST with no HTTP caching semantics and no client-side dedupe/cache. Using one to *repeatedly read* live stats means every poll is a full round trip with no `staleTime`, no background refetch, no request de-duplication across components that need the same data.

### 4.2 New architecture

1. **Route Handler** exposes the data as a normal JSON GET endpoint (cacheable, pollable, dedupe-able):
```ts
// app/api/dashboard/stats/route.ts
import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/features/dashboard/api/dashboard.service';

export async function GET() {
  const stats = await getDashboardStats();
  return NextResponse.json(stats);
}
```

2. **TanStack Query hook** on the client owns caching/polling:
```ts
// features/dashboard/hooks/useDashboardStats.ts
import { useQuery } from '@tanstack/react-query';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats');
      if (!res.ok) throw new Error('Failed to load stats');
      return res.json();
    },
    staleTime: 30_000,        // don't refetch if data is <30s old
    gcTime: 5 * 60_000,       // keep cached data 5 min after unmount
    refetchInterval: 30_000,  // poll every 30s for "live" feel
    refetchOnWindowFocus: true,
  });
}
```

3. **Keep Server Actions for mutations only** (create/update/delete) — that's what they're built for. Don't use them for reads that need caching/polling.

### 4.3 Avoid the double-fetch: hydrate initial data from the server

To keep a fast first paint (no client-side loading spinner on first visit) *while still* getting TanStack Query's caching for subsequent interactions, prefetch on the server and hydrate:

```tsx
// app/dashboard/page.tsx
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getDashboardStats } from '@/features/dashboard/api/dashboard.service';
import { LiveStatsGrid } from '@/features/dashboard/components/LiveStatsGrid';

export default async function DashboardPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats, // same function, called directly server-side
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LiveStatsGrid /> {/* client component, useQuery finds cache already warm */}
    </HydrationBoundary>
  );
}
```

Result: first load is server-rendered and instant (no spinner), and every refresh/poll after that goes through React Query's cache — best of both worlds.

### 4.4 If "live" needs to be truly real-time

If 30s polling isn't enough (e.g. you need sub-second updates), swap polling for **Server-Sent Events (SSE)** or a WebSocket, and feed updates into the query cache via `queryClient.setQueryData(...)` instead of polling. Only do this if genuinely needed — polling with a sane interval is usually enough for dashboards and much simpler to maintain.

---

## 5. Fix #3 — Slow Navigation on `next/link` Clicks

It's very rarely `<Link>` itself. Work through this checklist:

1. **Add `loading.tsx` to every route segment.** Without it, Next.js blocks the visual transition until the destination's data fetching fully resolves. With it, navigation feels instant and the skeleton streams in immediately.
   ```tsx
   // app/some-feature/loading.tsx
   export default function Loading() {
     return <FeatureSkeleton />;
   }
   ```

2. **Wrap slow-fetching sub-sections in `<Suspense>`** inside the page itself, so the fast parts render immediately and only the slow widget shows its own fallback (streaming SSR):
   ```tsx
   <Suspense fallback={<ChartSkeleton />}>
     <RevenueChart /> {/* async server component with its own fetch */}
   </Suspense>
   ```

3. **Check for fetch waterfalls** in layouts/pages — sequential `await`s that could run in parallel:
   ```ts
   // ❌ waterfall
   const user = await getUser();
   const stats = await getStats(user.id);
   // ✅ parallel where possible
   const [user, stats] = await Promise.all([getUser(), getStats()]);
   ```

4. **Check `middleware.ts` scope.** If your middleware `matcher` runs on every route (including ones it doesn't need to), it adds latency to every navigation. Scope it tightly.

5. **Check destination bundle size** via the bundle analyzer (Section 1). A heavy client component (rich text editor, chart library, big form) loaded eagerly on a page will delay hydration and make the click-to-interactive feel slow even if the navigation itself was fast. Fix with `next/dynamic`:
   ```tsx
   import dynamic from 'next/dynamic';
   const HeavyChart = dynamic(() => import('@/features/dashboard/components/HeavyChart'), {
     loading: () => <ChartSkeleton />,
     ssr: false, // if it's client-only anyway (e.g. uses window)
   });
   ```

6. **Confirm prefetching isn't accidentally disabled.** `<Link prefetch={false}>` anywhere on high-traffic nav links will make that specific link slow — search your codebase for `prefetch={false}` and make sure it's intentional.

---

## 6. Fix #4 — Bundle Size & Code Splitting

- Run the bundle analyzer (Section 1) and look for: large chart/editor/date libraries loaded on every route instead of just where needed, duplicate library versions, and unexpectedly large "shared" chunks.
- `next/dynamic` any component that's not needed for first paint: modals, drawers, charts, rich editors, anything behind a tab/accordion.
- Watch for **barrel file bloat** — very common in feature-based architectures:
  ```ts
  // features/dashboard/index.ts
  export * from './components';   // ❌ re-exports everything, kills tree-shaking
  ```
  Prefer explicit named exports of only what's actually consumed outside the feature, or import directly from the specific file (`@/features/dashboard/components/LiveStatsGrid`) in consuming code rather than through the barrel.
- Swap heavy libraries where cheap alternatives exist: `moment` → `dayjs`/`date-fns`, full `lodash` import → `lodash-es` with per-function imports or native JS.

---

## 7. Fix #5 — Caching Strategy Cheat Sheet

| Data type | Where it lives | How to cache |
|---|---|---|
| Mostly-static content (settings, catalogs) | Server Component | `fetch(url, { next: { revalidate: 3600 } })` or `unstable_cache` |
| Data that changes on user action elsewhere | Server Component | `revalidateTag()` / `revalidatePath()` after the mutating Server Action |
| Live/polled dashboard data | Client Component | TanStack Query (`staleTime`, `refetchInterval` — Section 4) |
| One-off mutations (create/update/delete) | Server Action | No caching needed; call `revalidateTag` after success so RSC data updates |

Tune TanStack Query defaults globally instead of repeating them per hook:
```ts
// lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false, // opt-in per query where it actually matters
      retry: 1,
    },
  },
});
```

---

## 8. Fix #6 — Images & Fonts

- Replace any raw `<img>` with `next/image` (automatic sizing, lazy-loading, modern formats).
- Use `next/font` (`next/font/google` or local) instead of a `<link>` tag to Google Fonts — avoids render-blocking font requests and layout shift.

---

## 9. Feature-Based Architecture — Rules Going Forward

To stop this problem from recurring:

1. `page.tsx` = composition + `<Suspense>` boundaries only. No business logic, no more than 1–2 `useState`s.
2. Every feature owns its `hooks/` folder — one hook per concern (`useDashboardStats`, `useDashboardFilters`), not one giant hook doing everything.
3. Data fetching hooks always go through TanStack Query, never raw `useEffect` + `fetch`.
4. Server Actions are for mutations only; reads that need caching/polling go through Route Handlers + TanStack Query.
5. No barrel-file `export *`; export explicitly.
6. Any component using a heavy third-party library gets `next/dynamic`'d by default unless it's needed for first paint.
7. Every route segment gets a `loading.tsx`.

---

## 10. Monitoring & Guardrails (so it doesn't regress)

- Add Web Vitals reporting:
  ```ts
  // app/layout.tsx or a client component
  export function reportWebVitals(metric) {
    console.log(metric); // send to your analytics/monitoring endpoint instead
  }
  ```
- If deployed on Vercel, enable Vercel Analytics / Speed Insights for real-user LCP/INP data.
- Add a bundle-size budget check in CI (fail the build if a route's First Load JS grows past an agreed threshold) using `@next/bundle-analyzer` output or a tool like `size-limit`.
- Optionally add Lighthouse CI on PRs for the dashboard and one heavy feature route.

---

## 11. Suggested Rollout Order (2–3 week pace, adjust to your team size)

1. **Day 1:** Baseline measurements (Section 1). Add `loading.tsx` to all routes — quick win, immediate perceived-speed improvement.
2. **Days 2–4:** Dashboard: move live data from Server Action → Route Handler + TanStack Query (Section 4), including server-prefetch hydration.
3. **Days 5–9:** Refactor the 2–3 fattest pages: extract feature components/hooks, remove unnecessary `useEffect`s (Section 3).
4. **Days 10–11:** Bundle analysis pass — `next/dynamic` heavy components, fix barrel-file exports (Section 6).
5. **Days 12–13:** Navigation audit per Section 5 checklist on your slowest nav paths.
6. **Day 14:** Images/fonts pass (Section 8).
7. **Ongoing:** Wire up Web Vitals + bundle budget in CI (Section 10) so regressions get caught in review, not production.

Re-measure your 3 baseline numbers after each phase and note the delta — that's your real "% improvement" evidence.

---

## 12. Checklist

- [ ] Baseline metrics captured (Lighthouse, bundle analyzer, Web Vitals)
- [ ] `loading.tsx` added to every route segment
- [ ] Dashboard live data moved to Route Handler + TanStack Query
- [ ] Server prefetch + `HydrationBoundary` wired for dashboard initial load
- [ ] Server Actions confined to mutations only
- [ ] Fattest 2–3 pages decomposed into feature components + hooks
- [ ] Unnecessary `useEffect`s removed/replaced with derived state or React Query
- [ ] `useReducer` applied where 6+ related `useState`s existed
- [ ] `useCallback`/`useMemo`/`React.memo` audited (not blanket-applied)
- [ ] Bundle analyzer run; heavy components moved to `next/dynamic`
- [ ] Barrel-file (`index.ts`) re-exports fixed
- [ ] Fetch waterfalls in layouts/pages parallelized
- [ ] `middleware.ts` matcher scoped tightly
- [ ] `next/image` and `next/font` used everywhere applicable
- [ ] Web Vitals reporting wired up
- [ ] Bundle-size budget check added to CI
