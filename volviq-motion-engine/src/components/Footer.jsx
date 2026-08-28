import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full max-w-container-max mx-auto px-margin-desktop py-24 flex flex-col items-start gap-12 border-t border-outline-variant bg-surface relative z-10">

      {/* Brand Signature */}
      <div className="font-headline-xl text-headline-xl font-bold tracking-tighter text-primary dark:text-primary transition-all duration-300 hover:tracking-widest cursor-pointer select-none">
        VOLVIQ AI
      </div>

      {/* Action Links & Copyright info */}
      <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-8">

        {/* Navigation / Policy links */}
        <div className="flex gap-8 opacity-80 hover:opacity-100 transition-opacity flex-wrap text-left">
          {['Documentation', 'Privacy', 'Protocol', 'Security'].map((link) => (
            <a
              key={link}
              className="text-on-surface-variant dark:text-on-surface-variant font-label-sm text-label-sm hover:text-primary dark:hover:text-primary underline transition-all"
              href="#"
            >
              {link}
            </a>
          ))}
        </div>

        {/* Operating status and copyright */}
        <div className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-2 select-none">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          © 2026 VOLVIQ AI. ALL SYSTEMS OPERATIONAL.
        </div>

      </div>
    </footer>
  );
};

export default Footer;
