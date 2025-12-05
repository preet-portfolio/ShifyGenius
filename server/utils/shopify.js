import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
import { MemorySessionStorage } from '@shopify/shopify-api/runtime';
import '@shopify/shopify-api/adapters/node';

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY || 'placeholder',
  apiSecretKey: process.env.SHOPIFY_API_SECRET || 'placeholder',
  scopes: (process.env.SCOPES || 'read_products').split(','),
  hostName: process.env.HOST?.replace(/https?:\/\//, '') || 'localhost:3001',
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  // Session storage (in-memory for now, use database in production)
  sessionStorage: new MemorySessionStorage(),
});

export default shopify;

/**
 * Verify Shopify request authenticity
 * Use this middleware to verify webhook requests
 */
export function verifyShopifyRequest(req, res, next) {
  try {
    const isValid = shopify.utils.validateHmac({
      hmac: req.headers['x-shopify-hmac-sha256'],
      body: JSON.stringify(req.body),
      secret: process.env.SHOPIFY_API_SECRET,
    });

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid HMAC signature' });
    }

    next();
  } catch (error) {
    console.error('HMAC verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
}
