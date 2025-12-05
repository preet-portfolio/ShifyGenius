import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ShiftGenius</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
              How It Works
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Link
              to="/signin"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
