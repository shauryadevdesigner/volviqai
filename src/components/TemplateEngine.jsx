import React from 'react';
import { motion } from 'motion/react';
import BlurText from './animations/BlurText';
import BorderGlow from './animations/BorderGlow';
import GlareHover from './animations/GlareHover';
import { ease, spring } from '../utils/motionConfig';
import { useStaggerReveal } from '../hooks/useCinematicScroll';
import { usePerformanceProfile } from '../hooks/usePerformanceProfile';

const TemplateEngine = () => {
  const { lowEffects } = usePerformanceProfile();

  // GSAP stagger reveal — cards cascade with curtain clip-path
  const gridRef = useStaggerReveal({
    stagger: 0.1,
    from: { opacity: 0, y: 60, scale: 0.92, clipPath: 'inset(20% 0 0 0)' },
    to: { opacity: 1, y: 0, scale: 1, clipPath: 'inset(0% 0 0 0)' },
    ease: 'expo.out',
    duration: 0.9,
    childSelector: ':scope > div',
    disabled: lowEffects,
  });

  const templates = [
    { code: 'TPL-LX', icon: 'diamond', title: 'Luxury', desc: 'Absolute material fidelity, ray-traced reflections, and fluid sweeps.', fps: '120 FPS', nodes: '64 Render Nodes' },
    { code: 'TPL-FT', icon: 'rocket_launch', title: 'Futuristic', desc: 'Neon accents, complex holograms, blueprint overlaps, and cybernetic layouts.', fps: '240 FPS', nodes: '128 Render Nodes' },
    { code: 'TPL-EC', icon: 'shopping_cart', title: 'Ecommerce', desc: 'High-conversion product showcases with micro-animations and dynamic text.', fps: '90 FPS', nodes: '32 Render Nodes' },
    { code: 'TPL-GM', icon: 'sports_esports', title: 'Gaming', desc: 'High-octane energetic transitions, aggressive tracking, and chromatic aberrations.', fps: '240 FPS', nodes: '144 Render Nodes' },
    { code: 'TPL-SU', icon: 'lightbulb', title: 'Startup', desc: 'Clean, minimalist blueprint aesthetics and high-impact messaging grids.', fps: '120 FPS', nodes: '48 Render Nodes' }
  ];

  return (
    <section className="relative py-32 px-margin-mobile md:px-margin-desktop border-b border-outline-variant bg-surface-container-low" id="capabilities-templates">
      <div className="scanline"></div>

      {/* Header — camera push-in from scale 1.3 with depth blur */}
      <motion.div
        className="max-w-container-max mx-auto text-center mb-24"
        initial={{ scale: 1.3, opacity: 0, filter: 'blur(12px)' }}
        whileInView={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 1.0, ease: ease.outExpo }}
      >
        <div className="font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase mb-4">
          03 // MATRICES
        </div>
        <h2 className="font-display-massive text-display-massive text-primary uppercase leading-none tracking-tight">
          <BlurText text="PREMIUM" animateBy="words" delay={100} className="block text-primary" />
          <BlurText text="TEMPLATE ENGINE" animateBy="words" delay={120} className="block text-primary" />
        </h2>
        <motion.p
          className="mt-8 font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: ease.outExpo, delay: 0.3 }}
        >
          Pre-calibrated logic matrices for every industry. Deployable instantly. Motion Graphics. Reimagined.
        </motion.p>
      </motion.div>

      {/* Cards Grid — GSAP staggered curtain reveal */}
      <div ref={gridRef} className="max-w-container-max mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tpl, index) => (
          <div
            key={index}
            style={{ opacity: lowEffects ? 1 : 0 }}
          >
            <motion.div
              whileHover={{ y: -8, rotateX: -1, rotateY: 2 }}
              transition={{ duration: 0.4, ease: ease.outExpo }}
              className="h-full card-3d-hover"
            >
              <BorderGlow
                backgroundColor="#131313"
                borderRadius={0}
                glowColor="0 0 100"
                glowIntensity={0.9}
                edgeSensitivity={25}
                glowRadius={35}
                colors={['#ffffff', '#8e9192', '#353535']}
                fillOpacity={0.15}
                animated
                className="h-full"
              >
                <GlareHover
                  width="100%"
                  height="100%"
                  background="transparent"
                  borderRadius="0px"
                  borderColor="transparent"
                  glareColor="#ffffff"
                  glareOpacity={0.15}
                  glareAngle={-45}
                  glareSize={200}
                >
                <div className="p-8 relative flex flex-col justify-between group overflow-hidden cursor-pointer h-full bg-surface">
                  {/* Animated mesh grid glow */}
                  <div className="absolute inset-0 bg-tech-grid opacity-5 group-hover:opacity-15 transition-opacity duration-700 pointer-events-none" />
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out-expo" />

                  <div>
                    <div className="flex justify-between items-start mb-12">
                      <span className="font-code-md text-code-md text-on-surface-variant group-hover:text-primary transition-colors duration-500 ease-out-expo">
                        {tpl.code}
                      </span>
                      <motion.span
                        className="material-symbols-outlined text-primary p-2 bg-surface-container-high border border-outline-variant group-hover:border-primary transition-colors duration-500 ease-out-expo"
                        whileHover={{ rotate: 12, scale: 1.1 }}
                        transition={spring.snappy}
                      >
                        {tpl.icon}
                      </motion.span>
                    </div>
                    <h3 className="font-headline-lg text-headline-lg text-primary uppercase mb-4 tracking-wide group-hover:translate-x-1 transition-transform duration-500 ease-out-expo">
                      {tpl.title}
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant/80 group-hover:text-on-surface transition-colors duration-500 ease-out-expo leading-relaxed">
                      {tpl.desc}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-outline-variant/30 flex justify-between items-center text-[10px] font-mono tracking-widest text-surface-variant group-hover:text-on-surface-variant transition-colors duration-500">
                    <span>{tpl.fps}</span>
                    <span className="w-1.5 h-1.5 bg-outline-variant rounded-full group-hover:bg-primary transition-colors duration-500 ease-out-expo"></span>
                    <span>{tpl.nodes}</span>
                  </div>

                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-transparent group-hover:border-primary transition-all duration-500 ease-out-expo"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-transparent group-hover:border-primary transition-all duration-500 ease-out-expo"></div>
                </div>
                </GlareHover>
              </BorderGlow>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TemplateEngine;
