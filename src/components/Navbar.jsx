import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValueEvent, useScroll, useTransform, useSpring } from 'motion/react';
import GooeyNav from './animations/GooeyNav';

const Navbar = () => {
  const navItems = [
    { label: 'Engine', href: '#engine' },
    { label: 'Capabilities', href: '#capabilities' },
    { label: 'Workflow', href: '#workflow' },
    { label: 'Future', href: '#testimonials' }
  ];

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  const { scrollY } = useScroll();
  const navScale = useSpring(
    useTransform(scrollY, [0, 200], [1, 0.97]),
    { stiffness: 300, damping: 30 }
  );
  const navBlur = useTransform(scrollY, [0, 200], [12, 20]);

  // Scroll direction detection for hide/show
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const diff = latest - lastScrollY.current;
    if (diff > 8 && latest > 300) {
      setHidden(true);
    } else if (diff < -5) {
      setHidden(false);
    }
    setScrolled(latest > 80);
    lastScrollY.current = latest;
  });

  return (
    <motion.nav
      className={`fixed top-0 left-1/2 z-50 flex justify-between items-center w-[calc(100%-48px)] max-w-container-max px-8 py-3 rounded-full border mt-margin-desktop transition-colors duration-500 ${
        scrolled
          ? 'border-outline-variant/60 bg-surface/80'
          : 'border-outline-variant bg-surface/70'
      }`}
      style={{
        x: '-50%',
        scale: navScale,
        backdropFilter: useTransform(navBlur, (v) => `blur(${v}px)`),
      }}
      initial={{ y: -120, opacity: 0 }}
      animate={{
        y: hidden ? -120 : 0,
        opacity: hidden ? 0 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 22,
        mass: 0.9,
      }}
    >
      {/* Brand Signature */}
      <motion.div
        className="font-headline-lg text-headline-lg font-bold tracking-tight text-primary cursor-pointer select-none"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        whileHover={{ letterSpacing: '0.15em' }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        VOLVIQ AI
      </motion.div>

      {/* Gooey Nav link components */}
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

      <div className="flex items-center gap-3">
        <Link
          to="/login"
          className="font-label-md text-label-md text-on-surface-variant transition-colors duration-300 ease-out-expo hover:text-primary"
        >
          Sign in
        </Link>
        <Link
          to="/signup"
          className="relative overflow-hidden group bg-primary text-surface px-6 py-2 rounded-full font-label-md text-label-md"
        >
          <motion.span
            className="relative z-10"
            whileHover={{ color: '#ffffff' }}
            transition={{ duration: 0.3 }}
          >
            Get Started
          </motion.span>
          <span className="absolute inset-0 bg-surface scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-500 ease-out-expo rounded-full" />
          <span className="absolute inset-0 border border-transparent group-hover:border-primary rounded-full transition-colors duration-300" />
        </Link>
      </div>
    </motion.nav>
  );
};

export default Navbar;
