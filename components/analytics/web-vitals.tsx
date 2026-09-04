'use client';

import { useCallback } from 'react';
import { useReportWebVitals } from 'next/web-vitals';
import type { NextWebVitalsMetric } from 'next/app';

/**
 * WebVitalsReporter — measures real-user Core Web Vitals.
 *
 * Metrics: LCP, INP, CLS, FCP, TTFB.
 *
 * Mount inside RootLayout to confine the 'use client' boundary
 * exclusively to this tiny leaf component (per Next.js docs recommendation).
 *
 * In production: swap console.log with a POST to your analytics endpoint.
 */
export function WebVitalsReporter() {
  // useCallback ensures a stable reference — prevents duplicate metric reports on re-renders
  const handleMetric = useCallback((metric: NextWebVitalsMetric) => {
    if (process.env.NODE_ENV === 'development') {
      const unit = metric.name === 'CLS' ? '' : ' ms';
      console.log(`[Web Vitals] ${metric.name}: ${Math.round(metric.value)}${unit}`);
    }
    // TODO production: send to your analytics endpoint, e.g.:
    // fetch('/api/vitals', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(metric),
    // });
  }, []);

  useReportWebVitals(handleMetric);
  return null;
}
