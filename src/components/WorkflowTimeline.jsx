import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import BlurText from './animations/BlurText';
import GlareHover from './animations/GlareHover';
import { ease, spring } from '../utils/motionConfig';
import { usePerformanceProfile } from '../hooks/usePerformanceProfile';

gsap.registerPlugin(ScrollTrigger);

const WorkflowTimeline = () => {
  const { lowEffects } = usePerformanceProfile();
  const lineRef = useRef(null);
  const nodesContainerRef = useRef(null);

  const steps = [
    { num: '1', title: 'Upload', desc: 'Input raw media logs, branding SVGs, and text files into the intake queue.' },
    { num: '2', title: 'Style', desc: 'Select pre-calibrated matrix logic tailored for luxury, gaming, or startup markets.' },
    { num: '3', title: 'Generate', desc: 'Engage multi-threaded CUDA rendering systems to procedurally compose frames.' },
    { num: '4', title: 'Export', desc: 'One-click automated compiles exported instantly to high-speed delivery pipelines.' }
  ];

  // Scroll-driven line draw + node activation
  useEffect(() => {
    if (lowEffects || !lineRef.current || !nodesContainerRef.current) return;

    const nodes = nodesContainerRef.current.querySelectorAll('.timeline-node');
    
    const ctx = gsap.context(() => {
      // Draw the connecting line on scroll
      gsap.fromTo(lineRef.current,
        { scaleX: 0, transformOrigin: 'left center' },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: nodesContainerRef.current,
            start: 'top 75%',
            end: 'bottom 50%',
            scrub: 0.5,
          },
        }
      );

      // Stagger node activation
      nodes.forEach((node, i) => {
        gsap.fromTo(node,
          { opacity: 0, y: 50, scale: 0.85 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            ease: 'expo.out',
            duration: 0.8,
            scrollTrigger: {
              trigger: node,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, [lowEffects]);

  return (
    <section className="relative py-32 px-margin-mobile md:px-margin-desktop border-b border-outline-variant bg-surface-container-low" id="workflow">
      <div className="scanline"></div>

      <div className="max-w-container-max mx-auto">
        
        {/* Section Header — camera push-in */}
        <motion.div
          className="mb-24 text-center"
          initial={{ scale: 1.25, opacity: 0, filter: 'blur(12px)' }}
          whileInView={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 1.0, ease: ease.outExpo }}
        >
          <div className="font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase mb-4 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full cinema-heartbeat"></span>
            07 // SEQUENCE
          </div>
          <h2 className="font-display-massive text-display-massive text-primary uppercase leading-none tracking-tight">
            <BlurText text="AI WORKFLOW" animateBy="words" delay={100} className="block text-primary" />
            <BlurText text="TIMELINE" animateBy="words" delay={120} className="block text-primary" />
          </h2>
          <motion.p
            className="mt-8 font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: ease.outExpo, delay: 0.3 }}
          >
            Four sequential operational states transforming raw assets into finished cinematic motion ads.
          </motion.p>
        </motion.div>

        {/* Steps Grid — with scroll-drawn connecting line */}
        <div ref={nodesContainerRef} className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
          
          {/* Horizontal Connecting track line — scroll-drawn */}
          <div className="hidden md:block absolute top-16 left-0 w-full h-[1px] bg-outline-variant/30 -z-10">
            <div
              ref={lineRef}
              className="h-full bg-gradient-to-r from-primary/80 via-primary to-primary/80 w-full"
              style={{ transformOrigin: 'left center', transform: lowEffects ? 'scaleX(1)' : 'scaleX(0)' }}
            />
          </div>

          {steps.map((step, idx) => (
            <div
              key={idx}
              className="timeline-node bg-surface border border-outline-variant text-center relative group hover:border-primary transition-all duration-500 ease-out-expo overflow-hidden cursor-pointer"
              style={{ opacity: lowEffects ? 1 : 0 }}
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
                <div className="absolute inset-0 bg-tech-grid opacity-5 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none" />

                {/* Sequential Node Circle — with ripple effect on hover */}
                <div className="relative w-16 h-16 bg-surface-variant rounded-full flex items-center justify-center mx-auto mb-6 text-primary font-headline-lg border border-outline-variant/60 group-hover:border-primary group-hover:bg-primary group-hover:text-surface transition-all duration-500 ease-out-expo shadow-md">
                  {/* Number with count-up animation */}
                  <motion.span
                    className="font-bold"
                    initial={{ y: lowEffects ? 0 : 20, opacity: lowEffects ? 1 : 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: ease.outExpo, delay: 0.2 + idx * 0.15 }}
                  >
                    {step.num}
                  </motion.span>
                  
                  {/* Expanding ripple ring */}
                  <div className="absolute inset-0 rounded-full border border-primary/20 scale-100 group-hover:scale-[2] opacity-100 group-hover:opacity-0 transition-all duration-700 ease-out-expo pointer-events-none" />
                  {/* Second ripple ring — delayed */}
                  <div className="absolute inset-0 rounded-full border border-primary/10 scale-100 group-hover:scale-[2.5] opacity-100 group-hover:opacity-0 transition-all duration-1000 ease-out-expo pointer-events-none delay-100" />
                </div>

                {/* Title */}
                <h3 className="font-label-md text-label-md uppercase text-primary mb-4 tracking-widest group-hover:tracking-[0.2em] transition-all duration-500 ease-out-expo">
                  {step.title}
                </h3>
                
                <p className="text-label-sm text-on-surface-variant leading-relaxed">
                  {step.desc}
                </p>

                {/* Corner accent vectors */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-transparent group-hover:border-primary transition-colors duration-500 ease-out-expo"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-transparent group-hover:border-primary transition-colors duration-500 ease-out-expo"></div>
              </GlareHover>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default WorkflowTimeline;
