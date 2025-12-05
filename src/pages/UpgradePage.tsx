import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Shield, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createSubscriptionSession, SUBSCRIPTION_TIERS, initializePaymentPointer } from '../lib/payments/x402';

const tiers = [
  {
    ...SUBSCRIPTION_TIERS.pro,
    features: [
      'Up to 30 employees',
      'Unlimited AI compliance checks',
      'All overtime rules (CA, NY, etc.)',
      'Employee portal',
      'Broadcast system',
      'Priority support',
    ],
    popular: true,
  },
  {
    ...SUBSCRIPTION_TIERS.business,
    features: [
      'Up to 100 employees',
      'Everything in Pro, plus:',
      'Multi-location management',
      'Predictive analytics',
      'API access',
      'Phone support',
    ],
    popular: false,
  },
];

export const UpgradePage: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleUpgrade = async (tierId: string) => {
    if (!userProfile?.organizationId) {
      setError('Please create an organization first');
      return;
    }

    setLoading(tierId);
    setError('');

    try {
      const tier = SUBSCRIPTION_TIERS[tierId];
      const { paymentUrl, paymentPointer } = await createSubscriptionSession(
        tier,
        userProfile.organizationId,
        userProfile.uid
      );

      // Initialize Web Monetization
      initializePaymentPointer(paymentPointer);

      // Redirect to payment page
      window.location.href = paymentUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to create payment session');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upgrade Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Unlock advanced features and prevent costly overtime violations
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-lg">
            <Shield className="text-yellow-600" size={20} />
            <p className="text-yellow-800 text-sm font-medium">
              Prevent one $500 violation = 17 months paid for
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Current Tier Badge */}
        {userProfile && (
          <div className="text-center mb-8">
            <p className="text-gray-600">
              Current plan:{' '}
              <span className="font-bold text-indigo-600">
                {userProfile.subscriptionTier.toUpperCase()}
              </span>
            </p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`bg-white rounded-xl p-8 ${
                tier.popular
                  ? 'ring-2 ring-indigo-600 shadow-xl relative'
                  : 'border border-gray-200 shadow-lg'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                    <Zap size={16} />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h2>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">${tier.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(tier.id)}
                disabled={
                  loading === tier.id ||
                  userProfile?.subscriptionTier === tier.id
                }
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  userProfile?.subscriptionTier === tier.id
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : tier.popular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {loading === tier.id
                  ? 'Processing...'
                  : userProfile?.subscriptionTier === tier.id
                  ? 'Current Plan'
                  : `Upgrade to ${tier.name}`}
              </button>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Secure payment powered by</p>
          <div className="flex items-center justify-center gap-6">
            <div className="bg-white px-6 py-3 rounded-lg border border-gray-200 shadow-sm">
              <p className="font-semibold text-gray-900">x402.org</p>
              <p className="text-xs text-gray-500">Web Monetization</p>
            </div>
            <div className="bg-white px-6 py-3 rounded-lg border border-gray-200 shadow-sm">
              <p className="font-semibold text-gray-900">Stripe</p>
              <p className="text-xs text-gray-500">Credit Card</p>
            </div>
          </div>
        </div>

        {/* ROI Highlight */}
        <div className="mt-12 bg-indigo-900 rounded-xl p-8 text-white">
          <div className="flex items-start gap-4">
            <TrendingUp size={32} className="text-indigo-300 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold mb-2">Return on Investment</h3>
              <p className="text-indigo-100 leading-relaxed">
                The average small business loses $3,000/year to unplanned overtime. Pro tier
                pays for itself by preventing just ONE $500 overtime violation. That's a 1,600%
                ROI in your first year.
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
