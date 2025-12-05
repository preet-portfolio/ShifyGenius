/**
 * Sentry Error Monitoring Setup
 * Captures errors, tracks releases, monitors performance
 */

import * as Sentry from '@sentry/react';

export function initSentry() {
  // Only initialize in production or if explicitly enabled
  const isProduction = import.meta.env.PROD;
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

  if (!sentryDsn) {
    console.log('⚠️ Sentry DSN not configured, skipping initialization');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: isProduction ? 'production' : 'development',

    // Performance Monitoring
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true
      })
    ],

    // Sample rate for performance monitoring
    tracesSampleRate: isProduction ? 0.1 : 1.0,

    // Session Replay
    replaysSessionSampleRate: isProduction ? 0.1 : 0,
    replaysOnErrorSampleRate: 1.0,

    // Release tracking
    release: import.meta.env.VITE_APP_VERSION || 'development',

    // Before send hook - filter sensitive data
    beforeSend(event, hint) {
      // Don't send errors in development (unless explicitly testing)
      if (!isProduction && !import.meta.env.VITE_SENTRY_ENABLED) {
        console.log('🐛 Sentry Event (dev):', event);
        return null;
      }

      // Filter out sensitive data
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }

      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',

      // Network errors (handled by app)
      'NetworkError',
      'Failed to fetch',

      // ResizeObserver errors (benign)
      'ResizeObserver loop limit exceeded'
    ]
  });

  console.log('✅ Sentry initialized');
}

// Helper to manually capture errors
export function captureError(error: Error, context?: Record<string, any>) {
  if (context) {
    Sentry.setContext('custom', context);
  }
  Sentry.captureException(error);
}

// Helper to add breadcrumbs
export function addBreadcrumb(message: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    level: 'info',
    data
  });
}

// Helper to set user context
export function setUser(user: { id: string; email?: string; name?: string }) {
  Sentry.setUser(user);
}

// Helper to clear user context (on logout)
export function clearUser() {
  Sentry.setUser(null);
}
