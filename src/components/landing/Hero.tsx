import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, DollarSign, Clock, AlertTriangle } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <div className="pt-24 pb-16 bg-gradient-to-br from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <ShieldCheck size={16} />
              AI-Powered Compliance Protection
            </div>

            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Prevent Overtime Violations
              <span className="text-indigo-600"> Before They Happen</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8">
              AI-powered scheduling that analyzes labor laws, prevents costly violations, and
              optimizes labor costs for restaurants and retail stores.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <p className="text-gray-700">
                <span className="font-bold text-yellow-700">One $500 overtime violation</span> =
                17 months of ShiftGenius paid for
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                to="/signup"
                className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-center"
              >
                Start Free Trial
              </Link>
              <a
                href="#how-it-works"
                className="bg-white text-gray-700 border border-gray-300 px-8 py-4 rounded-lg font-semibold hover:border-gray-400 transition-colors text-center"
              >
                See How It Works
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-green-500" />
                <span>Free tier available</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-green-500" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>

          {/* Right Column - Value Props */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Real-Time Violation Alerts</h3>
                  <p className="text-gray-600">
                    AI analyzes your schedule before publishing, catching California daily OT,
                    weekly limits, and complex multi-state rules
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Live Cost Tracking</h3>
                  <p className="text-gray-600">
                    See exactly how much your schedule costs including overtime, with alerts when
                    approaching budget limits
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Clock className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Smart Recommendations</h3>
                  <p className="text-gray-600">
                    Get actionable suggestions: "Move Alice from Tuesday 9hr shift to Wednesday to
                    avoid CA daily OT"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
