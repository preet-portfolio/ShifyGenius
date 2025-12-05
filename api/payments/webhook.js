import { db } from '../../src/lib/firebase/config';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Webhook handler for x402.org payment events
 *
 * This endpoint receives payment confirmation from x402.org
 * and updates the organization's subscription status
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, status, organizationId, tier, amount } = req.body;

    // Verify webhook signature (add this in production)
    // const signature = req.headers['x-x402-signature'];
    // if (!verifySignature(signature, req.body)) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    if (status === 'completed') {
      // Payment successful - activate subscription
      const subscriptionRef = doc(db, `organizations/${organizationId}/subscription`, 'active');

      // Calculate expiration date (1 month from now)
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      await setDoc(subscriptionRef, {
        tier,
        amount,
        status: 'active',
        sessionId,
        activatedAt: serverTimestamp(),
        expiresAt,
      });

      // Update organization tier
      const orgRef = doc(db, 'organizations', organizationId);
      await updateDoc(orgRef, {
        subscriptionTier: tier,
        updatedAt: serverTimestamp(),
      });

      // Also update user profile
      const org = await getDoc(orgRef);
      if (org.exists()) {
        const ownerId = org.data().ownerId;
        const userRef = doc(db, 'users', ownerId);
        await updateDoc(userRef, {
          subscriptionTier: tier,
          updatedAt: serverTimestamp(),
        });
      }

      console.log(`✅ Subscription activated: ${organizationId} -> ${tier}`);
    } else if (status === 'failed') {
      // Payment failed - mark as failed
      const subscriptionRef = doc(db, `organizations/${organizationId}/subscription`, 'pending');
      await updateDoc(subscriptionRef, {
        status: 'failed',
        failedAt: serverTimestamp(),
      });

      console.log(`❌ Subscription failed: ${organizationId}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({
      error: 'Webhook processing failed',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
