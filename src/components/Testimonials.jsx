import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import BlurText from './animations/BlurText';
import GlareHover from './animations/GlareHover';
import './animations/ChromaGrid.css';
import { ease } from '../utils/motionConfig';

const Testimonials = () => {
  const rootRef = useRef(null);
  const fadeRef = useRef(null);
  const setX = useRef(null);
  const setY = useRef(null);
  const pos = useRef({ x: 0, y: 0 });

  const row1 = [
    {
      image: 'https://lh3.googleusercontent.com/aida/ADBb0ugSKHrAfc7ZFMxbh3KcuoGCZVQIYKA47rM0E3lV2gGw8Cn4BNwpLQhU63oanki_4v5YwwtxLThXFJOPEIpsfe9c3t2XIjTlkvimpQZWMCB2yeYv2hnUaKOx8YMwIxf1oJby4s_d8i0ityAKQbCc3ABbntrrbyCBCtjm9OLH4xL43TCJFjuj06v143DGd59_ZbnLkITcVStq356axky5y1GCBbKUWXvlkJ1fKlojG9Dk-4gOQC0QDJJlTGA',
      title: 'Alex Rivera',
      subtitle: 'Full Stack Developer',
      handle: '@alexrivera',
      borderColor: '#ffffff',
      gradient: 'linear-gradient(145deg, #20201f, #000)',
      url: '#'
    },
    {
      image: 'https://lh3.googleusercontent.com/aida/ADBb0ugSKHrAfc7ZFMxbh3KcuoGCZVQIYKA47rM0E3lV2gGw8Cn4BNwpLQhU63oanki_4v5YwwtxLThXFJOPEIpsfe9c3t2XIjTlkvimpQZWMCB2yeYv2hnUaKOx8YMwIxf1oJby4s_d8i0ityAKQbCc3ABbntrrbyCBCtjm9OLH4xL43TCJFjuj06v143DGd59_ZbnLkITcVStq356axky5y1GCBbKUWXvlkJ1fKlojG9Dk-4gOQC0QDJJlTGA',
      title: 'Jordan Chen',
      subtitle: 'DevOps Engineer',
      handle: '@jordanchen',
      borderColor: '#8e9192',
      gradient: 'linear-gradient(210deg, #1c1b1b, #000)',
      url: '#'
    },
    {
      image: 'https://lh3.googleusercontent.com/aida/ADBb0ugSKHrAfc7ZFMxbh3KcuoGCZVQIYKA47rM0E3lV2gGw8Cn4BNwpLQhU63oanki_4v5YwwtxLThXFJOPEIpsfe9c3t2XIjTlkvimpQZWMCB2yeYv2hnUaKOx8YMwIxf1oJby4s_d8i0ityAKQbCc3ABbntrrbyCBCtjm9OLH4xL43TCJFjuj06v143DGd59_ZbnLkITcVStq356axky5y1GCBbKUWXvlkJ1fKlojG9Dk-4gOQC0QDJJlTGA',
      title: 'Morgan Blake',
      subtitle: 'UI/UX Designer',
      handle: '@morganblake',
      borderColor: '#353535',
      gradient: 'linear-gradient(165deg, #2a2a2a, #000)',
      url: '#'
    }
  ];

  const row2 = [
    {
      image: 'https://lh3.googleusercontent.com/aida/ADBb0ugSKHrAfc7ZFMxbh3KcuoGCZVQIYKA47rM0E3lV2gGw8Cn4BNwpLQhU63oanki_4v5YwwtxLThXFJOPEIpsfe9c3t2XIjTlkvimpQZWMCB2yeYv2hnUaKOx8YMwIxf1oJby4s_d8i0ityAKQbCc3ABbntrrbyCBCtjm9OLH4xL43TCJFjuj06v143DGd59_ZbnLkITcVStq356axky5y1GCBbKUWXvlkJ1fKlojG9Dk-4gOQC0QDJJlTGA',
      title: 'Casey Park',
      subtitle: 'Data Scientist',
      handle: '@caseypark',
      borderColor: '#ffffff',
      gradient: 'linear-gradient(195deg, #1c1b1b, #000)',
      url: '#'
    },
    {
      image: 'https://lh3.googleusercontent.com/aida/ADBb0ugSKHrAfc7ZFMxbh3KcuoGCZVQIYKA47rM0E3lV2gGw8Cn4BNwpLQhU63oanki_4v5YwwtxLThXFJOPEIpsfe9c3t2XIjTlkvimpQZWMCB2yeYv2hnUaKOx8YMwIxf1oJby4s_d8i0ityAKQbCc3ABbntrrbyCBCtjm9OLH4xL43TCJFjuj06v143DGd59_ZbnLkITcVStq356axky5y1GCBbKUWXvlkJ1fKlojG9Dk-4gOQC0QDJJlTGA',
      title: 'Sam Kim',
      subtitle: 'Mobile Developer',
      handle: '@thesamkim',
      borderColor: '#8e9192',
      gradient: 'linear-gradient(225deg, #2a2a2a, #000)',
      url: '#'
    },
    {
      image: 'https://lh3.googleusercontent.com/aida/ADBb0ugSKHrAfc7ZFMxbh3KcuoGCZVQIYKA47rM0E3lV2gGw8Cn4BNwpLQhU63oanki_4v5YwwtxLThXFJOPEIpsfe9c3t2XIjTlkvimpQZWMCB2yeYv2hnUaKOx8YMwIxf1oJby4s_d8i0ityAKQbCc3ABbntrrbyCBCtjm9OLH4xL43TCJFjuj06v143DGd59_ZbnLkITcVStq356axky5y1GCBbKUWXvlkJ1fKlojG9Dk-4gOQC0QDJJlTGA',
      title: 'Tyler Rodriguez',
      subtitle: 'Cloud Architect',
      handle: '@tylerrod',
      borderColor: '#353535',
      gradient: 'linear-gradient(135deg, #20201f, #000)',
      url: '#'
    }
  ];

  // Triplicate lists for infinite smooth scrolling loops
  const itemsRow1 = [...row1, ...row1, ...row1, ...row1];
  const itemsRow2 = [...row2, ...row2, ...row2, ...row2];

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setX.current = gsap.quickSetter(el, '--x', 'px');
    setY.current = gsap.quickSetter(el, '--y', 'px');
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);
  }, []);

  const moveTo = (x, y) => {
    gsap.to(pos.current, {
      x,
      y,
      duration: 0.45,
      ease: 'power3.out',
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true
    });
  };

  const handleMove = e => {
    if (!rootRef.current) return;
    const r = rootRef.current.getBoundingClientRect();
    moveTo(e.clientX - r.left, e.clientY - r.top);
    gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
  };

  const handleLeave = () => {
    gsap.to(fadeRef.current, {
      opacity: 1,
      duration: 0.6,
      overwrite: true
    });
  };

  const handleCardMove = e => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <section 
      ref={rootRef}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className="relative py-32 px-margin-mobile md:px-margin-desktop border-b border-outline-variant bg-surface select-none overflow-hidden" 
      id="testimonials"
      style={{
        '--r': '380px'
      }}
    >
      <div className="scanline"></div>

      {/* Header — depth-of-field with stronger hierarchy */}
      <div className="max-w-container-max mx-auto mb-20 text-left flex flex-col md:flex-row md:items-end justify-between relative z-20">
        <motion.div
          className="space-y-6 max-w-xl"
          initial={{ scale: 1.15, opacity: 0, filter: 'blur(10px)' }}
          whileInView={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 1.0, ease: ease.outExpo }}
        >
          <div className="font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
            08 // VALIDATION
          </div>
          <h2 className="font-display-massive text-display-massive text-primary uppercase leading-none tracking-tight">
            <BlurText text="FEEDBACK" animateBy="words" delay={80} className="block text-primary font-display-massive" />
            <BlurText text="VECTORS" animateBy="words" delay={100} className="block text-primary font-display-massive" />
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Spotlight track logs verified across high-performance enterprise media pipelines. Hover cursor to focus illumination.
          </p>
        </motion.div>
        
        {/* Right panel — clip-path wipe entrance */}
        <motion.div
          className="mt-6 md:mt-0 font-code-md text-code-md text-surface-variant text-right border-l border-outline-variant pl-6 select-none"
          initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
          whileInView={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: ease.inOutCubic, delay: 0.4 }}
        >
          SYSTEM: HIGHLY CONNECTED <br />
          INTEGRITY: COMPLIANT
        </motion.div>
      </div>

      {/* Row 1 — enters from left with easeOutExpo */}
      <motion.div
        className="relative flex gap-6 overflow-hidden w-full pb-8 z-10"
        initial={{ x: -200, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 1.2, ease: ease.outExpo }}
      >
        <div className="flex gap-6 animate-marquee-left-to-right whitespace-nowrap min-w-full">
          {itemsRow1.map((c, i) => (
            <article
              key={i}
              className="chroma-card inline-flex flex-shrink-0"
              onMouseMove={handleCardMove}
              style={{
                '--card-border': c.borderColor || 'transparent',
                '--card-gradient': c.gradient
              }}
            >
              <GlareHover
                width="100%"
                height="100%"
                background="transparent"
                borderRadius="12px"
                borderColor="transparent"
                glareColor="#ffffff"
                glareOpacity={0.12}
                glareAngle={-45}
                glareSize={200}
                style={{ display: 'block' }}
              >
                <div className="chroma-img-wrapper">
                  <img src={c.image} alt={c.title} loading="lazy" className="img-mono" />
                </div>
                <footer className="chroma-info text-left">
                  <div>
                    <h3 className="name text-primary font-bold text-sm uppercase">{c.title}</h3>
                    <p className="role text-[11px] text-on-surface-variant mt-0.5">{c.subtitle}</p>
                  </div>
                  {c.handle && <span className="handle text-[10px] text-surface-variant font-mono">{c.handle}</span>}
                </footer>
              </GlareHover>
            </article>
          ))}
        </div>
      </motion.div>

      {/* Row 2 — enters from right (opposing direction) */}
      <motion.div
        className="relative flex gap-6 overflow-hidden w-full pt-4 z-10"
        initial={{ x: 200, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 1.2, ease: ease.outExpo, delay: 0.15 }}
      >
        <div className="flex gap-6 animate-marquee-right-to-left whitespace-nowrap min-w-full">
          {itemsRow2.map((c, i) => (
            <article
              key={i}
              className="chroma-card inline-flex flex-shrink-0"
              onMouseMove={handleCardMove}
              style={{
                '--card-border': c.borderColor || 'transparent',
                '--card-gradient': c.gradient
              }}
            >
              <GlareHover
                width="100%"
                height="100%"
                background="transparent"
                borderRadius="12px"
                borderColor="transparent"
                glareColor="#ffffff"
                glareOpacity={0.12}
                glareAngle={-45}
                glareSize={200}
                style={{ display: 'block' }}
              >
                <div className="chroma-img-wrapper">
                  <img src={c.image} alt={c.title} loading="lazy" className="img-mono" />
                </div>
                <footer className="chroma-info text-left">
                  <div>
                    <h3 className="name text-primary font-bold text-sm uppercase">{c.title}</h3>
                    <p className="role text-[11px] text-on-surface-variant mt-0.5">{c.subtitle}</p>
                  </div>
                  {c.handle && <span className="handle text-[10px] text-surface-variant font-mono">{c.handle}</span>}
                </footer>
              </GlareHover>
            </article>
          ))}
        </div>
      </motion.div>

      {/* Chroma Spotlight overlays */}
      <div className="chroma-overlay" />
      <div ref={fadeRef} className="chroma-fade" />
    </section>
  );
};

export default Testimonials;
