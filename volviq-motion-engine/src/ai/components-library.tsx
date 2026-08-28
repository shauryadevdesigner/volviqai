import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring
} from "remotion";
import { SPACING, BORDER_RADIUS, SHADOWS, BLURS, SPRINGS } from "./design-tokens";

// Utility to inject Google Fonts
const FontLoader: React.FC<{ fonts: string[] }> = ({ fonts }) => {
  const uniqueFonts = Array.from(new Set(fonts.filter(Boolean)));
  if (uniqueFonts.length === 0) return null;
  const fontImports = uniqueFonts
    .map(f => `family=${f.replace(/\s+/g, "+")}:wght@300;400;500;600;700;800`)
    .join("&");
  return (
    <style>{`@import url('https://fonts.googleapis.com/css2?${fontImports}&display=swap');`}</style>
  );
};

/**
 * 1. GradientBackground
 * Layered background with slow-drifting atmospheric radial glow circles.
 */
export const GradientBackground: React.FC<{
  bg?: string;
  glow?: string;
  accent?: string;
}> = ({ bg = "#0b0f19", glow = "#0ea5e9", accent = "#38bdf8" }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Slow orbital drift values
  const x1 = Math.sin(frame * 0.015) * (width * 0.15);
  const y1 = Math.cos(frame * 0.01) * (height * 0.15);
  const x2 = Math.cos(frame * 0.02) * (width * 0.2);
  const y2 = Math.sin(frame * 0.015) * (height * 0.2);

  return (
    <AbsoluteFill style={{ backgroundColor: bg, overflow: "hidden", zIndex: 0 }}>
      {/* Glow Shape 1 */}
      <div
        style={{
          position: "absolute",
          width: width * 0.7,
          height: width * 0.7,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${glow} 0%, rgba(0,0,0,0) 70%)`,
          transform: `translate(${width * 0.1 + x1}px, ${height * 0.1 + y1}px)`,
          filter: "blur(100px)",
          opacity: 0.25,
          mixBlendMode: "screen",
        }}
      />
      {/* Glow Shape 2 */}
      <div
        style={{
          position: "absolute",
          width: width * 0.6,
          height: width * 0.6,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent} 0%, rgba(0,0,0,0) 70%)`,
          transform: `translate(${width * 0.4 + x2}px, ${height * 0.3 + y2}px)`,
          filter: "blur(120px)",
          opacity: 0.2,
          mixBlendMode: "screen",
        }}
      />
      {/* Dark Vignette Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle, transparent 40%, rgba(0, 0, 0, 0.6) 100%)",
          zIndex: 1,
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * 2. HeroHeadline
 * Cinematic header with overflow-hidden word slide-up reveal.
 */
export const HeroHeadline: React.FC<{
  title: string;
  subtitle?: string;
  accentText?: string;
  heroFont?: string;
  secondaryFont?: string;
  accentFont?: string;
  colorPalette?: { text?: string; accent?: string };
  delay?: number;
}> = ({
  title,
  subtitle,
  accentText,
  heroFont = "Space Grotesk",
  secondaryFont = "Inter",
  accentFont = "Playfair Display",
  colorPalette = { text: "#f8fafc", accent: "#38bdf8" },
  delay = 0
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Split title into words for staggered slide-up
  const words = title.split(" ");
  
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: SPACING.sm,
        zIndex: 10,
        position: "relative",
      }}
    >
      <FontLoader fonts={[heroFont, secondaryFont, accentFont]} />

      {/* Optional Accent Category Text */}
      {accentText && (
        <div
          style={{
            fontFamily: accentFont,
            fontStyle: "italic",
            fontSize: "64px",
            color: colorPalette.accent,
            opacity: interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            transform: `translateY(${interpolate(frame, [delay, delay + 15], [15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
            marginBottom: -8,
          }}
        >
          {accentText}
        </div>
      )}

      {/* Main Kinetic Headline */}
      <h1
        style={{
          fontFamily: heroFont,
          fontWeight: 800,
          fontSize: "140px",
          lineHeight: 1.1,
          color: colorPalette.text,
          margin: 0,
          letterSpacing: "-0.03em",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0.25em",
        }}
       h1-id="hero-title"
      >
        {words.map((word, idx) => {
          const wordDelay = delay + 5 + idx * 4;
          const wordSpring = spring({
            frame: frame - wordDelay,
            fps,
            config: SPRINGS.editorial,
          });
          const translateY = interpolate(wordSpring, [0, 1], [100, 0]);
          const opacity = interpolate(wordSpring, [0, 1], [0, 1]);

          return (
            <span
              key={idx}
              style={{
                display: "inline-block",
                overflow: "hidden",
                height: "1.25em",
                verticalAlign: "bottom",
                paddingBottom: "0.1em",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  transform: `translateY(${translateY}%)`,
                  opacity,
                }}
              >
                {word}
              </span>
            </span>
          );
        })}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p
          style={{
            fontFamily: secondaryFont,
            fontWeight: 400,
            fontSize: "52px",
            color: "rgba(248, 250, 252, 0.7)",
            maxWidth: "1800px",
            margin: 0,
            lineHeight: 1.5,
            opacity: interpolate(frame, [delay + 18, delay + 33], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            transform: `translateY(${interpolate(frame, [delay + 18, delay + 33], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

/**
 * 3. GlassCard
 * Translucent premium glassmorphism card container.
 */
export const GlassCard: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  delay?: number;
}> = ({ children, style, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardSpring = spring({
    frame: frame - delay,
    fps,
    config: SPRINGS.luxury,
  });

  const scale = interpolate(cardSpring, [0, 1], [0.95, 1]);
  const opacity = interpolate(cardSpring, [0, 1], [0, 1]);
  const translateY = interpolate(cardSpring, [0, 1], [30, 0]);

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: BLURS.glass,
        WebkitBackdropFilter: BLURS.glass,
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: BORDER_RADIUS.lg,
        boxShadow: SHADOWS.strong,
        padding: SPACING.md,
        opacity,
        transform: `scale(${scale}) translateY(${translateY}px)`,
        transition: "border-color 0.3s ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * 4. FeatureGrid
 * Staggered entry grid layout for display features.
 */
export const FeatureGrid: React.FC<{
  items: Array<{ title: string; desc: string; icon?: string }>;
  heroFont?: string;
  secondaryFont?: string;
  delay?: number;
}> = ({ items, heroFont = "Space Grotesk", secondaryFont = "Inter", delay = 10 }) => {

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, 1fr)`,
        gap: SPACING.md,
        width: "90%",
        maxWidth: "2400px",
        zIndex: 10,
        position: "relative",
      }}
    >
      <FontLoader fonts={[heroFont, secondaryFont]} />
      {items.map((item, idx) => {
        const itemDelay = delay + idx * 8;
        return (
          <GlassCard
            key={idx}
            delay={itemDelay}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              textAlign: "left",
              padding: "48px",
            }}
          >
            <div
              style={{
                fontFamily: heroFont,
                fontWeight: 700,
                fontSize: "56px",
                color: "#f8fafc",
                marginBottom: SPACING.xs,
              }}
            >
              {item.title}
            </div>
            <div
              style={{
                fontFamily: secondaryFont,
                fontWeight: 400,
                fontSize: "36px",
                color: "rgba(248, 250, 252, 0.6)",
                lineHeight: 1.5,
              }}
            >
              {item.desc}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
};

/**
 * 5. PremiumCTA
 * Magnetic CTA button with reflective hover sweeps and continuous pulsing.
 */
export const PremiumCTA: React.FC<{
  label: string;
  secondaryFont?: string;
  colorPalette?: { accent?: string; text?: string; bg?: string };
  delay?: number;
}> = ({
  label,
  secondaryFont = "Inter",
  colorPalette = { accent: "#38bdf8", text: "#0b0f19" },
  delay = 25
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const enterSpring = spring({
    frame: frame - delay,
    fps,
    config: SPRINGS.startup,
  });

  const opacity = interpolate(enterSpring, [0, 1], [0, 1]);
  const scaleEntrance = interpolate(enterSpring, [0, 1], [0.8, 1]);

  // Gentle breathing/pulse continuous animation
  const pulseScale = 1 + Math.sin((frame - delay) * 0.08) * 0.025;
  const finalScale = scaleEntrance * (frame > delay ? pulseScale : 1);

  // Reflection shine sweep position
  const shineTranslate = interpolate(
    (frame - delay) % 90,
    [0, 20],
    [-150, 150],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        zIndex: 10,
        position: "relative",
        opacity,
        transform: `scale(${finalScale})`,
      }}
    >
      <FontLoader fonts={[secondaryFont]} />
      <button
        style={{
          fontFamily: secondaryFont,
          fontWeight: 700,
          fontSize: "38px",
          letterSpacing: "0.08em",
          color: colorPalette.text,
          backgroundColor: colorPalette.accent,
          border: "none",
          borderRadius: BORDER_RADIUS.lg,
          padding: "24px 72px",
          cursor: "pointer",
          boxShadow: `0 8px 32px rgba(${colorPalette.accent === "#38bdf8" ? "56, 189, 248" : "212, 175, 55"}, 0.4)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {label}
        {/* Shine Sweep Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: "50px",
            background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)",
            transform: `skewX(-25deg) translateX(${shineTranslate}px)`,
            pointerEvents: "none",
          }}
        />
      </button>
    </div>
  );
};

/**
 * 6. KineticText
 * Dynamic word swapper/rotator with soft fade & blur transitions.
 */
export const KineticText: React.FC<{
  phrases: string[];
  heroFont?: string;
  accent?: string;
  intervalFrames?: number;
}> = ({ phrases, heroFont = "Space Grotesk", accent = "#38bdf8", intervalFrames = 45 }) => {
  const frame = useCurrentFrame();
  const activeIdx = Math.floor(frame / intervalFrames) % phrases.length;
  const localFrame = frame % intervalFrames;

  // Transition animations
  const introSpring = spring({
    frame: localFrame,
    fps: 30,
    config: { damping: 12, stiffness: 150 },
  });

  const opacity = interpolate(localFrame, [0, 8, intervalFrames - 6, intervalFrames], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(introSpring, [0, 1], [15, 0]);
  const blur = interpolate(localFrame, [0, 6, intervalFrames - 5, intervalFrames], [6, 0, 0, 4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <span
      style={{
        fontFamily: heroFont,
        fontWeight: 800,
        color: accent,
        display: "inline-block",
        transform: `translateY(${translateY}px)`,
        opacity,
        filter: `blur(${blur}px)`,
      }}
    >
      <FontLoader fonts={[heroFont]} />
      {phrases[activeIdx]}
    </span>
  );
};

/**
 * 7. AnimatedNumber
 * Counting layout with precise spring interpolation.
 */
export const AnimatedNumber: React.FC<{
  value: number;
  suffix?: string;
  heroFont?: string;
  delay?: number;
}> = ({ value, suffix = "", heroFont = "Space Grotesk", delay = 10 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const numSpring = spring({
    frame: frame - delay,
    fps,
    config: SPRINGS.luxury,
  });

  const currentVal = Math.round(interpolate(numSpring, [0, 1], [0, value]));

  return (
    <span style={{ fontFamily: heroFont, fontWeight: 800 }}>
      <FontLoader fonts={[heroFont]} />
      {currentVal}
      {suffix}
    </span>
  );
};

/**
 * 8. LogoWall
 * Loop scrolling brand wall.
 */
export const LogoWall: React.FC<{
  logos: string[];
  secondaryFont?: string;
  delay?: number;
}> = ({ logos, secondaryFont = "Inter", delay = 15 }) => {
  const frame = useCurrentFrame();

  // Scroll position looping across width
  const scrollOffset = (frame * 1.5) % (logos.length * 200);

  return (
    <div
      style={{
        width: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: SPACING.sm,
        opacity: interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        zIndex: 10,
        position: "relative",
      }}
    >
      <FontLoader fonts={[secondaryFont]} />
      <div
        style={{
          fontFamily: secondaryFont,
          fontSize: "28px",
          fontWeight: 600,
          letterSpacing: "0.15em",
          color: "rgba(248, 250, 252, 0.4)",
          textTransform: "uppercase",
          textAlign: "center",
          marginBottom: 12,
        }}
      >
        Trusted by industry leaders
      </div>
      <div
        style={{
          display: "flex",
          width: "100%",
          position: "relative",
          maskImage: "linear-gradient(90deg, transparent, white 20%, white 80%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, white 20%, white 80%, transparent)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "120px",
            transform: `translateX(-${scrollOffset}px)`,
            whiteSpace: "nowrap",
          }}
        >
          {/* Render triple array list to ensure seamless endless carousel wrap */}
          {[...logos, ...logos, ...logos].map((logo, idx) => (
            <div
              key={idx}
              style={{
                fontFamily: secondaryFont,
                fontWeight: 600,
                fontSize: "44px",
                color: "rgba(248, 250, 252, 0.6)",
                display: "inline-block",
                width: "240px",
                textAlign: "center",
              }}
            >
              {logo}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
