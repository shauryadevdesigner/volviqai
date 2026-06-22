"use client";

import dynamic from 'next/dynamic';
import Telemetry from '@/components/Telemetry';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Generator from '@/components/Generator';
import TemplateEngine from '@/components/TemplateEngine';
import AIHub from '@/components/AIHub';
import CinematicShowcase from '@/components/CinematicShowcase';
import PreviewWall from '@/components/PreviewWall';
import WorkflowTimeline from '@/components/WorkflowTimeline';
import Testimonials from '@/components/Testimonials';
import VolviqShowcase from '@/components/VolviqShowcase';
import Footer from '@/components/Footer';
import BrandMarqueeLabel, { brandLogoItems } from '@/components/BrandMarquee';
import { usePerformanceProfile } from '@/hooks/usePerformanceProfile';

import type { LogoLoopProps } from '@/components/animations/LogoLoop.types';

// Dynamically import heavy Canvas / WebGL components with SSR disabled for fast hydration and minimal JS blocking
const ClickSpark = dynamic(() => import('@/components/animations/ClickSpark'), { ssr: false });
const LogoLoop = dynamic<LogoLoopProps>(() => import('@/components/animations/LogoLoop'), { ssr: false });
const CTA = dynamic(() => import('@/components/CTA'), { ssr: false });

export default function Home() {
  const { lowEffects } = usePerformanceProfile();

  return (
    <ClickSpark
      sparkColor="#ffffff"
      sparkSize={lowEffects ? 8 : 12}
      sparkRadius={lowEffects ? 14 : 22}
      sparkCount={lowEffects ? 4 : 8}
      duration={400}
    >
      <div className="relative min-h-screen overflow-x-hidden bg-tech-grid font-body-md text-on-surface antialiased selection:bg-primary selection:text-surface">
        <Telemetry />

        <Navbar />

        <main className="landing-sections">
          <Hero />

          <section className="relative border-b border-outline-variant bg-surface-container-low/40 py-16 md:py-20">
            <div className="mx-auto max-w-container-max space-y-8 px-margin-mobile md:px-margin-desktop">
              <BrandMarqueeLabel />
              <LogoLoop
                logos={brandLogoItems}
                speed={60}
                logoHeight={36}
                gap={72}
                fadeOut
                scaleOnHover
                fadeOutColor="#131313"
                pauseOnHover
                className="opacity-60 transition-opacity duration-500 hover:opacity-100"
              />
            </div>
          </section>

          <div className="mt-16">
            <Generator />
          </div>
          <div className="mt-16">
            <TemplateEngine />
          </div>
          <div className="mt-16">
            <AIHub />
          </div>
          <div className="mt-16">
            <CinematicShowcase />
          </div>
          <div className="mt-16">
            <PreviewWall />
          </div>
          <div className="mt-16">
            <WorkflowTimeline />
          </div>
          <div className="mt-16">
            <Testimonials />
          </div>
          <div className="mt-16">
            <VolviqShowcase />
          </div>
          <div className="mt-16">
            <CTA />
          </div>
        </main>

        <Footer />
      </div>
    </ClickSpark>
  );
}
