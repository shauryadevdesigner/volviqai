import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Telemetry from './components/Telemetry';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Generator from './components/Generator';
import TemplateEngine from './components/TemplateEngine';
import AIHub from './components/AIHub';
import CinematicShowcase from './components/CinematicShowcase';
import PreviewWall from './components/PreviewWall';
import WorkflowTimeline from './components/WorkflowTimeline';
import Testimonials from './components/Testimonials';
import VolviqShowcase from './components/VolviqShowcase';
import CTA from './components/CTA';
import Footer from './components/Footer';
import ClickSpark from './components/animations/ClickSpark';
import LogoLoop from './components/animations/LogoLoop';
import BrandMarqueeLabel, { brandLogoItems } from './components/BrandMarquee';
import { usePerformanceProfile } from './hooks/usePerformanceProfile';

gsap.registerPlugin(ScrollTrigger);

const App = () => {
  const { lowEffects } = usePerformanceProfile();
  const mainRef = useRef(null);

  // Scroll velocity tracking for motion blur
  useEffect(() => {
    if (lowEffects) return;

    const root = document.documentElement;
    let blurFrame = null;

    const observer = ScrollTrigger.observe({
      onChangeY(self) {
        const v = Math.min(Math.abs(self.velocityY) / 4000, 1);
        const blur = v * 2.5; // max 2.5px motion blur
        if (blurFrame) cancelAnimationFrame(blurFrame);
        blurFrame = requestAnimationFrame(() => {
          root.style.setProperty('--motion-blur', `${blur}px`);
          root.style.setProperty('--scroll-velocity', v.toFixed(3));
        });
      },
    });

    return () => observer.kill();
  }, [lowEffects]);

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

        {/* 3D perspective wrapper for cinematic camera effects */}
        <main ref={mainRef} className="landing-sections">
          <Hero />

          {/* Brand Marquee — fast entrance ⚡ */}
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

          {/* Variable spacing: sections have different breathing room
              to create pacing rhythm — not uniform mt-16 everywhere */}

          {/* Fast feature reveals ⚡ */}
          <div className="mt-20 md:mt-28">
            <Generator />
          </div>
          <div className="mt-20 md:mt-28">
            <TemplateEngine />
          </div>

          {/* Pause — larger breathing room ⏸ */}
          <div className="mt-28 md:mt-40">
            <AIHub />
          </div>

          {/* Fast feature reveals ⚡ */}
          <div className="mt-20 md:mt-28">
            <CinematicShowcase />
          </div>
          <div className="mt-20 md:mt-28">
            <PreviewWall />
          </div>

          {/* Pause — larger breathing room ⏸ */}
          <div className="mt-28 md:mt-40">
            <WorkflowTimeline />
          </div>

          {/* Social proof — moderate pace */}
          <div className="mt-24 md:mt-32">
            <Testimonials />
          </div>

          {/* Showcase — deliberate */}
          <div className="mt-28 md:mt-36">
            <VolviqShowcase />
          </div>

          {/* Slow ending — luxurious CTA 🐌 */}
          <div className="mt-32 md:mt-44">
            <CTA />
          </div>
        </main>

        <Footer />
      </div>
    </ClickSpark>
  );
};

export default App;
