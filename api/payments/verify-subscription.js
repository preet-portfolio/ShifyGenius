import { db } from '../../src/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Verify subscription status for an organization
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orgId } = req.query;

    if (!orgId) {
      return res.status(400).json({ error: 'Missing organization ID' });
    }

    // Get organization subscription from Firestore
    const subscriptionRef = doc(db, `organizations/${orgId}/subscription`, 'active');
    const subscriptionDoc = await getDoc(subscriptionRef);

    if (!subscriptionDoc.exists()) {
      // No active subscription - return free tier
      return res.status(200).json({
        active: false,
        tier: 'free',
        expiresAt: null,
      });
    }

    const subscription = subscriptionDoc.data();

    // Check if subscription is expired
    const expiresAt = subscription.expiresAt?.toDate();
    const isExpired = expiresAt && expiresAt < new Date();

    if (isExpired) {
      return res.status(200).json({
        active: false,
        tier: 'free',
        expiresAt: null,
      });
    }

    return res.status(200).json({
      active: true,
      tier: subscription.tier,
      expiresAt: expiresAt?.toISOString(),
    });
  } catch (error) {
    console.error('Verify subscription error:', error);
    return res.status(500).json({
      error: 'Failed to verify subscription',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
