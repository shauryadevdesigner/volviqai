import React from 'react';
import { motion } from 'motion/react';
import BlurText from './animations/BlurText';
import GlareHover from './animations/GlareHover';
import Threads from './animations/Threads';

const CinematicShowcase = () => {
  const showcases = [
    {
      id: 'SCENE.01',
      title: 'Procedural Cyberpunk City',
      img: '/cyberpunk.jpg',
      aspect: 'aspect-video',
      span: 'md:col-span-2',
      nodes: '64M POLYGONS'
    },
    {
      id: 'SCENE.02',
      title: 'Holographic Node Array',
      img: '/cyberpunk.jpg',
      aspect: 'aspect-square md:aspect-auto',
      span: 'md:col-span-1',
      nodes: '24M STRUCTS'
    }
  ];

  return (
    <section className="relative py-32 px-margin-mobile md:px-margin-desktop border-b border-outline-variant bg-surface-container-low overflow-hidden" id="capabilities-showcase">
      <div className="scanline"></div>

      {/* Threads WebGL Motion Graphic Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <Threads color={[0.04, 0.7, 0.76]} amplitude={0.8} distance={0.3} />
      </div>

      <div className="max-w-container-max mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="mb-20 text-left flex flex-col md:flex-row md:items-end justify-between">
          <div className="space-y-6 max-w-xl">
            <div className="font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
              05 // PREVIEW
            </div>
            <h2 className="font-display-massive text-display-massive text-primary uppercase leading-none tracking-tight">
              <BlurText text="CINEMATIC" animateBy="words" delay={80} className="block text-primary" />
              <BlurText text="SHOWCASE" animateBy="words" delay={100} className="block text-primary" />
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Ray-traced sample frames generated natively on the Volviq AI CUDA rendering node.
            </p>
          </div>
          
          <motion.div 
            className="mt-6 md:mt-0 font-code-md text-code-md text-surface-variant text-right border-l border-outline-variant pl-6"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            NODE.GEN.ACTIVE <br />
            REFLECTANCE: TRUE <br />
            SAMPLES: 2048/px
          </motion.div>
        </div>

        {/* Gallery Grid Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {showcases.map((scene, index) => (
            <motion.div
              key={index}
              className={`border border-outline-variant bg-surface relative group flex flex-col justify-between ${scene.span} overflow-hidden`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: index * 0.15, duration: 0.7, ease: 'easeOut' }}
              whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.3)' }}
            >
              <GlareHover
                width="100%"
                height="100%"
                background="transparent"
                borderRadius="0px"
                borderColor="transparent"
                glareColor="#ffffff"
                glareOpacity={0.12}
                glareAngle={-45}
                glareSize={200}
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1rem', height: '100%', width: '100%' }}
              >
                <div className="w-full">
                  {/* Visual Image box */}
                  <div className={`relative overflow-hidden w-full ${scene.aspect} border border-outline-variant bg-surface-container`}>
                    
                    {/* Animated glitch-scan line over render */}
                    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                      <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent animate-scanDown" />
                    </div>

                    {/* Subtle technical scanner line over render */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent h-1/2 w-full translate-y-[-100%] group-hover:translate-y-[200%] transition-transform duration-1000 ease-in-out pointer-events-none" />

                    <img
                      alt={scene.title}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                      src={scene.img}
                    />

                    {/* Cinematic vignette overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

                    {/* Operational Tags */}
                    <div className="absolute top-4 left-4 font-code-md text-[10px] text-primary bg-black/60 px-2 py-1 backdrop-blur-sm border border-outline-variant/60 z-20">
                      {scene.id}
                    </div>

                    {/* Live render badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 font-code-md text-[9px] text-green-400 bg-black/60 px-2 py-1 backdrop-blur-sm border border-outline-variant/60 z-20">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                      LIVE
                    </div>
                  </div>

                  {/* Info Text */}
                  <h3 className="font-headline-lg text-[22px] text-primary uppercase mt-6 mb-2 tracking-wide text-left group-hover:text-white transition-colors">
                    {scene.title}
                  </h3>
                </div>

                {/* Footer readout */}
                <div className="mt-8 pt-4 border-t border-outline-variant/30 flex justify-between items-center text-[10px] font-mono tracking-widest text-surface-variant group-hover:text-on-surface-variant transition-colors duration-300 text-left w-full">
                  <span>COMPILED ON-GRID</span>
                  <span className="w-1.5 h-1.5 bg-outline-variant rounded-full group-hover:bg-primary transition-colors"></span>
                  <span>{scene.nodes}</span>
                </div>

                {/* Corner Indicators */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-transparent group-hover:border-primary transition-colors"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-transparent group-hover:border-primary transition-colors"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-transparent group-hover:border-primary transition-colors"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-transparent group-hover:border-primary transition-colors"></div>
              </GlareHover>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CinematicShowcase;
