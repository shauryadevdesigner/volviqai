import './HeroAmbient.css';

/**
 * Lightweight CSS-only hero background (replaces heavy WebGL Hyperspeed).
 */
export default function HeroAmbient() {
  return (
    <div className="hero-ambient pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      <div className="hero-ambient__orb hero-ambient__orb--a" />
      <div className="hero-ambient__orb hero-ambient__orb--b" />
      <div className="hero-ambient__grid" />
      <div className="hero-ambient__vignette" />
    </div>
  );
}
