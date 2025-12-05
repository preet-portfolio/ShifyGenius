/**
 * x402.org Payment Integration
 * Web Monetization API for subscription payments
 */

export interface PaymentPointer {
  url: string;
  amount: number;
  currency: string;
}

export interface SubscriptionTier {
  id: 'free' | 'pro' | 'business' | 'enterprise';
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'month',
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 29,
    currency: 'USD',
    interval: 'month',
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 79,
    currency: 'USD',
    interval: 'month',
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 0, // Custom pricing
    currency: 'USD',
    interval: 'month',
  },
};

/**
 * Check if Web Monetization API is available
 */
export function isWebMonetizationAvailable(): boolean {
  return typeof document !== 'undefined' && 'monetization' in document;
}

/**
 * Initialize Web Monetization payment pointer
 */
export function initializePaymentPointer(paymentPointer: string): void {
  if (!isWebMonetizationAvailable()) {
    console.warn('Web Monetization API not available');
    return;
  }

  // Add or update meta tag for payment pointer
  let metaTag = document.querySelector('meta[name="monetization"]');

  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute('name', 'monetization');
    document.head.appendChild(metaTag);
  }

  metaTag.setAttribute('content', paymentPointer);
}

/**
 * Create subscription session with x402.org
 */
export async function createSubscriptionSession(
  tier: SubscriptionTier,
  organizationId: string,
  userId: string
): Promise<{ sessionId: string; paymentUrl: string }> {
  const response = await fetch('/api/payments/create-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tier,
      organizationId,
      userId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create payment session');
  }

  return response.json();
}

/**
 * Verify subscription payment status
 */
export async function verifySubscription(
  organizationId: string
): Promise<{
  active: boolean;
  tier: string;
  expiresAt: string;
}> {
  const response = await fetch(`/api/payments/verify-subscription?orgId=${organizationId}`);

  if (!response.ok) {
    throw new Error('Failed to verify subscription');
  }

  return response.json();
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(organizationId: string): Promise<void> {
  const response = await fetch('/api/payments/cancel-subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ organizationId }),
  });

  if (!response.ok) {
    throw new Error('Failed to cancel subscription');
  }
}

/**
 * Listen to monetization events
 */
export function onMonetizationEvent(
  eventType: 'start' | 'progress' | 'stop',
  callback: (event: any) => void
): () => void {
  if (!isWebMonetizationAvailable()) {
    console.warn('Web Monetization API not available');
    return () => {};
  }

  const monetization = (document as any).monetization;
  const eventName = `monetization${eventType}`;

  monetization.addEventListener(eventName, callback);

  // Return cleanup function
  return () => {
    monetization.removeEventListener(eventName, callback);
  };
}

/**
 * Track total amount received
 */
export class MonetizationTracker {
  private totalReceived = 0;
  private listeners: Array<() => void> = [];

  constructor() {
    if (isWebMonetizationAvailable()) {
      this.listeners.push(
        onMonetizationEvent('progress', (event) => {
          this.totalReceived += parseInt(event.detail.amount, 10);
        })
      );
    }
  }

  getTotalReceived(): number {
    return this.totalReceived;
  }

  destroy(): void {
    this.listeners.forEach((cleanup) => cleanup());
    this.listeners = [];
  }
}
