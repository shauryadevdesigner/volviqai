// ============================================================================
// Block Sanitizer — Removes visible card/box containers from generated code
// ============================================================================
// Keeps small background particles and large glow orbs intact.
// Strips bordered/rgba boxes that wrap text content (stat cards, glass panels).
// ============================================================================

function isBackgroundParticle(styles: string): boolean {
  const width = styles.match(/width:\s*(\d+(?:\.\d+)?)/)?.[1];
  const height = styles.match(/height:\s*(\d+(?:\.\d+)?)/)?.[1];
  if (width && height) {
    const w = parseFloat(width);
    const h = parseFloat(height);
    if (w <= 24 && h <= 24) return true;
    if (w >= 200 && h >= 200 && styles.includes("blur(")) return true;
  }
  if (styles.includes('borderRadius: "50%"') && styles.includes("position:") && !styles.includes("padding:")) {
    return true;
  }
  return false;
}

function looksLikeContentCardBox(styles: string): boolean {
  if (isBackgroundParticle(styles)) return false;

  const hasRgbaBg = /background:\s*(?:"rgba\(|`rgba\()/i.test(styles);
  const hasSolidBg = /background:\s*"#[0-9a-fA-F]{3,8}"/i.test(styles);
  const hasBorder = /border:\s/i.test(styles);
  const hasRadius = /borderRadius:\s/i.test(styles);
  const hasPadding = /padding:\s/i.test(styles);
  const hasBackdrop = styles.includes("backdropFilter") || styles.includes("WebkitBackdropFilter");

  if (hasBackdrop && (hasBorder || hasRadius)) return true;
  if ((hasRgbaBg || hasSolidBg) && hasBorder) return true;
  if ((hasRgbaBg || hasSolidBg) && hasPadding && hasRadius) return true;
  if (hasRgbaBg && hasPadding && !styles.includes("fontSize:")) return true;

  return false;
}

function stripContentCardBoxStyles(styles: string): string {
  if (!looksLikeContentCardBox(styles)) return styles;

  return styles
    .replace(/backdropFilter:\s*(?:"[^"]*"|`[^`]*`|\{[^}]+\}),?\s*/g, "")
    .replace(/WebkitBackdropFilter:\s*(?:"[^"]*"|`[^`]*`|\{[^}]+\}),?\s*/g, "")
    .replace(/border:\s*(?:"[^"]*"|`[^`]*`|\{[^}]+\}),?\s*/g, "")
    .replace(/background:\s*(?:"[^"]*"|`[^`]*`|\{[^}]+\}),?\s*/g, "")
    .replace(/backgroundColor:\s*(?:"[^"]*"|`[^`]*`|\{[^}]+\}),?\s*/g, "")
    .replace(/boxShadow:\s*(?:"[^"]*"|`[^`]*`|\{[^}]+\}),?\s*/g, "")
    .replace(/borderRadius:\s*(?:"[^"]+"|BORDER_RADIUS\.[a-z]+|\d+),?\s*/g, "")
    .replace(/padding:\s*(?:"[^"]+"|SPACING\.[a-z]+|\{[^}]+\}|\d+px),?\s*/g, "")
    .replace(/,\s*,/g, ",")
    .replace(/\{\s*,/g, "{")
    .replace(/,\s*\}/g, "}");
}

/**
 * Sanitizes generated Remotion code to prevent visible card/box containers.
 * Small background particles are preserved.
 */
export function sanitizeBlockyShapes(code: string): string {
  let result = code;

  // Strip visible card/panel boxes from inline divs
  result = result.replace(
    /(<div[^>]*style=\{\{)([^}]*)(}}\s*\/?>)/g,
    (match, open, styles, close) => {
      const updated = stripContentCardBoxStyles(styles);
      return updated === styles ? match : `${open}${updated}${close}`;
    },
  );

  // Remove box-shadow on small decorative particle divs (creates square halos)
  result = result.replace(
    /(Array\.from\(\{[^}]+\}\)[\s\S]*?return\s*<div[^>]*style=\{\{[^}]*?)boxShadow:\s*(?:`[^`]*`|"[^"]*"|'[^']*'|\{[^}]+\}),?\s*/g,
    "$1",
  );

  // Convert solid-color decorative shape divs (not content cards) to soft glow orbs
  result = result.replace(
    /(<div[^>]*style=\{\{)([^}]*)(}}\s*\/?>)/g,
    (match, open, styles, close) => {
      if (!styles.includes("width:") || !styles.includes("height:")) return match;
      if (styles.includes("radial-gradient") || styles.includes("linear-gradient")) return match;
      if (looksLikeContentCardBox(styles)) return match;
      if (!isBackgroundParticle(styles) && parseFloat(styles.match(/width:\s*(\d+)/)?.[1] || "0") > 24) return match;

      let updated = styles;

      updated = updated.replace(
        /background:\s*"(#[0-9a-fA-F]{3,8})"/,
        (_match: string, color: string) => `background: "radial-gradient(circle, ${color}99 0%, transparent 70%)"`,
      );

      if (!updated.includes("borderRadius")) {
        updated = `${updated}, borderRadius: "50%"`;
      }

      if (!updated.includes("filter:") && !updated.includes("blur(")) {
        updated = `${updated}, filter: "blur(2px)"`;
      }

      return updated === styles ? match : `${open}${updated}${close}`;
    },
  );

  return result;
}
