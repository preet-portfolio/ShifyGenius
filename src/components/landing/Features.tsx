import React from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Users,
  Bell,
  BarChart3,
  FileCheck,
  Zap,
  Globe,
} from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: 'AI Compliance Analysis',
    description:
      'Gemini AI reviews every schedule like a compliance lawyer, catching violations before they cost you money',
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    icon: Globe,
    title: 'Multi-State Rules',
    description:
      'Handles California daily OT, New York spread-of-hours, Sunday double-time, and other complex jurisdiction rules',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: TrendingUp,
    title: 'Cost Forecasting',
    description:
      "Real-time budget tracking with predictive alerts: 'You're trending $200 over budget this week'",
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Bell,
    title: 'Emergency Coverage',
    description:
      'One-click broadcast open shifts to available employees, first to claim gets it. No more mass texting.',
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    icon: Users,
    title: 'Employee Portal',
    description:
      'Self-service time-off requests, shift swap marketplace, and schedule notifications for your team',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description:
      'Track cost trends, overtime patterns, and labor efficiency with visual dashboards and insights',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    icon: FileCheck,
    title: 'Compliance Audit Trail',
    description:
      'Every AI analysis saved with timestamp. Show labor auditors you made good-faith compliance efforts',
    color: 'bg-red-100 text-red-600',
  },
  {
    icon: Zap,
    title: 'Smart Optimization',
    description:
      'AI suggests optimal shift distributions based on historical data, sales patterns, and availability',
    color: 'bg-orange-100 text-orange-600',
  },
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Stay Compliant
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Features that competitors don't have - built specifically for restaurants and retail
            stores facing complex labor law requirements
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div className={`p-3 ${feature.color} rounded-lg inline-block mb-4`}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
