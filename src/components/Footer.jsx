import React from 'react';
import { motion } from 'motion/react';
import { ease, spring } from '../utils/motionConfig';

const Footer = () => {
  const links = ['Documentation', 'Privacy', 'Protocol', 'Security'];

  return (
    <footer className="w-full max-w-container-max mx-auto px-margin-desktop py-24 flex flex-col items-start gap-12 border-t border-outline-variant bg-surface relative z-10">

      {/* Brand Signature — character-by-character reveal feel */}
      <motion.div
        className="font-headline-xl text-headline-xl font-bold tracking-tighter text-primary transition-all duration-500 ease-out-expo hover:tracking-widest cursor-pointer select-none"
        initial={{ opacity: 0, x: -30, filter: 'blur(8px)' }}
        whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
        viewport={{ once: true }}
        transition={{ duration: 1.0, ease: ease.outExpo }}
      >
        VOLVIQ AI
      </motion.div>

      {/* Links & Copyright */}
      <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-8">

        {/* Navigation links — staggered entrance from bottom */}
        <motion.div
          className="flex gap-8 opacity-80 hover:opacity-100 transition-opacity duration-500 flex-wrap text-left"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.08, delayChildren: 0.3 },
            },
          }}
        >
          {links.map((link) => (
            <motion.a
              key={link}
              className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary underline transition-all duration-500 ease-out-expo"
              href="#"
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: ease.outExpo } },
              }}
            >
              {link}
            </motion.a>
          ))}
        </motion.div>

        {/* Operating status — heartbeat indicator */}
        <motion.div
          className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-2 select-none"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: ease.outExpo, delay: 0.5 }}
        >
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full cinema-heartbeat"></span>
          © 2026 VOLVIQ AI. ALL SYSTEMS OPERATIONAL.
        </motion.div>

      </div>
    </footer>
  );
};

export default Footer;
