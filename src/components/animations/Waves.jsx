import React, { useEffect, useRef } from 'react';

const Waves = ({
  lineColor = 'black',
  backgroundColor = 'transparent',
  waveSpeedX = 0.0125,
  waveSpeedY = 0.005,
  waveAmpX = 32,
  waveAmpY = 16,
  xGap = 10,
  yGap = 32,
  friction = 0.925,
  tension = 0.01,
  maxCursorMove = 120
}) => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    // Responsive resize handler
    const handleResize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : window.innerWidth;
      canvas.height = parent ? parent.clientHeight : window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Mouse events
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Grid of points with spring physics
    let points = [];
    const initPoints = () => {
      points = [];
      const cols = Math.ceil(canvas.width / xGap) + 2;
      const rows = Math.ceil(canvas.height / yGap) + 2;

      for (let r = 0; r < rows; r++) {
        const rowPoints = [];
        for (let c = 0; c < cols; c++) {
          const baseX = (c - 0.5) * xGap;
          const baseY = (r - 0.5) * yGap;
          rowPoints.push({
            baseX,
            baseY,
            x: baseX,
            y: baseY,
            vx: 0,
            vy: 0,
            offsetX: 0,
            offsetY: 0
          });
        }
        points.push(rowPoints);
      }
    };
    initPoints();

    // Reinitialize points when canvas size changes
    const observer = new ResizeObserver(() => {
      handleResize();
      initPoints();
    });
    if (canvas.parentElement) {
      observer.observe(canvas.parentElement);
    }

    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1.2;

      const mouse = mouseRef.current;

      // Update physics for each point
      for (let r = 0; r < points.length; r++) {
        for (let c = 0; c < points[r].length; c++) {
          const p = points[r][c];

          // 1. Natural wave oscillation
          const waveX = Math.sin(time * waveSpeedX + p.baseY * 0.02) * waveAmpX;
          const waveY = Math.cos(time * waveSpeedY + p.baseX * 0.02) * waveAmpY;

          const targetX = p.baseX + waveX;
          const targetY = p.baseY + waveY;

          // 2. Cursor repulsion / attraction
          let targetOffsetX = 0;
          let targetOffsetY = 0;

          if (mouse.active) {
            const dx = p.baseX - mouse.x;
            const dy = p.baseY - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 200 && dist > 0) {
              const forceFactor = (1 - dist / 200) * maxCursorMove;
              targetOffsetX = (dx / dist) * forceFactor;
              targetOffsetY = (dy / dist) * forceFactor;
            }
          }

          // 3. Spring physics: acceleration towards targets
          const ax = (targetOffsetX - p.offsetX) * tension;
          const ay = (targetOffsetY - p.offsetY) * tension;

          p.vx = (p.vx + ax) * friction;
          p.vy = (p.vy + ay) * friction;

          p.offsetX += p.vx;
          p.offsetY += p.vy;

          p.x = targetX + p.offsetX;
          p.y = targetY + p.offsetY;
        }
      }

      // Draw horizontal wave lines
      for (let r = 0; r < points.length; r++) {
        ctx.beginPath();
        const row = points[r];
        if (row.length < 2) continue;

        ctx.moveTo(row[0].x, row[0].y);
        for (let c = 1; c < row.length - 1; c++) {
          const xc = (row[c].x + row[c + 1].x) / 2;
          const yc = (row[c].y + row[c + 1].y) / 2;
          ctx.quadraticCurveTo(row[c].x, row[c].y, xc, yc);
        }
        ctx.lineTo(row[row.length - 1].x, row[row.length - 1].y);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      observer.disconnect();
    };
  }, [
    lineColor,
    backgroundColor,
    waveSpeedX,
    waveSpeedY,
    waveAmpX,
    waveAmpY,
    xGap,
    yGap,
    friction,
    tension,
    maxCursorMove
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'auto',
        zIndex: 0
      }}
    />
  );
};

export default Waves;
