import express from 'express';
import shopify from '../utils/shopify.js';

const router = express.Router();

/**
 * Step 1: Begin OAuth flow
 * Shopify redirects merchant to this URL when they install your app
 *
 * Example: /auth?shop=example.myshopify.com
 */
router.get('/', async (req, res) => {
  const { shop } = req.query;

  if (!shop) {
    return res.status(400).json({ error: 'Missing shop parameter' });
  }

  try {
    // Begin OAuth process
    const authRoute = await shopify.auth.begin({
      shop: shopify.utils.sanitizeShop(shop, true),
      callbackPath: '/auth/callback',
      isOnline: false, // Offline access tokens don't expire
    });

    res.redirect(authRoute);
  } catch (error) {
    console.error('OAuth begin error:', error);
    res.status(500).json({ error: 'Failed to begin authentication' });
  }
});

/**
 * Step 2: OAuth callback
 * Shopify redirects back here after merchant approves permissions
 *
 * Example: /auth/callback?code=abc123&shop=example.myshopify.com&state=xyz789
 */
router.get('/callback', async (req, res) => {
  try {
    // Complete OAuth and get access token
    const callback = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    const { session } = callback;

    // Store session in database (implement this based on your needs)
    // For now, just log it
    console.log('Shop authenticated:', session.shop);
    console.log('Access token:', session.accessToken);

    // TODO: Store session in database
    // await db.shops.upsert({
    //   shop: session.shop,
    //   accessToken: session.accessToken,
    //   scope: session.scope,
    // });

    // Redirect to your app with success
    const redirectUrl = `${process.env.HOST}?shop=${session.shop}&authenticated=true`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

/**
 * Check if shop is authenticated
 */
router.get('/status/:shop', async (req, res) => {
  const { shop } = req.params;

  try {
    // TODO: Check if shop exists in database
    // const shopData = await db.shops.findOne({ shop });

    res.json({
      shop,
      authenticated: false, // Change to true if found in database
      message: 'Shop authentication status'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
