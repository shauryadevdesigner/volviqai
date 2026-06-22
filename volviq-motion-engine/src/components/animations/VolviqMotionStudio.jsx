import { useEffect, useRef } from 'react';
import { useInView } from '../../hooks/useInView';
import './VolviqMotionStudio.css';

const STEPS = ['Brief', 'Storyboard', 'Motion', 'Export'];

/**
 * Lightweight canvas motion graphic — Volviq pipeline demo (GPU-friendly 2D).
 */
export default function VolviqMotionStudio({ className = '' }) {
  const canvasRef = useRef(null);
  const { ref, inView } = useInView({ rootMargin: '80px' });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !inView) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let frameId = 0;
    let start = performance.now();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(rect.width, 320);
      const h = Math.max(rect.height, 280);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const roundRect = (x, y, w, h, r) => {
      if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        return;
      }
      ctx.beginPath();
      ctx.rect(x, y, w, h);
    };

    const draw = (now) => {
      frameId = requestAnimationFrame(draw);
      const t = (now - start) / 1000;

      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      // Frame chrome
      const pad = 16;
      const frameX = pad;
      const frameY = pad + 28;
      const frameW = w - pad * 2;
      const frameH = h - frameY - pad - 36;

      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      ctx.strokeRect(frameX, frameY, frameW, frameH);

      // Corner accents
      const cs = 10;
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)';
      [[frameX, frameY], [frameX + frameW, frameY], [frameX, frameY + frameH], [frameX + frameW, frameY + frameH]].forEach(
        ([cx, cy], i) => {
          ctx.beginPath();
          if (i === 0) {
            ctx.moveTo(cx, cy + cs);
            ctx.lineTo(cx, cy);
            ctx.lineTo(cx + cs, cy);
          } else if (i === 1) {
            ctx.moveTo(cx - cs, cy);
            ctx.lineTo(cx, cy);
            ctx.lineTo(cx, cy + cs);
          } else if (i === 2) {
            ctx.moveTo(cx, cy - cs);
            ctx.lineTo(cx, cy);
            ctx.lineTo(cx + cs, cy);
          } else {
            ctx.moveTo(cx - cs, cy);
            ctx.lineTo(cx, cy);
            ctx.lineTo(cx, cy - cs);
          }
          ctx.stroke();
        },
      );

      // Animated "video" content inside frame
      const phase = (Math.sin(t * 0.7) + 1) / 2;
      const grad = ctx.createLinearGradient(frameX, frameY, frameX + frameW, frameY + frameH);
      grad.addColorStop(0, `rgba(124, 58, 237, ${0.25 + phase * 0.15})`);
      grad.addColorStop(0.5, `rgba(168, 85, 247, ${0.35 + phase * 0.2})`);
      grad.addColorStop(1, `rgba(59, 130, 246, ${0.2 + phase * 0.1})`);
      ctx.fillStyle = grad;
      ctx.fillRect(frameX + 1, frameY + 1, frameW - 2, frameH - 2);

      // Kinetic shapes
      for (let i = 0; i < 5; i++) {
        const px = frameX + frameW * (0.15 + i * 0.17 + Math.sin(t * 1.2 + i) * 0.03);
        const py = frameY + frameH * (0.35 + Math.cos(t * 0.9 + i * 1.3) * 0.12);
        const size = 18 + Math.sin(t * 2 + i) * 6;
        ctx.fillStyle = `rgba(255,255,255,${0.08 + i * 0.04})`;
        roundRect(px - size / 2, py - size / 4, size, size / 2, 4);
        ctx.fill();
      }

      // Playhead / timeline
      const timelineY = frameY + frameH + 14;
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(frameX, timelineY, frameW, 4);
      const progress = (t * 0.12) % 1;
      const headX = frameX + frameW * progress;
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(frameX, timelineY, headX - frameX, 4);
      ctx.beginPath();
      ctx.arc(headX, timelineY + 2, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      // Top HUD
      ctx.font = '600 10px Sora, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillText('VOLVIQ // MOTION_ENGINE', frameX, pad + 14);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#22c55e';
      ctx.fillText('● RENDERING', frameX + frameW, pad + 14);
      ctx.textAlign = 'left';

      // Step pills
      const stepIndex = Math.floor((t * 0.35) % STEPS.length);
      const pillW = frameW / STEPS.length - 6;
      STEPS.forEach((label, i) => {
        const px = frameX + i * (pillW + 6);
        const py = h - pad - 18;
        const active = i === stepIndex;
        ctx.fillStyle = active ? 'rgba(168, 85, 247, 0.35)' : 'rgba(255,255,255,0.06)';
        ctx.strokeStyle = active ? 'rgba(168, 85, 247, 0.8)' : 'rgba(255,255,255,0.1)';
        roundRect(px, py, pillW, 18, 4);
        ctx.fill();
        ctx.stroke();
        ctx.font = '500 9px Sora, sans-serif';
        ctx.fillStyle = active ? '#fff' : 'rgba(255,255,255,0.45)';
        ctx.textAlign = 'center';
        ctx.fillText(label.toUpperCase(), px + pillW / 2, py + 12);
        ctx.textAlign = 'left';
      });

      // Floating metric chip
      const chipW = 108;
      const chipH = 42;
      const chipX = frameX + frameW - chipW - 12 + Math.sin(t * 1.1) * 4;
      const chipY = frameY + 16 + Math.cos(t * 0.85) * 3;
      ctx.fillStyle = 'rgba(14, 14, 14, 0.75)';
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
      roundRect(chipX, chipY, chipW, chipH, 6);
      ctx.fill();
      ctx.stroke();
      ctx.font = '500 8px Sora, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText('QUALITY SCORE', chipX + 10, chipY + 14);
      ctx.font = '700 16px Sora, sans-serif';
      ctx.fillStyle = '#c084fc';
      const score = (94 + Math.sin(t * 1.5) * 3).toFixed(1);
      ctx.fillText(`${score}%`, chipX + 10, chipY + 32);
    };

    frameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
    };
  }, [inView]);

  return (
    <div ref={ref} className={`volviq-motion-studio ${className}`}>
      <canvas ref={canvasRef} className="volviq-motion-studio__canvas" aria-label="Volviq motion graphics preview animation" />
      {!inView && <div className="volviq-motion-studio__placeholder" aria-hidden="true" />}
    </div>
  );
}
