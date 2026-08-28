import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Sparkles,
  Zap,
  Bell,
  MessageSquare,
  Crown,
} from 'lucide-react';
import ClickSpark from '../components/animations/ClickSpark';
import Telemetry from '../components/Telemetry';
import MagicRings from '../components/animations/MagicRings';
import BlurText from '../components/animations/BlurText';
import GlareHover from '../components/animations/GlareHover';
import RotatingText from '../components/animations/RotatingText';
import RequestAccessNavbar from '../components/request-access/RequestAccessNavbar';
import RequestAccessForm from '../components/request-access/RequestAccessForm';
import RequestAccessSuccess from '../components/request-access/RequestAccessSuccess';
import BenefitCard from '../components/request-access/BenefitCard';
import Confetti from '../components/request-access/Confetti';

const BENEFITS = [
  { icon: Sparkles, label: 'Early access to Volviq' },
  { icon: Zap, label: 'Priority feature access' },
  { icon: Bell, label: 'Exclusive beta updates' },
  { icon: MessageSquare, label: 'Direct feedback channel' },
  { icon: Crown, label: 'Founding user status' },
];

export default function RequestAccess() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <ClickSpark sparkColor="#ffffff" sparkSize={12} sparkRadius={22} sparkCount={8} duration={450}>
      <div className="relative min-h-screen overflow-x-hidden bg-tech-grid font-body-md text-on-surface antialiased selection:bg-primary selection:text-surface">
        <Telemetry />
        <Confetti active={submitted} />
        <RequestAccessNavbar />

        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden border-b border-outline-variant bg-surface px-margin-mobile pb-20 pt-32 md:px-margin-desktop md:pt-36">
          <div className="scanline" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-0 bg-tech-grid opacity-10" aria-hidden="true" />

          <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center">
            <motion.div
              className="mb-6 flex items-center gap-2 font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-primary" aria-hidden="true" />
              10 // EARLY ACCESS PROTOCOL
            </motion.div>

            <h1 className="mb-5 max-w-3xl text-center font-display-massive text-[32px] leading-none tracking-tight text-primary sm:text-[44px] md:text-[52px]">
              <BlurText
                text="Join Volviq Early Access !"
                animateBy="words"
                delay={80}
                className="text-primary justify-center"
              />
            </h1>

            <motion.p
              className="mb-12 max-w-2xl text-center font-body-md text-[15px] leading-relaxed text-on-surface-variant sm:text-[17px]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
            >
              Be among the first creators, marketers, developers, and businesses to generate
              professional motion graphics with AI.
            </motion.p>

            <div className="relative flex w-full flex-col items-center gap-12 lg:flex-row lg:items-start lg:justify-center lg:gap-10">
              {/* Benefits — desktop left column */}
              <motion.aside
                className="order-2 w-full max-w-md lg:order-1 lg:max-w-xs lg:pt-8"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
              >
                <h2 className="mb-4 font-label-md text-label-md uppercase tracking-widest text-purple-400/90">
                  What you get
                </h2>
                <ul className="space-y-2.5" aria-label="Early access benefits">
                  {BENEFITS.map((benefit, i) => (
                    <BenefitCard key={benefit.label} icon={benefit.icon} label={benefit.label} index={i} />
                  ))}
                </ul>
              </motion.aside>

              {/* Magic rings + form card */}
              <div
                className="relative order-1 flex w-full max-w-[440px] items-center justify-center lg:order-2"
                style={{ minHeight: '480px' }}
              >
                <div className="pointer-events-none absolute left-0 top-1/2 z-0 hidden h-[480px] w-[360px] -translate-x-[15%] -translate-y-1/2 md:block">
                  <MagicRings
                    color="#a855f7"
                    colorTwo="#7c3aed"
                    ringCount={7}
                    speed={0.75}
                    attenuation={6}
                    lineThickness={2.5}
                    baseRadius={0.24}
                    radiusStep={0.07}
                    scaleRate={0.14}
                    opacity={1}
                    blur={2}
                    noiseAmount={0.04}
                    rotation={-8}
                    ringGap={1.3}
                    fadeIn={0.5}
                    fadeOut={0.7}
                    followMouse
                    mouseInfluence={0.14}
                    hoverScale={1.08}
                    parallax={0.04}
                    clickBurst
                  />
                </div>

                <div className="pointer-events-none absolute right-0 top-1/2 z-0 hidden h-[480px] w-[360px] translate-x-[15%] -translate-y-1/2 md:block">
                  <MagicRings
                    color="#7c3aed"
                    colorTwo="#c084fc"
                    ringCount={7}
                    speed={0.95}
                    attenuation={6}
                    lineThickness={2.5}
                    baseRadius={0.24}
                    radiusStep={0.07}
                    scaleRate={0.14}
                    opacity={1}
                    blur={2}
                    noiseAmount={0.04}
                    rotation={8}
                    ringGap={1.3}
                    fadeIn={0.5}
                    fadeOut={0.7}
                    followMouse
                    mouseInfluence={0.14}
                    hoverScale={1.08}
                    parallax={0.04}
                    clickBurst
                  />
                </div>

                <div className="pointer-events-none absolute inset-0 z-0 md:hidden">
                  <MagicRings
                    color="#a855f7"
                    colorTwo="#c084fc"
                    ringCount={5}
                    speed={0.8}
                    attenuation={7}
                    lineThickness={2}
                    baseRadius={0.3}
                    radiusStep={0.08}
                    scaleRate={0.12}
                    opacity={0.85}
                    blur={1}
                    noiseAmount={0.04}
                    rotation={0}
                    ringGap={1.4}
                    fadeIn={0.6}
                    fadeOut={0.7}
                    followMouse={false}
                    hoverScale={1}
                    parallax={0}
                    clickBurst={false}
                  />
                </div>

                <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
                  <div
                    className="h-[420px] w-[420px] rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }}
                    aria-hidden="true"
                  />
                </div>

                <motion.div
                  className="relative z-20 w-full overflow-hidden border border-outline-variant bg-surface-container-lowest/95 shadow-2xl backdrop-blur-xl"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.65 }}
                  whileHover={{ borderColor: '#a855f7' }}
                  style={{
                    boxShadow:
                      '0 0 60px rgba(168, 85, 247, 0.15), 0 0 120px rgba(168, 85, 247, 0.05)',
                  }}
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
                    <div className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-purple-500/60" aria-hidden="true" />
                    <div className="absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-purple-500/60" aria-hidden="true" />
                    <div className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-purple-500/60" aria-hidden="true" />
                    <div className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-purple-500/60" aria-hidden="true" />

                    <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                      <span className="font-code-md text-[9px] uppercase tracking-wider text-surface-variant">
                        SYS.LINK: {submitted ? 'ACTIVE' : 'STANDBY'}
                      </span>
                      <span className="flex items-center gap-1.5 rounded border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 font-code-md text-[9px] text-purple-400">
                        <span className="h-1 w-1 animate-pulse rounded-full bg-purple-400" aria-hidden="true" />
                        <RotatingText
                          texts={['EARLY_ACCESS', 'SECURE_QUEUE', 'BETA_READY', 'VOLVIQ_ACTIVE']}
                          rotationInterval={2200}
                          splitBy="words"
                          staggerDuration={0.05}
                          mainClassName="font-code-md"
                        />
                      </span>
                    </div>

                    <AnimatePresence mode="wait">
                      {!submitted ? (
                        <div key="form-shell">
                          <div className="mt-5 space-y-1.5 text-left">
                            <h2 className="font-headline-lg text-[18px] uppercase tracking-wider text-primary">
                              Request Access
                            </h2>
                            <p className="font-body-md text-[12px] leading-relaxed text-on-surface-variant">
                              Secure your spot in the Volviq early access program.
                            </p>
                          </div>
                          <RequestAccessForm onSuccess={() => setSubmitted(true)} />
                        </div>
                      ) : (
                        <RequestAccessSuccess />
                      )}
                    </AnimatePresence>
                  </GlareHover>
                </motion.div>
              </div>

              {/* Benefits — mobile below card (duplicate list hidden on lg since left column shows) */}
              <motion.aside
                className="order-3 w-full max-w-md lg:hidden"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h2 className="mb-4 text-center font-label-md text-label-md uppercase tracking-widest text-purple-400/90">
                  What you get
                </h2>
                <ul className="space-y-2.5" aria-label="Early access benefits">
                  {BENEFITS.map((benefit, i) => (
                    <BenefitCard key={`m-${benefit.label}`} icon={benefit.icon} label={benefit.label} index={i} />
                  ))}
                </ul>
              </motion.aside>
            </div>
          </div>
        </section>
      </div>
    </ClickSpark>
  );
}
