import React, { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import BlurText from './animations/BlurText';
import Waves from './animations/Waves';
import { useInView } from '../hooks/useInView';
import { usePerformanceProfile } from '../hooks/usePerformanceProfile';

const Lanyard = lazy(() => import('./animations/Lanyard'));

const LanyardFallback = () => (
  <div className="flex h-full min-h-[450px] w-full items-center justify-center font-code-md text-[10px] uppercase tracking-widest text-surface-variant">
    Loading 3D badge…
  </div>
);

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

          <div className="flex items-center gap-2 font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
            <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
            10 // DISPATCHER
          </div>

          <h2 className="font-display-massive text-display-massive uppercase leading-none tracking-tighter text-primary">
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
          </h2>

          <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
            Scale motion production globally. Request early access and shape the future of AI-native
            advertising.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              to="/request-access"
              className="group relative overflow-hidden border border-primary bg-primary px-8 py-4 font-label-md text-label-md uppercase tracking-widest text-surface"
            >
              <span className="relative z-10 flex items-center gap-3 transition-colors duration-300 group-hover:text-primary">
                Request Access
                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </span>
              <div className="absolute inset-0 origin-left scale-x-0 bg-surface transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          </div>
        </div>

        <div className="group relative flex min-h-[480px] w-full items-center justify-center overflow-hidden border border-outline-variant bg-surface-container-low lg:min-h-[520px]">
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
        </div>
      </div>
    </section>
  );
};

export default CTA;
