import React, { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import BlurText from './animations/BlurText';
import Waves from './animations/Waves';
import { useInView } from '../hooks/useInView';
import { usePerformanceProfile } from '../hooks/usePerformanceProfile';
import { ease, spring } from '../utils/motionConfig';

const Lanyard = lazy(() => import('./animations/Lanyard'));

const LanyardFallback = () => (
  <div className="flex h-full min-h-[450px] w-full items-center justify-center font-code-md text-[10px] uppercase tracking-widest text-surface-variant">
    Loading 3D badge…
  </div>
);

/* ─── CTA: Slow, Deliberate Ending 🐌 ─── */
const CTA = () => {
  const { ref, inView } = useInView({ rootMargin: '200px' });
  const { noWebGL } = usePerformanceProfile();

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-b border-outline-variant bg-surface px-margin-mobile py-28 md:px-margin-desktop"
      id="cta"
    >
      <div className="scanline" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-tech-grid opacity-15" aria-hidden="true" />

      <div className="relative z-10 mx-auto grid max-w-container-max grid-cols-1 items-center gap-16 lg:grid-cols-2">

        {/* Left content — glacial pacing, deliberate reveals */}
        <div className="relative max-w-xl space-y-8 text-left">
          <div className="pointer-events-none absolute inset-0 -z-10 min-h-[300px] w-full opacity-40">
            <Waves
              lineColor="rgba(255, 255, 255, 0.1)"
              backgroundColor="transparent"
              waveAmpX={24}
              waveAmpY={12}
              waveSpeedX={0.008}
              waveSpeedY={0.004}
              xGap={18}
              yGap={22}
            />
          </div>

          {/* Section label — slow fade */}
          <motion.div
            className="flex items-center gap-2 font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.0, ease: ease.inOutCubic }}
          >
            <span className="h-2 w-2 rounded-full bg-primary cinema-heartbeat" aria-hidden="true" />
            10 // DISPATCHER
          </motion.div>

          {/* GLACIAL headline — 1.8s, inOutCubic — luxuriously slow */}
          <motion.h2
            className="font-display-massive text-display-massive uppercase leading-none tracking-tighter text-primary"
            initial={{ opacity: 0, y: 40, scale: 1.1, filter: 'blur(12px)' }}
            whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 1.8, ease: ease.inOutCubic }}
          >
            <BlurText
              text="JOIN THE"
              delay={80}
              animateBy="words"
              direction="top"
              className="font-display-massive text-[44px] text-primary sm:text-[56px]"
            />
            <BlurText
              text="MOVEMENT."
              delay={100}
              animateBy="words"
              direction="bottom"
              className="font-display-massive text-[44px] text-primary sm:text-[56px]"
            />
          </motion.h2>

          {/* Subtitle — slow reveal after headline */}
          <motion.p
            className="font-body-md text-body-md leading-relaxed text-on-surface-variant"
            initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: ease.inOutCubic, delay: 0.6 }}
          >
            Scale motion production globally. Request early access and shape the future of AI-native
            advertising.
          </motion.p>

          {/* CTA button — delayed, with gentle pulse after reveal */}
          <motion.div
            className="flex flex-wrap gap-4 pt-4"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.0, ease: ease.outExpo, delay: 1.0 }}
          >
            <Link
              to="/signup"
              className="group relative overflow-hidden border border-primary bg-primary px-8 py-4 font-label-md text-label-md uppercase tracking-widest text-surface cinema-breathe"
            >
              <span className="relative z-10 flex items-center gap-3 transition-colors duration-500 ease-out-expo group-hover:text-primary">
                Get Started
                <span className="material-symbols-outlined text-sm transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5">
                  arrow_forward
                </span>
              </span>
              <div className="absolute inset-0 origin-left scale-x-0 bg-surface transition-transform duration-500 ease-out-expo group-hover:scale-x-100" />
            </Link>
          </motion.div>
        </div>

        {/* Right — 3D Badge with subtle entrance */}
        <motion.div
          className="group relative flex min-h-[480px] w-full items-center justify-center overflow-hidden border border-outline-variant bg-surface-container-low lg:min-h-[520px]"
          initial={{ opacity: 0, scale: 0.9, rotateY: -6 }}
          whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: ease.cameraZoom, delay: 0.3 }}
        >
          <div className="pointer-events-none absolute inset-0 bg-tech-grid opacity-10" aria-hidden="true" />

          {noWebGL ? (
            <div className="px-8 text-center font-code-md text-[11px] uppercase tracking-widest text-surface-variant">
              Interactive 3D preview disabled on this device for smoother scrolling.
            </div>
          ) : inView ? (
            <Suspense fallback={<LanyardFallback />}>
              <div className="flex h-full min-h-[450px] w-full items-center justify-center">
                <Lanyard position={[0, 0, 14]} gravity={[0, -32, 0]} fov={22} transparent />
              </div>
            </Suspense>
          ) : (
            <LanyardFallback />
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
