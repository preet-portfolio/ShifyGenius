import React from 'react';
import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { Pricing } from '../components/landing/Pricing';
import { Footer } from '../components/landing/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <Footer />
    </div>
  );
};
