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
            fontSize: "80px",
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
          fontSize: "160px",
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
            fontSize: "64px",
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
                fontSize: "72px",
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
                fontSize: "48px",
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
          fontSize: "48px",
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
          fontSize: "36px",
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
                fontSize: "56px",
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

// ============================================================================
// COMMERCIAL AD PRIMITIVES (V5 Studio Quality)
// ============================================================================

/**
 * 9. KineticHeadline
 * High-impact hero headline with 3D Y-axis character flip, blur clearing,
 * scale overshoot, and optional multi-stop gradient fill.
 */
export const KineticHeadline: React.FC<{
  title: string;
  subtitle?: string;
  heroFont?: string;
  secondaryFont?: string;
  accentColor?: string;
  delay?: number;
  gradientText?: boolean;
}> = ({
  title,
  subtitle,
  heroFont = "Space Grotesk",
  secondaryFont = "Inter",
  accentColor = "#38bdf8",
  delay = 0,
  gradientText = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = title.split(" ");

  const textGradientStyle: React.CSSProperties = gradientText
    ? {
        background: `linear-gradient(135deg, #ffffff 0%, ${accentColor} 55%, #a855f7 100%)`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }
    : { color: "#ffffff" };

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
      <FontLoader fonts={[heroFont, secondaryFont]} />
      <h1
        style={{
          fontFamily: heroFont,
          fontWeight: 900,
          fontSize: "160px",
          lineHeight: 1.05,
          margin: 0,
          letterSpacing: "-0.03em",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0.28em",
          ...textGradientStyle,
        }}
      >
        {words.map((word, wordIdx) => {
          const charOffset = words.slice(0, wordIdx).join("").length + wordIdx;
          return (
            <span key={wordIdx} style={{ display: "inline-flex", overflow: "hidden", perspective: "1000px" }}>
              {[...word].map((char, charIdx) => {
                const charDelay = delay + 4 + (charOffset + charIdx) * 2;
                const charSpring = spring({
                  frame: frame - charDelay,
                  fps,
                  config: { damping: 16, stiffness: 220 },
                });
                const ty = interpolate(charSpring, [0, 1], [90, 0]);
                const rx = interpolate(charSpring, [0, 1], [60, 0]);
                const sc = interpolate(charSpring, [0, 0.6, 1], [0.5, 1.08, 1.0]);
                const blur = interpolate(charSpring, [0, 1], [10, 0]);
                const op = interpolate(charSpring, [0, 0.3, 1], [0, 1, 1]);

                return (
                  <span
                    key={charIdx}
                    style={{
                      display: "inline-block",
                      transform: `translateY(${ty}px) rotateX(${rx}deg) scale(${sc})`,
                      opacity: op,
                      filter: `blur(${blur}px)`,
                    }}
                  >
                    {char}
                  </span>
                );
              })}
            </span>
          );
        })}
      </h1>

      {subtitle && (
        <p
          style={{
            fontFamily: secondaryFont,
            fontWeight: 400,
            fontSize: "64px",
            color: "rgba(248, 250, 252, 0.75)",
            maxWidth: "1800px",
            margin: 0,
            lineHeight: 1.55,
            opacity: interpolate(frame, [delay + 22, delay + 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            transform: `translateY(${interpolate(frame, [delay + 22, delay + 38], [24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
            filter: `blur(${interpolate(frame, [delay + 22, delay + 34], [6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

/**
 * 10. ProductGlassCard
 * Showcase card for product renders, mockups, or hero images with elevated glass effect,
 * glowing animated border, and floating feature pills.
 */
export const ProductGlassCard: React.FC<{
  children: React.ReactNode;
  title?: string;
  badgeText?: string;
  accentColor?: string;
  delay?: number;
  style?: React.CSSProperties;
}> = ({
  children,
  title,
  badgeText,
  accentColor = "#38bdf8",
  delay = 10,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardSpring = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 120 },
  });

  const scale = interpolate(cardSpring, [0, 0.7, 1], [0.85, 1.04, 1.0]);
  const opacity = interpolate(cardSpring, [0, 1], [0, 1]);
  const translateY = interpolate(cardSpring, [0, 1], [50, 0]);
  const floatY = Math.sin(frame * 0.03) * 6;

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.04)",
        backdropFilter: "blur(24px) saturate(200%)",
        WebkitBackdropFilter: "blur(24px) saturate(200%)",
        border: `1px solid rgba(255, 255, 255, 0.12)`,
        borderRadius: BORDER_RADIUS.xl,
        boxShadow: `0 24px 64px rgba(0, 0, 0, 0.45), 0 0 60px ${accentColor}33, inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
        padding: SPACING.md,
        opacity,
        transform: `scale(${scale}) translateY(${translateY + floatY}px)`,
        position: "relative",
        overflow: "hidden",
        zIndex: 10,
        ...style,
      }}
    >
      {badgeText && (
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            background: `linear-gradient(135deg, ${accentColor} 0%, rgba(168,85,247,0.9) 100%)`,
            color: "#ffffff",
            padding: "8px 20px",
            borderRadius: 9999,
            fontSize: "32px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            boxShadow: `0 0 20px ${accentColor}66`,
            zIndex: 20,
          }}
        >
          {badgeText}
        </div>
      )}

      {title && (
        <div
          style={{
            fontSize: "56px",
            fontWeight: 800,
            color: "#ffffff",
            marginBottom: SPACING.xs,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </div>
      )}

      {children}
    </div>
  );
};

/**
 * 11. AdHookBanner
 * Animated hook tag / category badge with neon glow borders.
 */
export const AdHookBanner: React.FC<{
  text: string;
  accentColor?: string;
  delay?: number;
}> = ({ text, accentColor = "#38bdf8", delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bannerSpring = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 180 },
  });

  const translateY = interpolate(bannerSpring, [0, 1], [-30, 0]);
  const opacity = interpolate(bannerSpring, [0, 1], [0, 1]);
  const glowPulse = 0.4 + Math.sin(frame * 0.08) * 0.2;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 32px",
        borderRadius: 9999,
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(16px)",
        border: `1px solid ${accentColor}88`,
        boxShadow: `0 0 30px ${accentColor}${Math.round(glowPulse * 255).toString(16).padStart(2, "0")}`,
        opacity,
        transform: `translateY(${translateY}px)`,
        zIndex: 15,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          backgroundColor: accentColor,
          boxShadow: `0 0 12px ${accentColor}`,
        }}
      />
      <span
        style={{
          fontSize: "36px",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#ffffff",
        }}
      >
        {text}
      </span>
    </div>
  );
};

/**
 * 12. AdCTAButton
 * High-conversion action button with shine sweep overlay and pulsing urgency.
 */
export const AdCTAButton: React.FC<{
  label: string;
  accentColor?: string;
  textColor?: string;
  delay?: number;
}> = ({ label, accentColor = "#ff3366", textColor = "#ffffff", delay = 30 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const btnSpring = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 200 },
  });

  const scaleEntrance = interpolate(btnSpring, [0, 0.7, 1], [0.6, 1.08, 1.0]);
  const opacity = interpolate(btnSpring, [0, 1], [0, 1]);
  const pulse = 1 + Math.sin((frame - delay) * 0.09) * 0.035;
  const finalScale = scaleEntrance * (frame > delay ? pulse : 1);

  const sweepX = ((frame - delay) * 2) % 220 - 60;

  return (
    <div
      style={{
        zIndex: 20,
        position: "relative",
        opacity,
        transform: `scale(${finalScale})`,
      }}
    >
      <button
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          fontSize: "52px",
          letterSpacing: "0.06em",
          color: textColor,
          background: `linear-gradient(135deg, ${accentColor} 0%, #ff6b35 100%)`,
          border: "none",
          borderRadius: BORDER_RADIUS.xl,
          padding: "26px 76px",
          cursor: "pointer",
          boxShadow: `0 12px 40px ${accentColor}66, 0 0 0 1px rgba(255,255,255,0.2)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {label}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: "60px",
            left: sweepX,
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
            transform: "skewX(-20deg)",
            pointerEvents: "none",
          }}
        />
      </button>
    </div>
  );
};

/**
 * 13. UrgencyTimer
 * Animated countdown component (`{timeLeft}s LEFT`) with pulsing text glow for ad final beats.
 */
export const UrgencyTimer: React.FC<{
  startSeconds?: number;
  delay?: number;
  accentColor?: string;
}> = ({ startSeconds = 15, delay = 0, accentColor = "#ff3366" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const elapsedSec = Math.floor(frame / fps);
  const timeLeft = Math.max(1, startSeconds - elapsedSec);

  const pulse = 1 + Math.sin(frame * 0.15) * 0.06;
  const opacity = interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        transform: `scale(${pulse})`,
        opacity,
        zIndex: 20,
      }}
    >
      <span
        style={{
          fontFamily: "Space Grotesk, sans-serif",
          fontSize: "56px",
          fontWeight: 900,
          color: accentColor,
          letterSpacing: "-0.02em",
          textShadow: `0 0 24px ${accentColor}aa`,
        }}
      >
        ⚡ LIMITED TIME: {timeLeft}s REMAINING
      </span>
    </div>
  );
};

/**
 * 14. CinematicScene
 * Full-screen cinematic scene container with depth layers
 */
export const CinematicScene: React.FC<{
  children: React.ReactNode;
  bgColor?: string;
  delay?: number;
}> = ({ children, bgColor = "#0b0f19", delay = 0 }) => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(frame, [delay, delay + 20], [0, 1], { 
    extrapolateLeft: "clamp", 
    extrapolateRight: "clamp" 
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        opacity,
        zIndex: 5,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * 15. TextReveal
 * Text reveal animation with mask effect
 */
export const TextReveal: React.FC<{
  text: string;
  fontSize?: number;
  delay?: number;
  color?: string;
}> = ({ text, fontSize = 48, delay = 0, color = "#ffffff" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const revealSpring = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 140 },
  });

  const revealProgress = interpolate(revealSpring, [0, 1], [0, 100]);

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        display: "inline-block",
      }}
    >
      <span
        style={{
          fontSize: `${fontSize}px`,
          fontWeight: 700,
          color,
          display: "block",
        }}
      >
        {text}
      </span>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: `${100 - revealProgress}%`,
          bottom: 0,
          backgroundColor: color,
          mixBlendMode: "difference",
        }}
      />
    </div>
  );
};

/**
 * 16. LightBeam
 * Animated light beam effect
 */
export const LightBeam: React.FC<{
  color?: string;
  angle?: number;
  delay?: number;
}> = ({ color = "#38bdf8", angle = 45, delay = 0 }) => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(frame, [delay, delay + 30], [0, 0.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(${angle}deg, transparent 0%, ${color} 50%, transparent 100%)`,
        opacity,
        mixBlendMode: "screen",
        pointerEvents: "none",
        zIndex: 2,
      }}
    />
  );
};

/**
 * 17. MorphShape
 * Morphing shape animation
 */
export const MorphShape: React.FC<{
  color?: string;
  size?: number;
  delay?: number;
}> = ({ color = "#38bdf8", size = 200, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const morphSpring = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  const scale = interpolate(morphSpring, [0, 1], [0, 1]);
  const rotation = (frame - delay) * 0.5;

  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "30%",
        backgroundColor: color,
        opacity: 0.2,
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        filter: "blur(60px)",
        zIndex: 1,
      }}
    />
  );
};

/**
 * 18. RivePlayer
 * Rive animation player component
 */
export const RivePlayer: React.FC<{
  src: string;
  artboard?: string;
  animations?: string[];
  fit?: "contain" | "cover" | "fill" | "fitWidth" | "fitHeight";
  alignment?: "center" | "topLeft" | "topCenter" | "topRight" | "centerLeft" | "centerRight" | "bottomLeft" | "bottomCenter" | "bottomRight";
  style?: React.CSSProperties;
}> = ({ src, artboard, animations, fit = "contain", alignment = "center", style }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      <div style={{ fontSize: "24px", color: "#888" }}>
        Rive Animation: {src}
      </div>
    </div>
  );
};

/**
 * 19. RiveLoader
 * Rive animation loader with fallback
 */
export const RiveLoader: React.FC<{
  src: string;
  fallback?: React.ReactNode;
  children: (resolvedSrc: string) => React.ReactNode;
}> = ({ src, fallback, children }) => {
  return <>{children(src)}</>;
};

/**
 * 20. MotionWrapper
 * Motion animation wrapper for various entrance effects
 */
export const MotionWrapper: React.FC<{
  children: React.ReactNode;
  animationType: "scale-in" | "fade-up" | "fade-down" | "fade-left" | "fade-right" | "blur-in" | "drift-parallax" | "breathing-idle" | "none";
  delay?: number;
  duration?: number;
}> = ({ children, animationType, delay = 0, duration = 30 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const animSpring = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 140 },
  });

  let transform = "";
  let opacity = 1;
  let filter = "";

  switch (animationType) {
    case "scale-in":
      const scale = interpolate(animSpring, [0, 1], [0.8, 1]);
      transform = `scale(${scale})`;
      opacity = interpolate(animSpring, [0, 1], [0, 1]);
      break;
    case "fade-up":
      const translateY = interpolate(animSpring, [0, 1], [30, 0]);
      transform = `translateY(${translateY}px)`;
      opacity = interpolate(animSpring, [0, 1], [0, 1]);
      break;
    case "fade-down":
      const translateYDown = interpolate(animSpring, [0, 1], [-30, 0]);
      transform = `translateY(${translateYDown}px)`;
      opacity = interpolate(animSpring, [0, 1], [0, 1]);
      break;
    case "fade-left":
      const translateXLeft = interpolate(animSpring, [0, 1], [30, 0]);
      transform = `translateX(${translateXLeft}px)`;
      opacity = interpolate(animSpring, [0, 1], [0, 1]);
      break;
    case "fade-right":
      const translateXRight = interpolate(animSpring, [0, 1], [-30, 0]);
      transform = `translateX(${translateXRight}px)`;
      opacity = interpolate(animSpring, [0, 1], [0, 1]);
      break;
    case "blur-in":
      const blur = interpolate(animSpring, [0, 1], [10, 0]);
      filter = `blur(${blur}px)`;
      opacity = interpolate(animSpring, [0, 1], [0, 1]);
      break;
    case "drift-parallax":
      const drift = Math.sin((frame - delay) * 0.02) * 5;
      transform = `translateY(${drift}px)`;
      break;
    case "breathing-idle":
      const breathe = 1 + Math.sin((frame - delay) * 0.05) * 0.02;
      transform = `scale(${breathe})`;
      break;
    case "none":
    default:
      break;
  }

  return (
    <div
      style={{
        transform,
        opacity,
        filter,
      }}
    >
      {children}
    </div>
  );
};

