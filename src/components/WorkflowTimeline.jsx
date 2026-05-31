import React from 'react';
import { motion } from 'motion/react';
import BlurText from './animations/BlurText';
import GlareHover from './animations/GlareHover';

const WorkflowTimeline = () => {
  const steps = [
    { num: '1', title: 'Upload', desc: 'Input raw media logs, branding SVGs, and text files into the intake queue.' },
    { num: '2', title: 'Style', desc: 'Select pre-calibrated matrix logic tailored for luxury, gaming, or startup markets.' },
    { num: '3', title: 'Generate', desc: 'Engage multi-threaded CUDA rendering systems to procedurally compose frames.' },
    { num: '4', title: 'Export', desc: 'One-click automated compiles exported instantly to high-speed delivery pipelines.' }
  ];

  return (
    <section className="relative py-32 px-margin-mobile md:px-margin-desktop border-b border-outline-variant bg-surface-container-low" id="workflow">
      <div className="scanline"></div>

      <div className="max-w-container-max mx-auto">
        
        {/* Section Header */}
        <div className="mb-24 text-center">
          <div className="font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase mb-4 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
            07 // SEQUENCE
          </div>
          <h2 className="font-display-massive text-display-massive text-primary uppercase leading-none tracking-tight">
            <BlurText text="AI WORKFLOW" animateBy="words" delay={100} className="block text-primary" />
            <BlurText text="TIMELINE" animateBy="words" delay={120} className="block text-primary" />
          </h2>
          <p className="mt-8 font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Four sequential operational states transforming raw assets into finished cinematic motion ads.
          </p>
        </div>

        {/* Steps Grid - with sequential layout and connecting glowing paths */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
          
          {/* Horizontal Connecting track line */}
          <div className="hidden md:block absolute top-16 left-0 w-full h-[1px] bg-outline-variant/30 -z-10">
            <motion.div 
              className="h-full bg-gradient-to-r from-transparent via-primary/50 to-transparent w-full"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
          </div>

          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              className="bg-surface border border-outline-variant text-center relative group hover:border-primary transition-all duration-500 overflow-hidden cursor-pointer"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: idx * 0.15, duration: 0.6, ease: 'easeOut' }}
              whileHover={{ y: -6 }}
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
                style={{ display: 'block', padding: '2rem' }}
              >
                {/* Drifting mesh background */}
                <div className="absolute inset-0 bg-tech-grid opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none" />

                {/* Sequential Node Indicator Circle */}
                <div className="relative w-16 h-16 bg-surface-variant rounded-full flex items-center justify-center mx-auto mb-6 text-primary font-headline-lg border border-outline-variant/60 group-hover:border-primary group-hover:bg-primary group-hover:text-surface transition-all duration-500 shadow-md">
                  <span className="font-bold">{step.num}</span>
                  
                  {/* Glowing ring */}
                  <div className="absolute inset-0 rounded-full border border-primary/20 scale-100 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                </div>

                {/* Title and Description */}
                <h3 className="font-label-md text-label-md uppercase text-primary mb-4 tracking-widest group-hover:tracking-widest transition-all">
                  {step.title}
                </h3>
                
                <p className="text-label-sm text-on-surface-variant leading-relaxed">
                  {step.desc}
                </p>

                {/* Corner accent vectors */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-transparent group-hover:border-primary transition-colors"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-transparent group-hover:border-primary transition-colors"></div>
              </GlareHover>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default WorkflowTimeline;
