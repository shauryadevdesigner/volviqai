import React from 'react';
import { motion } from 'motion/react';
import BlurText from './animations/BlurText';
import GlareHover from './animations/GlareHover';

const Generator = () => {
  const listItems = [
    { icon: 'upload_file', title: 'Seamless Asset Ingestion', desc: 'Ingest raw logs, vector graphics, and brand palettes.' },
    { icon: 'auto_awesome', title: 'Algorithmic Composition', desc: 'Autonomous layout, balance, and visual structure.' },
    { icon: 'movie', title: 'Cinematic Output', desc: 'Direct compile into high-end raytraced motion formats.' }
  ];

  return (
    <section className="relative py-32 px-margin-mobile md:px-margin-desktop border-b border-outline-variant bg-surface" id="capabilities">
      <div className="scanline"></div>
      
      <div className="max-w-container-max mx-auto">
        <div className="flex flex-col md:flex-row gap-16 md:gap-24 items-center">
          
          {/* Left panel: Image container with technical borders */}
          <div className="w-full md:w-1/2 relative">
            <motion.div 
              className="border border-outline-variant bg-surface-dim relative group overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
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
                glareSize={150}
              >
                <div className="p-4 relative w-full h-full">
                  {/* Animated mesh gradient behind image */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                  <img 
                    alt="Holographic data streams and nodes" 
                    className="w-full h-auto img-mono transition-all duration-700 group-hover:filter-none" 
                    src="/cyberpunk.jpg"
                  />
                  
                  <div className="absolute top-8 left-8 font-code-md text-code-md text-primary bg-black/60 px-3 py-1.5 backdrop-blur-sm border border-outline-variant">
                    SYS.GEN.01
                  </div>

                  {/* Corner tech indicators */}
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary"></div>
                </div>
              </GlareHover>
            </motion.div>
          </div>
          
          {/* Right panel: Descriptive text and feature checklist */}
          <div className="w-full md:w-1/2 space-y-8 text-left">
            <div className="font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
              02 // SYNTHESIS
            </div>
            
            <h2 className="font-headline-xl text-headline-xl text-primary uppercase leading-tight tracking-tight">
              <BlurText text="AI MOTION GRAPHIC" animateBy="words" delay={80} className="block text-primary font-headline-xl" />
              <BlurText text="AD GENERATOR" animateBy="words" delay={100} className="block text-primary font-headline-xl" />
            </h2>
            
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Create Cinematic Ads With AI. Upload your base assets—image, logo, and headline—and watch as the engine autonomously constructs a high-fidelity cinematic ad in seconds.
            </p>
            
            <ul className="space-y-6 pt-8 border-t border-surface-variant">
              {listItems.map((item, idx) => (
                <motion.li 
                  key={idx} 
                  className="flex items-start gap-4 group"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <span className="material-symbols-outlined text-primary p-2 bg-surface-container-low border border-outline-variant group-hover:border-primary transition-colors duration-300">
                    {item.icon}
                  </span>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface tracking-wider uppercase group-hover:text-primary transition-colors duration-300">
                      {item.title}
                    </h4>
                    <p className="text-[12px] text-on-surface-variant mt-1">{item.desc}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Generator;
