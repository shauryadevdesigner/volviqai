import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import MagicRings from './animations/MagicRings';
import RotatingText from './animations/RotatingText';
import BlurText from './animations/BlurText';
import GlareHover from './animations/GlareHover';

const MagicSignUp = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section className="relative py-44 px-margin-mobile md:px-margin-desktop border-b border-outline-variant bg-surface overflow-hidden flex flex-col items-center justify-center min-h-[85vh]" id="access-portal">
      <div className="scanline"></div>

      {/* Blueprint Grid Markers */}
      <div className="absolute inset-0 bg-tech-grid opacity-10 pointer-events-none" />

      <div className="max-w-5xl w-full mx-auto relative z-10 flex flex-col items-center text-center">
        
        <div className="font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase mb-6 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></span>
          09 // ACCESS PROTOCOL
        </div>

        <h2 className="font-display-massive text-[38px] sm:text-[48px] text-primary uppercase leading-none tracking-tight mb-20">
          <BlurText text="VOLVIQ CORE ACCESS" animateBy="words" delay={100} className="text-primary" />
        </h2>

        {/* Three-Column Layout: Left Rings | Card | Right Rings */}
        <div className="relative w-full flex items-center justify-center" style={{ minHeight: '520px' }}>
          
          {/* LEFT MagicRings - Big, glowing purple */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[420px] h-[520px] -translate-x-[10%] pointer-events-none z-0 hidden md:block">
            <MagicRings
              color="#a855f7"
              colorTwo="#7c3aed"
              ringCount={8}
              speed={0.8}
              attenuation={6}
              lineThickness={2.5}
              baseRadius={0.22}
              radiusStep={0.07}
              scaleRate={0.15}
              opacity={1}
              blur={2}
              noiseAmount={0.04}
              rotation={-10}
              ringGap={1.3}
              fadeIn={0.5}
              fadeOut={0.7}
              followMouse={true}
              mouseInfluence={0.15}
              hoverScale={1.1}
              parallax={0.04}
              clickBurst={true}
            />
          </div>

          {/* RIGHT MagicRings - Big, glowing purple (mirrored) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[420px] h-[520px] translate-x-[10%] pointer-events-none z-0 hidden md:block">
            <MagicRings
              color="#7c3aed"
              colorTwo="#c084fc"
              ringCount={8}
              speed={1.0}
              attenuation={6}
              lineThickness={2.5}
              baseRadius={0.22}
              radiusStep={0.07}
              scaleRate={0.15}
              opacity={1}
              blur={2}
              noiseAmount={0.04}
              rotation={10}
              ringGap={1.3}
              fadeIn={0.5}
              fadeOut={0.7}
              followMouse={true}
              mouseInfluence={0.15}
              hoverScale={1.1}
              parallax={0.04}
              clickBurst={true}
            />
          </div>

          {/* Mobile: Single rings behind card */}
          <div className="absolute inset-0 md:hidden pointer-events-none z-0">
            <MagicRings
              color="#a855f7"
              colorTwo="#c084fc"
              ringCount={6}
              speed={0.8}
              attenuation={7}
              lineThickness={2}
              baseRadius={0.28}
              radiusStep={0.08}
              scaleRate={0.12}
              opacity={0.9}
              blur={1}
              noiseAmount={0.04}
              rotation={0}
              ringGap={1.4}
              fadeIn={0.6}
              fadeOut={0.7}
              followMouse={false}
              hoverScale={1.0}
              parallax={0}
              clickBurst={false}
            />
          </div>

          {/* Purple ambient glow behind card */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <div className="w-[500px] h-[500px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }}></div>
          </div>

          {/* Central Signup Card */}
          <motion.div 
            className="relative z-20 w-full max-w-[400px] border border-outline-variant bg-surface-container-lowest/95 backdrop-blur-xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ borderColor: '#a855f7' }}
            transition={{ duration: 0.6 }}
            style={{ boxShadow: '0 0 60px rgba(168, 85, 247, 0.15), 0 0 120px rgba(168, 85, 247, 0.05)' }}
          >
            <GlareHover
              width="100%"
              height="100%"
              background="transparent"
              borderRadius="0px"
              borderColor="transparent"
              glareColor="#a855f7"
              glareOpacity={0.15}
              glareAngle={-45}
              glareSize={200}
              style={{ display: 'block', padding: '2rem' }}
            >
              {/* Blueprint Corner Accents - Purple */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-purple-500/60"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-purple-500/60"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-purple-500/60"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-purple-500/60"></div>

              <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
                <span className="font-code-md text-[9px] text-surface-variant tracking-wider uppercase">SYS.LINK: STANDBY</span>
                
                <span className="font-code-md text-[9px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></span>
                  <RotatingText
                    texts={['INITIALIZE_CORE', 'SECURE_LINK', 'SANDBOX_READY', 'VOLVIQ_ACTIVE']}
                    rotationInterval={2200}
                    splitBy="words"
                    staggerDuration={0.05}
                    mainClassName="font-code-md"
                  />
                </span>
              </div>

              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form 
                    key="signup-form"
                    onSubmit={handleSubmit}
                    className="space-y-5 mt-6"
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-2">
                      <h3 className="font-headline-lg text-[18px] text-primary uppercase tracking-wider">
                        INITIALIZE PROTOCOL
                      </h3>
                      <p className="font-body-md text-[12px] text-on-surface-variant leading-relaxed">
                        Enter credentials to secure a direct rendering thread allocation and telemetry pipeline hook.
                      </p>
                    </div>

                    <div className="relative">
                      <input 
                        type="email" 
                        required
                        placeholder="ENTER OPERATOR EMAIL"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant px-4 py-3 font-code-md text-[11px] text-primary tracking-widest focus:outline-none focus:border-purple-500 transition-colors uppercase placeholder:text-surface-variant/50"
                      />
                    </div>

                    <motion.button 
                      type="submit"
                      className="w-full group relative py-3.5 bg-primary text-surface font-label-md text-label-md uppercase tracking-widest overflow-hidden border border-primary"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2.5 transition-colors duration-300 group-hover:text-primary">
                        DEPLOY IDENTITY
                        <span className="material-symbols-outlined text-[14px]">
                          fingerprint
                        </span>
                      </span>
                      <span className="absolute inset-0 bg-surface transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                    </motion.button>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="signup-success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-6 space-y-4 mt-6"
                  >
                    <span className="material-symbols-outlined text-purple-400 text-4xl animate-pulse">
                      verified_user
                    </span>
                    <div className="space-y-1.5">
                      <h4 className="font-headline-lg text-[16px] text-primary uppercase tracking-widest">
                        ACCESS PROTOCOL INITIALIZED
                      </h4>
                      <p className="font-code-md text-[10px] text-surface-variant uppercase tracking-wide">
                        OPERATIONAL ENVELOPE ESTABLISHED FOR:<br/>
                        <span className="text-purple-400 select-all">{email}</span>
                      </p>
                    </div>
                    <div className="font-code-md text-[9px] text-purple-400/70 tracking-widest border border-purple-500/20 bg-purple-500/5 p-2 uppercase">
                      SYS_ALLOC: THREAD_0x98A // STATE: PROVISIONED
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlareHover>
          </motion.div>

        </div>

      </div>
    </section>
  );
};

export default MagicSignUp;
