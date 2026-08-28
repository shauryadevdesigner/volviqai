import React from 'react';
import { motion } from 'motion/react';
import BlurText from './animations/BlurText';
import BorderGlow from './animations/BorderGlow';
import GlareHover from './animations/GlareHover';

const PreviewWall = () => {
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
        <div className="mb-20 text-left flex flex-col md:flex-row md:items-end justify-between">
          <div className="space-y-6 max-w-xl">
            <div className="font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
              06 // WALL
            </div>
            <h2 className="font-display-massive text-display-massive text-primary uppercase leading-none tracking-tight">
              <BlurText text="PREVIEW" animateBy="words" delay={80} className="block text-primary" />
              <BlurText text="GRAPHICS WALL" animateBy="words" delay={100} className="block text-primary" />
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Interactive structural nodes displaying active real-time rendering logic and layout previews.
            </p>
          </div>
          <div className="mt-6 md:mt-0 font-code-md text-code-md text-surface-variant border border-outline-variant p-4 bg-surface-container-low/50 select-none text-left">
            STATE: ACTIVE // RENDER_BUFFER: 95%
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wallItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
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
                    <div className="absolute inset-0 bg-tech-grid opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none" />
                    <div className="flex justify-between items-start">
                      <span className="font-code-md text-[10px] text-surface-variant group-hover:text-primary tracking-widest transition-colors">{item.scale}</span>
                      <span className="text-[10px] font-mono tracking-widest text-primary border border-outline-variant/60 px-2 py-0.5 bg-surface group-hover:border-primary transition-colors">{item.type}</span>
                    </div>
                    <div className="my-8 h-20 border border-outline-variant/30 relative flex items-center justify-center bg-surface overflow-hidden group-hover:border-primary/50 transition-all duration-300">
                      <div className="absolute w-6 h-6 rounded-full border border-primary/20 scale-100 group-hover:scale-150 transition-transform duration-500" />
                      <div className="absolute w-2 h-2 rounded-full bg-primary/20 group-hover:bg-primary/50 transition-colors" />
                      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-outline-variant"></div>
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-outline-variant"></div>
                    </div>
                    <div>
                      <h4 className="font-label-md text-label-md text-primary uppercase text-left group-hover:translate-x-1 transition-transform duration-300">{item.title}</h4>
                      <div className="mt-4 pt-3 border-t border-outline-variant/20 flex justify-between text-[9px] font-mono text-surface-variant group-hover:text-on-surface-variant transition-colors">
                        <span>RESOLUTION</span>
                        <span>{item.dim}</span>
                      </div>
                    </div>
                  </div>
                </GlareHover>
              </BorderGlow>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PreviewWall;
