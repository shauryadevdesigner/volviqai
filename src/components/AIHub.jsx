import React from 'react';
import { motion } from 'motion/react';
import BlurText from './animations/BlurText';
import BorderGlow from './animations/BorderGlow';
import ScrollStack, { ScrollStackItem } from './animations/ScrollStack';
import GlareHover from './animations/GlareHover';
import { ease, spring } from '../utils/motionConfig';

const AIHub = () => {
  const capabilities = [
    { num: '01', title: 'AI Motion Graphics Engine', desc: 'Real-time procedural generation of vector typography, tracking curves, and dynamic branding overlays.', telemetry: 'LATENCY // 0.05ms', metric: '8K UNCOMPRESSED', tag: 'CORE' },
    { num: '02', title: 'AI Voiceover Generation', desc: 'Synthesizes synthetic clone narration with emotional tone mapping and automated lip-sync timing curves.', telemetry: 'FREQ // 48kHz', metric: 'NATURAL TIMBRE', tag: 'AUDIO' },
    { num: '03', title: 'AI Ad Script Generation', desc: 'Generative copywriting models trained on high-performance sales letters and conversion-driven scripts.', telemetry: 'MODEL // CQ-V4', metric: 'HIGH CONVERSION', tag: 'COPY' },
    { num: '04', title: 'AI Cinematic Rendering', desc: 'Ray-traced depth compilation utilizing volumetric clouds, organic lens bloom, and dynamic light paths.', telemetry: 'GPU // CUDA CLUSTER', metric: 'RTX PARALLAX', tag: 'RENDER' },
    { num: '05', title: 'AI Motion Assets For Editors', desc: 'Generates green-screen templates, alpha-channel dynamic transitions, HUD assets, and typography presets.', telemetry: 'FORMAT // PRORES 444', metric: 'ALPHA INTEGRATION', tag: 'ASSETS' },
    { num: '06', title: 'AI Social Media Ad Exports', desc: 'One-click compiler targeting all aspect ratios simultaneously, with network-specific audio and visual formats.', telemetry: 'PORT // MULTI-THREAD', metric: 'AUTO PACKAGING', tag: 'EXPORT' }
  ];

  return (
    <section className="relative py-32 px-margin-mobile md:px-margin-desktop border-b border-outline-variant bg-surface" id="capabilities-hub">
      <div className="scanline"></div>
      <div className="max-w-container-max mx-auto">

        {/* Header — depth-of-field camera focus effect */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 text-left">
          <motion.div
            className="space-y-6 max-w-2xl"
            initial={{ scale: 0.85, opacity: 0, filter: 'blur(14px)' }}
            whileInView={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1.2, ease: ease.outExpo }}
          >
            <div className="font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full cinema-heartbeat"></span>
              04 // COGNITION
            </div>
            <h2 className="font-display-massive text-display-massive text-primary uppercase leading-none tracking-tight">
              <BlurText text="AI CAPABILITY" animateBy="words" delay={100} className="block text-primary" />
              <BlurText text="INTELLIGENCE" animateBy="words" delay={120} className="block text-primary" />
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              Six autonomous vector engines calibrated to completely replace conventional linear production pipelines.
            </p>
          </motion.div>

          {/* Right sidebar — spring overshoot entrance */}
          <motion.div
            className="mt-8 md:mt-0 font-code-md text-code-md text-surface-variant/80 border border-outline-variant p-4 bg-surface-container-low/50 select-none"
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ ...spring.bouncy, delay: 0.4 }}
          >
            ENGINE_STATE: OPERATIONAL <br />STITCH.AI.ARCHITECTURE
          </motion.div>
        </div>

        <ScrollStack
          useWindowScroll={true}
          itemDistance={60}
          itemScale={0.02}
          itemStackDistance={35}
          stackPosition="15%"
          scaleEndPosition="8%"
          baseScale={0.9}
          blurAmount={0}
          rotationAmount={-0.5}
          className="max-w-5xl mx-auto mt-16"
        >
          {capabilities.map((cap, idx) => (
            <ScrollStackItem key={idx}>
              <BorderGlow
                backgroundColor="#131313"
                borderRadius={24}
                glowColor="0 0 100"
                glowIntensity={0.9}
                edgeSensitivity={28}
                glowRadius={40}
                colors={['#ffffff', '#8e9192', '#353535']}
                fillOpacity={0.15}
                animated
              >
                <GlareHover
                  width="100%"
                  height="100%"
                  background="transparent"
                  borderRadius="24px"
                  borderColor="transparent"
                  glareColor="#ffffff"
                  glareOpacity={0.12}
                  glareAngle={-45}
                  glareSize={200}
                >
                  <div className="p-8 md:p-12 flex flex-col md:flex-row justify-between items-stretch relative group cursor-pointer overflow-hidden bg-surface-container-low/60 min-h-[320px] md:min-h-[240px] gap-8">
                    {/* Hologram neon glow background */}
                    <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full hologram-glow opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    
                    {/* Left Column: Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-6 pb-3 border-b border-outline-variant/30">
                          <span className="font-code-md text-label-sm text-primary tracking-widest font-bold">{cap.num} //</span>
                          <span className="font-code-md text-[10px] text-surface-variant group-hover:text-primary border border-outline-variant/50 px-3 py-1 transition-colors duration-500 ease-out-expo uppercase">{cap.tag}</span>
                        </div>
                        <h3 className="font-headline-lg text-2xl md:text-3xl text-primary uppercase mb-4 tracking-wider leading-snug group-hover:text-white transition-colors duration-500 ease-out-expo">
                          {cap.title}
                        </h3>
                        <p className="text-sm md:text-base text-on-surface-variant leading-relaxed max-w-xl group-hover:text-on-surface transition-colors duration-500 ease-out-expo">
                          {cap.desc}
                        </p>
                      </div>
                    </div>

                    {/* Right Column: Telemetry Dashboard Panel */}
                    <div className="w-full md:w-80 flex flex-col justify-between bg-surface/50 border border-outline-variant/40 p-6 rounded-xl relative overflow-hidden group-hover:border-primary/30 transition-colors duration-500 ease-out-expo">
                      <div className="absolute inset-0 bg-tech-grid opacity-10" />
                      <div className="relative space-y-4">
                        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                          <span className="text-[10px] font-mono tracking-widest text-surface-variant uppercase">// NODE DIAGNOSTIC</span>
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full cinema-heartbeat"></span>
                        </div>
                        
                        <div className="space-y-3 font-mono text-xs">
                          <div className="flex justify-between">
                            <span className="text-surface-variant uppercase">SYSTEM</span>
                            <span className="text-primary font-bold tracking-wide">{cap.telemetry}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-surface-variant uppercase">PERF_INDEX</span>
                            <span className="text-primary tracking-wide">{cap.metric}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-surface-variant uppercase">ENGINE STATE</span>
                            <span className="text-green-400">READY [0x0F]</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative mt-6 pt-3 border-t border-outline-variant/20 flex justify-between items-center text-[9px] font-mono tracking-widest text-surface-variant">
                        <span>STITCH.COGNITION.v4</span>
                        <span className="text-[10px] text-primary/40 group-hover:text-primary transition-colors duration-500 ease-out-expo">SECURE_LINK //</span>
                      </div>
                    </div>
                  </div>
                </GlareHover>
              </BorderGlow>
            </ScrollStackItem>
          ))}
        </ScrollStack>
      </div>
    </section>
  );
};

export default AIHub;
