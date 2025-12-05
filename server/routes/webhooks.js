import express from 'express';
import { verifyShopifyRequest } from '../utils/shopify.js';

const router = express.Router();

/**
 * Webhook: App uninstalled
 * Shopify sends this when a merchant uninstalls your app
 */
router.post('/app/uninstalled', verifyShopifyRequest, async (req, res) => {
  const { shop_domain } = req.body;

  try {
    console.log(`App uninstalled from shop: ${shop_domain}`);

    // TODO: Delete shop from database
    // await db.shops.delete({ shop: shop_domain });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Uninstall webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Webhook: Shop update
 * Shopify sends this when shop info changes
 */
router.post('/shop/update', verifyShopifyRequest, async (req, res) => {
  const shopData = req.body;

  try {
    console.log('Shop updated:', shopData.domain);

    // TODO: Update shop in database
    // await db.shops.update({ shop: shopData.domain }, { $set: shopData });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Shop update webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Webhook: GDPR - Customer data request
 * Required by Shopify for GDPR compliance
 */
router.post('/gdpr/customers/data_request', verifyShopifyRequest, async (req, res) => {
  const { shop_domain, customer, orders_requested } = req.body;

  try {
    console.log('GDPR data request for shop:', shop_domain);

    // TODO: Gather customer data and send to merchant
    // This is required by GDPR - you must respond within 30 days

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('GDPR data request error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Webhook: GDPR - Customer data erasure
 * Required by Shopify for GDPR compliance
 */
router.post('/gdpr/customers/redact', verifyShopifyRequest, async (req, res) => {
  const { shop_domain, customer } = req.body;

  try {
    console.log('GDPR erasure request for shop:', shop_domain);

    // TODO: Delete all customer data from your database
    // This is required by GDPR

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('GDPR erasure error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Webhook: GDPR - Shop data erasure
 * Required by Shopify for GDPR compliance
 */
router.post('/gdpr/shop/redact', verifyShopifyRequest, async (req, res) => {
  const { shop_domain } = req.body;

  try {
    console.log('GDPR shop erasure for:', shop_domain);

    // TODO: Delete all shop data (48 hours after uninstall)
    // await db.shops.delete({ shop: shop_domain });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('GDPR shop erasure error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
