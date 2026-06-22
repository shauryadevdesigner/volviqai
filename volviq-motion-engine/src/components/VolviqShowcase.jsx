import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Zap, Film, Layers } from 'lucide-react';
import BlurText from './animations/BlurText';
import GlareHover from './animations/GlareHover';
import RotatingText from './animations/RotatingText';
import VolviqMotionStudio from './animations/VolviqMotionStudio';
import { usePerformanceProfile } from '../hooks/usePerformanceProfile';
import { scrollToTarget } from '../utils/scrollTo';
import { useAuthContext } from './providers/AuthProvider';

const MagicRings = dynamic(() => import('./animations/MagicRings'), { ssr: false });

const STATS = [
  { icon: Zap, label: '10× faster', sub: 'vs traditional motion pipelines' },
  { icon: Film, label: '4K ready', sub: 'cinematic export presets' },
  { icon: Layers, label: 'Multi-layer', sub: 'AI compositing & timing' },
];

const VolviqShowcase = () => {
  const { noWebGL } = usePerformanceProfile();
  const auth = useAuthContext();
  const isAuthenticated = Boolean(auth?.session);

  return (
    <section
      className="relative overflow-hidden border-b border-outline-variant bg-surface py-28 md:py-36 px-margin-mobile md:px-margin-desktop"
      id="showcase"
    >
      <div className="scanline" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-tech-grid opacity-[0.07]" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-container-max">
        <div className="mb-14 flex flex-col items-center text-center">
          <div className="mb-6 flex items-center gap-2 font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" aria-hidden="true" />
            09 // CREATIVE PROOF
          </div>
          <h2 className="max-w-4xl font-display-massive text-[34px] uppercase leading-none tracking-tight text-primary sm:text-[48px]">
            <BlurText text="Motion that sells." animateBy="words" delay={90} className="text-primary" />
          </h2>
          <p className="mt-6 max-w-2xl font-body-md text-[15px] leading-relaxed text-on-surface-variant sm:text-[17px]">
            Volviq turns briefs into broadcast-ready ads — storyboard, motion, voice, and export in one
            intelligent flow. See the engine work in real time.
          </p>
        </div>

        <div className="relative grid grid-cols-1 items-stretch gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Motion graphic stage */}
          <motion.div
            className="relative min-h-[360px] lg:min-h-[420px]"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            {!noWebGL && (
              <div className="pointer-events-none absolute -left-8 top-1/2 z-0 hidden h-[380px] w-[280px] -translate-y-1/2 opacity-60 lg:block">
                <MagicRings
                  color="#a855f7"
                  colorTwo="#7c3aed"
                  ringCount={5}
                  speed={0.65}
                  attenuation={7}
                  lineThickness={2}
                  baseRadius={0.26}
                  radiusStep={0.08}
                  scaleRate={0.12}
                  opacity={0.85}
                  blur={2}
                  noiseAmount={0.03}
                  rotation={-6}
                  followMouse={false}
                  hoverScale={1}
                  parallax={0}
                  clickBurst={false}
                />
              </div>
            )}

            <div className="relative z-10 h-full">
              <GlareHover
                width="100%"
                height="100%"
                background="transparent"
                borderRadius="0"
                borderColor="transparent"
                glareColor="#a855f7"
                glareOpacity={0.12}
                glareAngle={-40}
                glareSize={240}
                style={{ display: 'block', height: '100%', minHeight: 360 }}
              >
                <VolviqMotionStudio className="h-full min-h-[360px] lg:min-h-[420px]" />
              </GlareHover>
            </div>

            <div className="absolute bottom-3 left-3 z-20 font-code-md text-[9px] uppercase tracking-widest text-surface-variant/70">
              LIVE_PREVIEW // MOTION_ENGINE
            </div>
          </motion.div>

          {/* Story + CTA */}
          <motion.div
            className="flex flex-col justify-center space-y-8"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-2 font-code-md text-[9px] uppercase tracking-wider text-purple-400">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <RotatingText
                texts={['BRAND_FILMS', 'PRODUCT_ADS', 'SOCIAL_CUTDOWNS', 'LAUNCH_TEASERS']}
                rotationInterval={2400}
                splitBy="words"
                staggerDuration={0.04}
                mainClassName="font-code-md"
              />
            </div>

            <ul className="space-y-5">
              {STATS.map(({ icon: Icon, label, sub }, i) => (
                <motion.li
                  key={label}
                  className="flex gap-4 border-l-2 border-purple-500/40 pl-4"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                >
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-outline-variant/50 bg-surface-container-low text-purple-400">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-headline-lg text-[18px] text-primary">{label}</p>
                    <p className="font-body-md text-[13px] text-on-surface-variant">{sub}</p>
                  </div>
                </motion.li>
              ))}
            </ul>

            <p className="font-body-md text-[14px] leading-relaxed text-on-surface-variant">
              Join teams shipping weekly campaigns without a full motion department. Early access includes
              priority features and direct input on the roadmap.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href={isAuthenticated ? "/dashboard" : "/signup"}
                className="group relative inline-flex items-center gap-2 overflow-hidden border border-primary bg-primary px-8 py-4 font-label-md text-label-md uppercase tracking-widest text-surface transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-2 transition-colors duration-300 group-hover:text-primary">
                  {isAuthenticated ? "Dashboard" : "Get Started"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
                <span className="absolute inset-0 origin-left scale-x-0 bg-surface transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
              <a
                href="#engine"
                className="border border-outline-variant px-8 py-4 font-label-md text-label-md uppercase tracking-widest text-primary transition-all duration-300 hover:border-primary hover:bg-surface-variant/30"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTarget('#engine');
                }}
              >
                Watch Demo
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default VolviqShowcase;
