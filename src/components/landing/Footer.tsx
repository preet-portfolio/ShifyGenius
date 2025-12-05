import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Github, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white">ShiftGenius</span>
            </div>
            <p className="text-sm text-gray-400">
              AI-powered scheduling that prevents overtime violations and optimizes labor costs.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <Link to="/signup" className="hover:text-white transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/compliance" className="hover:text-white transition-colors">
                  Compliance
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:support@shiftgenius.com"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Mail size={16} />
                  support@shiftgenius.com
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/shiftgenius"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Github size={16} />
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com/shiftgenius"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Twitter size={16} />
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} ShiftGenius. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Made with AI by Claude</span>
              <span>•</span>
              <span>Deployed on Vercel</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
