import React from 'react';
import { motion } from 'motion/react';
import BlurText from './animations/BlurText';
import GlareHover from './animations/GlareHover';
import Threads from './animations/Threads';
import { ease, spring } from '../utils/motionConfig';

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
        
        {/* Header Section — camera push-in with blur */}
        <div className="mb-20 text-left flex flex-col md:flex-row md:items-end justify-between">
          <motion.div
            className="space-y-6 max-w-xl"
            initial={{ scale: 1.2, opacity: 0, filter: 'blur(10px)' }}
            whileInView={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 1.0, ease: ease.outExpo }}
          >
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
          </motion.div>
          
          {/* Tech readout — wipe from left */}
          <motion.div 
            className="mt-6 md:mt-0 font-code-md text-code-md text-surface-variant text-right border-l border-outline-variant pl-6"
            initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
            whileInView={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: ease.inOutCubic, delay: 0.4 }}
          >
            NODE.GEN.ACTIVE <br />
            REFLECTANCE: TRUE <br />
            SAMPLES: 2048/px
          </motion.div>
        </div>

        {/* Gallery Grid — zoom-through reveal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {showcases.map((scene, index) => (
            <motion.div
              key={index}
              className={`border border-outline-variant bg-surface relative group flex flex-col justify-between ${scene.span} overflow-hidden`}
              initial={{ opacity: 0, scale: 1.4, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: index * 0.2, duration: 1.2, ease: ease.cameraZoom }}
              whileHover={{ y: -6, borderColor: 'rgba(255,255,255,0.3)' }}
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
                  {/* Visual Image box — Ken Burns drift */}
                  <div className={`relative overflow-hidden w-full ${scene.aspect} border border-outline-variant bg-surface-container`}>
                    
                    {/* Animated scan line */}
                    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                      <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent animate-scan-down" />
                    </div>

                    {/* Scanner line on hover */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent h-1/2 w-full translate-y-[-100%] group-hover:translate-y-[200%] transition-transform duration-1000 ease-in-out-cubic pointer-events-none" />

                    {/* Image with Ken Burns drift */}
                    <img
                      alt={scene.title}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 cinema-ken-burns"
                      src={scene.img}
                    />

                    {/* Cinematic vignette overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

                    {/* Scene ID label — typewriter style entrance */}
                    <motion.div
                      className="absolute top-4 left-4 font-code-md text-[10px] text-primary bg-black/60 px-2 py-1 backdrop-blur-sm border border-outline-variant/60 z-20"
                      initial={{ width: 0, opacity: 0 }}
                      whileInView={{ width: 'auto', opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, ease: ease.outExpo, delay: 0.5 + index * 0.2 }}
                    >
                      {scene.id}
                    </motion.div>

                    {/* Live render badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 font-code-md text-[9px] text-green-400 bg-black/60 px-2 py-1 backdrop-blur-sm border border-outline-variant/60 z-20">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full cinema-heartbeat"></span>
                      LIVE
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-headline-lg text-[22px] text-primary uppercase mt-6 mb-2 tracking-wide text-left group-hover:text-white transition-colors duration-500 ease-out-expo">
                    {scene.title}
                  </h3>
                </div>

                {/* Footer readout */}
                <div className="mt-8 pt-4 border-t border-outline-variant/30 flex justify-between items-center text-[10px] font-mono tracking-widest text-surface-variant group-hover:text-on-surface-variant transition-colors duration-500 text-left w-full">
                  <span>COMPILED ON-GRID</span>
                  <span className="w-1.5 h-1.5 bg-outline-variant rounded-full group-hover:bg-primary transition-colors duration-500 ease-out-expo"></span>
                  <span>{scene.nodes}</span>
                </div>

                {/* Corner Indicators */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-transparent group-hover:border-primary transition-colors duration-500 ease-out-expo"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-transparent group-hover:border-primary transition-colors duration-500 ease-out-expo"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-transparent group-hover:border-primary transition-colors duration-500 ease-out-expo"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-transparent group-hover:border-primary transition-colors duration-500 ease-out-expo"></div>
              </GlareHover>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CinematicShowcase;
