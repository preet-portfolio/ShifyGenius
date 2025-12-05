import { db } from '../../src/lib/firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Create a subscription payment session using x402.org
 *
 * For MVP, we'll use a simple payment pointer approach.
 * In production, integrate with x402.org API or Stripe as fallback.
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tier, organizationId, userId } = req.body;

    // Validate input
    if (!tier || !organizationId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // For MVP: Generate a simple session ID
    // In production: Call x402.org API or Stripe API
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Payment pointer for x402.org (replace with your actual payment pointer)
    const paymentPointer = `$ilp.uphold.com/shiftgenius`;

    // Store pending subscription in Firestore
    const subscriptionRef = doc(db, `organizations/${organizationId}/subscription`, 'pending');
    await setDoc(subscriptionRef, {
      sessionId,
      tier: tier.id,
      amount: tier.price,
      currency: tier.currency,
      status: 'pending',
      userId,
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // For x402.org, payment URL would be the Web Monetization enabled page
    const paymentUrl = `${process.env.VITE_API_URL}/upgrade?session=${sessionId}&tier=${tier.id}`;

    return res.status(200).json({
      sessionId,
      paymentUrl,
      paymentPointer,
      tier: tier.id,
      amount: tier.price,
      currency: tier.currency,
    });
  } catch (error) {
    console.error('Create session error:', error);
    return res.status(500).json({
      error: 'Failed to create payment session',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
