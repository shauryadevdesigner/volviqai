import React, { useEffect, useState } from 'react';

const Telemetry = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(d.toISOString().slice(11, 19));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <div className="noise-overlay" aria-hidden="true" />

      <div className="pointer-events-none fixed left-6 top-4 z-40 hidden select-none font-code-md text-code-md leading-relaxed tracking-wider text-surface-variant/60 sm:block">
        SYS.REQ.001 // ACTIVE <br />
        LAT: 34.0522 N // LONG: 118.2437 W <br />
        REF: MONO.TEC.STITCH
      </div>

      <div className="pointer-events-none fixed bottom-4 right-6 z-40 hidden select-none text-right font-code-md text-code-md leading-relaxed tracking-wider text-surface-variant/60 sm:block">
        CLOCK // {time} <br />
        RENDER // ACTIVE <br />
        VER // 9.4.01_R2
      </div>
    </>
  );
};

export default Telemetry;
