import React, { useRef, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring, useScroll } from 'motion/react';
import BlurText from './animations/BlurText';
import CurvedLoop from './animations/CurvedLoop';
import GlareHover from './animations/GlareHover';
import LazyHyperspeed from './animations/LazyHyperspeed';
import { usePerformanceProfile } from '../hooks/usePerformanceProfile';
import { scrollToTarget } from '../utils/scrollTo';
import { ease, spring, variants } from '../utils/motionConfig';

const BAR_HEIGHTS = [40, 75, 55, 90, 65, 80, 45, 95, 70, 85, 60, 50, 75, 90, 80];
const BAR_DURATIONS = BAR_HEIGHTS.map((_, i) => 1.2 + (i % 5) * 0.15);

/* ─── Variable Pacing: Fast headline ⚡ → Pause → Subtitle → Buttons ─── */
const STAGGER = {
  directive: 0,        // immediate
  headline1: 0.15,     // fast
  headline2: 0.35,     // fast follow
  badge: 0.65,         // pause
  subtitle: 0.95,      // after pause
  buttons: 1.35,       // deliberate delay
  marquee: 1.8,        // final element
};

const Hero = () => {
  const containerRef = useRef(null);
  const rafMoveRef = useRef(null);
  const { lowEffects } = usePerformanceProfile();

  // Mouse parallax for floating panels
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 28, stiffness: 140 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const layer2X = useTransform(smoothX, [-500, 500], [-28, 28]);
  const layer2Y = useTransform(smoothY, [-500, 500], [-28, 28]);
  const layer3X = useTransform(smoothX, [-500, 500], [20, -20]);
  const layer3Y = useTransform(smoothY, [-500, 500], [20, -20]);

  // Scroll-driven camera pull-back — hero shrinks as user scrolls away
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  const heroScale = useSpring(
    useTransform(scrollYProgress, [0, 1], [1, 0.88]),
    { stiffness: 100, damping: 30 }
  );
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroBlur = useTransform(scrollYProgress, [0, 1], [0, 8]);

  const handleMouseMove = useCallback((e) => {
    if (lowEffects) return;
    if (rafMoveRef.current) return;

    rafMoveRef.current = requestAnimationFrame(() => {
      rafMoveRef.current = null;
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left - rect.width / 2);
      mouseY.set(e.clientY - rect.top - rect.height / 2);
    });
  }, [lowEffects, mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const bars = useMemo(
    () =>
      BAR_HEIGHTS.map((h, i) => (
        <motion.div
          key={i}
          className="flex-1 bg-primary/40 transition-colors duration-300 hover:bg-primary"
          initial={{ height: 0 }}
          animate={{ height: `${h}%` }}
          transition={{
            delay: i * 0.04,
            repeat: Infinity,
            repeatType: 'reverse',
            duration: BAR_DURATIONS[i],
            ease: 'easeInOut',
          }}
        />
      )),
    [],
  );

  return (
    <motion.section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden border-b border-outline-variant bg-surface px-margin-mobile pb-16 pt-44 md:px-margin-desktop"
      id="engine"
      style={lowEffects ? undefined : {
        scale: heroScale,
        opacity: heroOpacity,
        filter: useTransform(heroBlur, (v) => `blur(${v}px)`),
      }}
    >
      <div className="scanline" aria-hidden="true" />

      <div className="blueprint-line-v left-1/4 top-0 z-0 opacity-40" aria-hidden="true" />
      <div className="blueprint-line-v right-1/4 top-0 z-0 opacity-40" aria-hidden="true" />
      <div className="blueprint-line-h top-1/3 left-0 z-0 opacity-20" aria-hidden="true" />

      <div className="pointer-events-none absolute inset-0 z-0 mesh-gradient opacity-80" aria-hidden="true" />
      <LazyHyperspeed />

      {/* Floating Panel Left — organic drift with parallax */}
      <motion.div
        style={lowEffects ? undefined : { x: layer2X, y: layer2Y }}
        className="pointer-events-auto absolute left-16 top-48 z-20 hidden w-64 cursor-grab overflow-hidden rounded-[10px] border border-outline-variant bg-surface-container-lowest/80 backdrop-blur-md active:cursor-grabbing lg:block"
        initial={{ opacity: 0, x: -80, scale: 0.9, rotateY: 12 }}
        animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
        transition={{ duration: 1.2, ease: ease.outExpo, delay: 1.0 }}
        whileHover={{ scale: 1.03, borderColor: '#ffffff' }}
      >
        <GlareHover
          width="100%"
          height="100%"
          background="transparent"
          borderRadius="0px"
          borderColor="transparent"
          glareColor="#ffffff"
          glareOpacity={0.2}
          glareAngle={-30}
          glareSize={200}
        >
          <div className="flex h-full w-full flex-col space-y-3 p-4 text-left">
            <div className="flex items-center justify-between border-b border-outline-variant pb-2">
              <span className="font-code-md text-[10px] tracking-widest text-primary">SYS.MATRIX.PROCESS</span>
              <span className="h-2 w-2 rounded-full bg-green-500 cinema-heartbeat" aria-hidden="true" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-on-surface-variant">ENGINE MODE</span>
                <span className="text-primary">AUTO</span>
              </div>
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-on-surface-variant">LATENCY</span>
                <span className="text-primary">0.02ms</span>
              </div>
            </div>
            <div className="relative flex h-8 w-full items-end overflow-hidden border border-outline-variant bg-surface-container/50">
              <div className="absolute inset-0 bg-tech-grid opacity-30" aria-hidden="true" />
              <div className="h-full w-[85%] animate-pulse border-r border-primary bg-gradient-to-r from-transparent to-primary/20" />
            </div>
          </div>
        </GlareHover>
      </motion.div>

      {/* Floating Panel Right — organic drift with parallax */}
      <motion.div
        style={lowEffects ? undefined : { x: layer3X, y: layer3Y }}
        className="pointer-events-auto absolute bottom-52 right-12 z-20 hidden w-72 cursor-grab overflow-hidden rounded-[10px] border border-outline-variant bg-surface-container-lowest/85 backdrop-blur-md active:cursor-grabbing lg:block"
        initial={{ opacity: 0, x: 80, scale: 0.9, rotateY: -12 }}
        animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
        transition={{ duration: 1.2, ease: ease.outExpo, delay: 1.2 }}
        whileHover={{ scale: 1.03, borderColor: '#ffffff' }}
      >
        <GlareHover
          width="100%"
          height="100%"
          background="transparent"
          borderRadius="0px"
          borderColor="transparent"
          glareColor="#ffffff"
          glareOpacity={0.2}
          glareAngle={-30}
          glareSize={200}
        >
          <div className="flex h-full w-full flex-col space-y-4 p-5 text-left">
            <div className="flex items-center justify-between">
              <span className="font-code-md text-[10px] tracking-wider text-on-surface-variant">01 // TELEMETRY</span>
              <span className="font-code-md text-[10px] text-primary">ONLINE</span>
            </div>
            <h4 className="font-label-md text-label-md uppercase tracking-widest text-primary">
              REAL-TIME RENDERING
            </h4>
            <div className="flex h-10 items-end gap-[2px]">{bars}</div>
          </div>
        </GlareHover>
      </motion.div>

      {/* ─── Main Content — Variable Pacing ─── */}
      <div className="relative z-10 mx-auto mt-8 flex w-full max-w-container-max flex-col items-center text-center">

        {/* Directive label — instant */}
        <motion.div
          className="mb-6 flex items-center gap-2 font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: ease.outExpo, delay: STAGGER.directive }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
          01 // DIRECTIVE
        </motion.div>

        {/* BIG HEADLINE — scales from 115% → 100% (camera pull-back feel) */}
        <motion.h1
          className="flex flex-col items-center font-display-massive text-display-massive uppercase leading-none tracking-tighter text-primary"
          initial={{ scale: 1.15, opacity: 0, filter: 'blur(10px)' }}
          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.0, ease: ease.outExpo, delay: STAGGER.headline1 }}
        >
          <BlurText
            text="THE FUTURE"
            delay={100}
            animateBy="words"
            direction="top"
            className="font-display-massive text-display-massive text-primary"
          />
          <BlurText
            text="OF MOTION."
            delay={120}
            animateBy="words"
            direction="bottom"
            className="font-display-massive text-display-massive text-primary"
          />
        </motion.h1>

        {/* Partnership Badge — after pause */}
        <motion.div
          className="mt-6 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...spring.gentle, delay: STAGGER.badge }}
        >
          <a
            href="https://petrutban.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Petrutban Technologies Partner"
            className="transition-opacity duration-300 hover:opacity-80"
            style={{ display: 'inline-block', lineHeight: 0, textDecoration: 'none' }}
          >
            <img
              src="https://i.postimg.cc/FKQtkBBM/edited-photo-(3).webp"
              width="155"
              alt="Petrutban Technologies Partner"
              loading="lazy"
              decoding="async"
              style={{ display: 'block', width: '155px', height: 'auto', border: 0, background: 'transparent' }}
            />
          </a>
        </motion.div>

        {/* small subtitle — deliberate delay after headline settles */}
        <motion.p
          className="mt-10 max-w-2xl text-center font-body-lg text-body-lg leading-relaxed text-on-surface-variant"
          initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, ease: ease.outExpo, delay: STAGGER.subtitle }}
        >
          Autonomous motion architecture for high-end cinematic production. Your AI motion graphics
          studio — from brief to broadcast-ready ads.
        </motion.p>

        {/* Buttons — staggered entrance with scaleX reveal */}
        <motion.div
          className="mt-10 flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: STAGGER.buttons }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: ease.outBack, delay: STAGGER.buttons }}
          >
            <Link
              to="/signup"
              className="group relative overflow-hidden bg-primary px-8 py-4 font-label-md text-label-md uppercase tracking-widest text-surface transition-all duration-500 ease-out-expo inline-block"
            >
              <span className="relative z-10 transition-colors duration-300 group-hover:text-primary">
                Get Started
              </span>
              <span className="absolute inset-0 origin-left scale-x-0 bg-surface transition-transform duration-500 ease-out-expo group-hover:scale-x-100" />
              <span className="absolute inset-0 border border-transparent group-hover:border-primary" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: ease.outBack, delay: STAGGER.buttons + 0.1 }}
          >
            <a
              href="#showcase"
              className="border border-outline-variant px-8 py-4 font-label-md text-label-md uppercase tracking-widest text-primary transition-all duration-500 ease-out-expo hover:border-primary hover:bg-surface-variant/40 inline-block"
              onClick={(e) => {
                e.preventDefault();
                scrollToTarget('#showcase');
              }}
            >
              See It Work
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Curved marquee — last element, long delay */}
      <motion.div
        className="pointer-events-auto relative z-20 mt-8 w-full"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.0, ease: ease.outExpo, delay: STAGGER.marquee }}
      >
        <CurvedLoop
          marqueeText="AI Motion Graphics ✦ Cinematic Ads ✦ AI Voiceovers ✦ Motion Design ✦ Volviq AI ✦"
          speed={4.5}
          curveAmount={80}
          direction="left"
          interactive={!lowEffects}
          className="select-none font-label-md tracking-widest text-white opacity-70 transition-opacity duration-300 hover:opacity-100"
        />
      </motion.div>
    </motion.section>
  );
};

export default Hero;
