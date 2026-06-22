import { motion } from 'motion/react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import BlurText from '../animations/BlurText';
import GlareHover from '../animations/GlareHover';
import Telemetry from '../Telemetry';
import AuthNavbar from './AuthNavbar';

const ClickSpark = dynamic(() => import('../animations/ClickSpark'), { ssr: false });
const MagicRings = dynamic(() => import('../animations/MagicRings'), { ssr: false });

const LEFT_RINGS = {
  color: '#a855f7',
  colorTwo: '#7c3aed',
  ringCount: 8,
  speed: 0.8,
  rotation: -10,
};

const RIGHT_RINGS = {
  color: '#7c3aed',
  colorTwo: '#c084fc',
  ringCount: 8,
  speed: 1.0,
  rotation: 10,
};

interface AuthLayoutProps {
  protocolLabel: string;
  headline: string;
  subheadline?: string;
  children: React.ReactNode;
  footerLink: { to: string; label: string; prompt: string };
}

export default function AuthLayout({
  protocolLabel,
  headline,
  subheadline,
  children,
  footerLink,
}: AuthLayoutProps) {
  return (
    <ClickSpark sparkColor="#ffffff" sparkSize={12} sparkRadius={22} sparkCount={8} duration={450}>
      <div className="relative min-h-screen overflow-x-hidden bg-tech-grid font-body-md text-on-surface antialiased selection:bg-primary selection:text-surface">
        <Telemetry />
        <AuthNavbar />
        <div className="scanline" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-tech-grid opacity-10" aria-hidden="true" />

        <section className="relative flex min-h-screen flex-col items-center justify-center px-margin-mobile pb-20 pt-28 md:px-margin-desktop md:pt-32">
          <motion.div
            className="mb-6 flex items-center gap-2 font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-primary" aria-hidden="true" />
            {protocolLabel}
          </motion.div>

          <h1 className="mb-4 max-w-2xl text-center font-display-massive text-[32px] leading-none tracking-tight text-primary sm:text-[44px]">
            <BlurText text={headline} animateBy="words" delay={80} className="justify-center text-primary" />
          </h1>

          {subheadline && (
            <p className="mb-12 max-w-md text-center font-body-md text-body-md text-on-surface-variant">
              {subheadline}
            </p>
          )}

          <div className="relative flex w-full max-w-5xl items-center justify-center" style={{ minHeight: '480px' }}>
            <div className="pointer-events-none absolute left-0 top-1/2 z-0 hidden h-[480px] w-[380px] -translate-x-[8%] -translate-y-1/2 md:block">
              <MagicRings
                {...LEFT_RINGS}
                attenuation={6}
                lineThickness={2.5}
                baseRadius={0.22}
                radiusStep={0.07}
                opacity={1}
                followMouse
              />
            </div>

            <div className="pointer-events-none absolute right-0 top-1/2 z-0 hidden h-[480px] w-[380px] translate-x-[8%] -translate-y-1/2 md:block">
              <MagicRings
                {...RIGHT_RINGS}
                attenuation={6}
                lineThickness={2.5}
                baseRadius={0.22}
                radiusStep={0.07}
                opacity={1}
                followMouse
              />
            </div>

            <motion.div
              className="relative z-10 w-full max-w-md"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <GlareHover className="rounded-2xl border border-outline-variant bg-surface-container-low/90 p-8 backdrop-blur-md md:p-10">
                {children}
                <p className="mt-8 text-center font-body-md text-body-md text-on-surface-variant">
                  {footerLink.prompt}{' '}
                  <Link href={footerLink.to} className="text-primary underline-offset-4 hover:underline">
                    {footerLink.label}
                  </Link>
                </p>
              </GlareHover>
            </motion.div>
          </div>
        </section>
      </div>
    </ClickSpark>
  );
}
