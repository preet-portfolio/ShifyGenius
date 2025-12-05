import React from 'react';
import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for trying out ShiftGenius',
    features: [
      { text: 'Up to 5 employees', included: true },
      { text: '2 weeks of schedule history', included: true },
      { text: '10 AI compliance checks/month', included: true },
      { text: 'Basic overtime rules (40hr/week)', included: true },
      { text: 'Email support', included: true },
      { text: 'Advanced overtime rules', included: false },
      { text: 'Employee portal', included: false },
      { text: 'Unlimited AI checks', included: false },
    ],
    cta: 'Start Free',
    ctaLink: '/signup',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For small businesses serious about compliance',
    features: [
      { text: 'Up to 30 employees', included: true },
      { text: 'Unlimited schedule history', included: true },
      { text: 'Unlimited AI compliance checks', included: true },
      { text: 'All overtime rules (CA, NY, etc.)', included: true },
      { text: 'Employee portal & time-off requests', included: true },
      { text: 'Broadcast system', included: true },
      { text: 'Cost optimization analytics', included: true },
      { text: 'Priority email support (24hr)', included: true },
    ],
    cta: 'Start Free Trial',
    ctaLink: '/signup',
    popular: true,
    badge: 'Most Popular',
  },
  {
    name: 'Business',
    price: '$79',
    period: '/month',
    description: 'Multi-location businesses and franchises',
    features: [
      { text: 'Up to 100 employees', included: true },
      { text: 'Everything in Pro, plus:', included: true },
      { text: 'Multi-location management', included: true },
      { text: 'Team manager permissions', included: true },
      { text: 'Predictive cost forecasting', included: true },
      { text: 'OpenAI-powered optimization', included: true },
      { text: 'API access', included: true },
      { text: 'Phone support', included: true },
    ],
    cta: 'Start Free Trial',
    ctaLink: '/signup',
    popular: false,
  },
];

export const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Prevent one $500 overtime violation and Pro tier pays for itself 17 times over
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl p-8 ${
                tier.popular
                  ? 'ring-2 ring-indigo-600 shadow-xl relative'
                  : 'border border-gray-200 shadow-lg'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    {tier.badge}
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-gray-900">{tier.price}</span>
                  {tier.period && <span className="text-gray-600">{tier.period}</span>}
                </div>
                <p className="text-gray-600">{tier.description}</p>
              </div>

              <Link
                to={tier.ctaLink}
                className={`block w-full py-3 rounded-lg font-semibold text-center mb-6 transition-colors ${
                  tier.popular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {tier.cta}
              </Link>

              <ul className="space-y-3">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X size={20} className="text-gray-300 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Need more than 100 employees or custom features?
          </p>
          <a
            href="mailto:contact@shiftgenius.com"
            className="text-indigo-600 font-semibold hover:text-indigo-700"
          >
            Contact us for Enterprise pricing
          </a>
        </div>
      </div>
    </section>
  );
};
