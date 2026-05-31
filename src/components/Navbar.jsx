import React from 'react';
import { Link } from 'react-router-dom';
import GooeyNav from './animations/GooeyNav';
const Navbar = () => {
  const navItems = [
    { label: 'Engine', href: '#engine' },
    { label: 'Capabilities', href: '#capabilities' },
    { label: 'Workflow', href: '#workflow' },
    { label: 'Future', href: '#testimonials' }
  ];

  return (
    <nav className="fixed top-0 left-1/2 -translate-x-1/2 z-50 flex justify-between items-center w-[calc(100%-48px)] max-w-container-max px-8 py-3 bg-surface/70 dark:bg-surface/70 backdrop-blur-md rounded-full border border-outline-variant mt-margin-desktop transition-all duration-300 hover:border-primary/30">
      {/* Brand Signature */}
      <div 
        className="font-headline-lg text-headline-lg font-bold tracking-tight text-primary dark:text-primary cursor-pointer transition-all duration-300 hover:tracking-widest select-none"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        VOLVIQ AI
      </div>

      {/* Gooey Nav link components for gorgeous reactive bubbles */}
      <div className="hidden md:block">
        <GooeyNav 
          items={navItems} 
          particleCount={12}
          particleDistances={[70, 8]}
          particleR={90}
          colors={[1, 2, 3, 2, 1, 3]}
          initialActiveIndex={0}
        />
      </div>

      {/* Access Button */}
      <Link
        to="/request-access"
        className="relative overflow-hidden group bg-primary text-surface px-6 py-2 rounded-full font-label-md text-label-md transition-all duration-300"
      >
        <span className="relative z-10 transition-colors duration-300 group-hover:text-primary">
          Request Access
        </span>
        <span className="absolute inset-0 bg-surface scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-300 rounded-full" />
        <span className="absolute inset-0 border border-transparent group-hover:border-primary rounded-full" />
      </Link>
    </nav>
  );
};

export default Navbar;
