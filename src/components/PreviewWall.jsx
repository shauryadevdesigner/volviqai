import React from 'react';
import { motion } from 'motion/react';
import BlurText from './animations/BlurText';
import BorderGlow from './animations/BorderGlow';
import GlareHover from './animations/GlareHover';
import { ease, spring } from '../utils/motionConfig';
import { useStaggerReveal } from '../hooks/useCinematicScroll';
import { usePerformanceProfile } from '../hooks/usePerformanceProfile';

const PreviewWall = () => {
  const { lowEffects } = usePerformanceProfile();

  // GSAP masonry cascade reveal
  const gridRef = useStaggerReveal({
    stagger: 0.12,
    from: { opacity: 0, y: 70, scale: 0.9, rotateX: 6 },
    to: { opacity: 1, y: 0, scale: 1, rotateX: 0 },
    ease: 'expo.out',
    duration: 0.9,
    childSelector: ':scope > div',
    disabled: lowEffects,
  });

  const wallItems = [
    { title: 'Vector Grid Sweep', scale: 'GRID_A', type: 'ANIM.LOOP', dim: '1920x1080' },
    { title: 'Dynamic Lens Blur', scale: 'GRID_B', type: 'BLUR.FX', dim: '1080x1350' },
    { title: 'Holographic Typography', scale: 'GRID_C', type: 'TEXT.NODE', dim: '1080x1080' },
    { title: 'Raytraced Chromatic Sweep', scale: 'GRID_D', type: 'CHROMA.LOOP', dim: '1920x1080' }
  ];

  return (
    <section className="relative py-32 px-margin-mobile md:px-margin-desktop border-b border-outline-variant bg-surface" id="capabilities-wall">
      <div className="scanline"></div>
      <div className="max-w-container-max mx-auto">

        {/* Header — camera push-in with depth blur */}
        <div className="mb-20 text-left flex flex-col md:flex-row md:items-end justify-between">
          <motion.div
            className="space-y-6 max-w-xl"
            initial={{ scale: 1.15, opacity: 0, filter: 'blur(10px)' }}
            whileInView={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 1.0, ease: ease.outExpo }}
          >
            <div className="font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full cinema-heartbeat"></span>
              06 // WALL
            </div>
            <h2 className="font-display-massive text-display-massive text-primary uppercase leading-none tracking-tight">
              <BlurText text="PREVIEW" animateBy="words" delay={80} className="block text-primary" />
              <BlurText text="GRAPHICS WALL" animateBy="words" delay={100} className="block text-primary" />
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Interactive structural nodes displaying active real-time rendering logic and layout previews.
            </p>
          </motion.div>

          {/* Status panel — spring bounce entrance */}
          <motion.div
            className="mt-6 md:mt-0 font-code-md text-code-md text-surface-variant border border-outline-variant p-4 bg-surface-container-low/50 select-none text-left"
            initial={{ opacity: 0, x: 40, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ ...spring.bouncy, delay: 0.3 }}
          >
            STATE: ACTIVE // RENDER_BUFFER: 95%
          </motion.div>
        </div>

        {/* Cards — GSAP masonry cascade with perspective depth */}
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" style={{ perspective: '800px' }}>
          {wallItems.map((item, idx) => (
            <div
              key={idx}
              style={{ opacity: lowEffects ? 1 : 0 }}
            >
              <motion.div
                whileHover={{ y: -10, scale: 1.03 }}
                transition={{ duration: 0.4, ease: ease.outExpo }}
                className="depth-hover"
              >
                <BorderGlow
                  backgroundColor="#131313"
                  borderRadius={0}
                  glowColor="0 0 100"
                  glowIntensity={0.9}
                  edgeSensitivity={25}
                  glowRadius={32}
                  colors={['#ffffff', '#8e9192', '#353535']}
                  fillOpacity={0.12}
                  animated
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
                    <div className="p-6 flex flex-col justify-between relative group cursor-pointer overflow-hidden min-h-[260px] bg-surface-container-low/30">
                      <div className="absolute inset-0 bg-tech-grid opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none" />
                      <div className="flex justify-between items-start">
                        <span className="font-code-md text-[10px] text-surface-variant group-hover:text-primary tracking-widest transition-colors duration-500 ease-out-expo">{item.scale}</span>
                        <span className="text-[10px] font-mono tracking-widest text-primary border border-outline-variant/60 px-2 py-0.5 bg-surface group-hover:border-primary transition-colors duration-500 ease-out-expo">{item.type}</span>
                      </div>

                      {/* Breathing visualization circle */}
                      <div className="my-8 h-20 border border-outline-variant/30 relative flex items-center justify-center bg-surface overflow-hidden group-hover:border-primary/50 transition-all duration-500 ease-out-expo">
                        <div className="absolute w-6 h-6 rounded-full border border-primary/20 cinema-breathe" />
                        <div className="absolute w-2 h-2 rounded-full bg-primary/20 group-hover:bg-primary/50 transition-colors duration-500 ease-out-expo" />
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-outline-variant"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-outline-variant"></div>
                      </div>

                      <div>
                        <h4 className="font-label-md text-label-md text-primary uppercase text-left group-hover:translate-x-1.5 transition-transform duration-500 ease-out-expo">{item.title}</h4>
                        <div className="mt-4 pt-3 border-t border-outline-variant/20 flex justify-between text-[9px] font-mono text-surface-variant group-hover:text-on-surface-variant transition-colors duration-500 ease-out-expo">
                          <span>RESOLUTION</span>
                          <span>{item.dim}</span>
                        </div>
                      </div>
                    </div>
                  </GlareHover>
                </BorderGlow>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PreviewWall;
