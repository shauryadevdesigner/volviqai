import fs from "fs";
import path from "path";
import crypto from "crypto";

const CACHE_DIR = path.join(process.cwd(), "public/generated-assets");
const MANIFEST_PATH = path.join(CACHE_DIR, "manifest.json");

interface Manifest {
  [promptHash: string]: {
    prompt: string;
    style: string;
    url: string;
    timestamp: string;
  };
}

// Ensure cache directory and manifest exist
function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  if (!fs.existsSync(MANIFEST_PATH)) {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify({}), "utf-8");
  }
}

// Generate a deterministic hash for caching
function getPromptHash(prompt: string, style: string): string {
  return crypto
    .createHash("sha256")
    .update(`${prompt.toLowerCase().trim()}_${style.toLowerCase().trim()}`)
    .digest("hex");
}

// Read manifest
function readManifest(): Manifest {
  ensureCacheDir();
  try {
    const data = fs.readFileSync(MANIFEST_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// Write to manifest
function writeManifest(manifest: Manifest) {
  ensureCacheDir();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf-8");
}

/**
 * Generates an SVG Illustration procedurally based on style and prompt.
 * Used as an emergency fallback or luxury layout asset.
 */
export function generateFallbackSVG(style: string, prompt: string): string {
  const styleLower = style.toLowerCase();
  const title = prompt.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  
  if (styleLower.includes("luxury")) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
      <title>${title}</title>
      <defs>
        <radialGradient id="lux-bg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#141416" />
          <stop offset="100%" stop-color="#08080a" />
        </radialGradient>
        <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#c5a880" />
          <stop offset="50%" stop-color="#e5d0b1" />
          <stop offset="100%" stop-color="#9a7e58" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="30" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="1920" height="1080" fill="url(#lux-bg)" />
      
      <!-- Ambient Glows -->
      <circle cx="960" cy="540" r="450" fill="#c5a880" opacity="0.03" filter="url(#glow)" />
      <circle cx="400" cy="300" r="300" fill="#e5d0b1" opacity="0.01" filter="url(#glow)" />
      
      <!-- Elegant Concentric Geometry -->
      <g stroke="url(#gold-grad)" stroke-width="1" fill="none" opacity="0.3" transform="translate(960, 540)">
        <circle r="350" stroke-dasharray="10, 15" />
        <circle r="300" opacity="0.5" />
        <circle r="250" stroke-dasharray="5, 5" />
        <circle r="180" opacity="0.7" />
        <polygon points="0,-120 104,60 -104,60" opacity="0.4" stroke-width="1.5" />
        <polygon points="0,120 -104,-60 104,-60" opacity="0.2" stroke-dasharray="8, 8" />
        <circle r="40" stroke-width="2" />
        <!-- Accent ticks -->
        <path d="M 0,-300 L 0,-280" />
        <path d="M 0,300 L 0,280" />
        <path d="M -300,0 L -280,0" />
        <path d="M 300,0 L 280,0" />
      </g>

      <!-- Soft border vignette -->
      <rect width="1920" height="1080" fill="none" stroke="url(#gold-grad)" stroke-width="40" opacity="0.08" />
    </svg>`;
  }
  
  if (styleLower.includes("saas") || styleLower.includes("startup")) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
      <title>${title}</title>
      <defs>
        <radialGradient id="saas-bg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#020617" />
        </radialGradient>
        <linearGradient id="purple-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#a855f7" />
          <stop offset="100%" stop-color="#06b6d4" />
        </linearGradient>
        <linearGradient id="grid-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1e293b" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.2" />
        </linearGradient>
        <filter id="card-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="20" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="1920" height="1080" fill="url(#saas-bg)" />
      
      <!-- Moving radial glows -->
      <circle cx="1200" cy="400" r="350" fill="#a855f7" opacity="0.08" filter="url(#card-glow)" />
      <circle cx="700" cy="700" r="400" fill="#06b6d4" opacity="0.08" filter="url(#card-glow)" />
      
      <!-- Abstract Grid -->
      <path d="M0,0 L1920,0 M0,100 L1920,100 M0,200 L1920,200 M0,300 L1920,300 M0,400 L1920,400 M0,500 L1920,500 M0,600 L1920,600 M0,700 L1920,700 M0,800 L1920,800 M0,900 L1920,900 M0,1000 L1920,1000" stroke="url(#grid-grad)" stroke-width="1" opacity="0.2" />
      <path d="M0,0 L0,1080 M100,0 L100,1080 M200,0 L200,1080 M300,0 L300,1080 M400,0 L400,1080 M500,0 L500,1080 M600,0 L600,1080 M700,0 L700,1080 M800,0 L800,1080 M900,0 L900,1080 M1000,0 L1000,1080 M1100,0 L1100,1080 M1200,0 L1200,1080 M1300,0 L1300,1080 M1400,0 L1400,1080 M1500,0 L1500,1080 M1600,0 L1600,1080 M1700,0 L1700,1080 M1800,0 L1800,1080 M1900,0 L1900,1080" stroke="url(#grid-grad)" stroke-width="1" opacity="0.2" />

      <!-- UI Mockup Frame (Glassmorphic Dashboard) -->
      <g transform="translate(480, 200)">
        <!-- Shadow & Card Base -->
        <rect width="960" height="600" rx="24" fill="#1e293b" fill-opacity="0.4" stroke="#334155" stroke-width="1.5" />
        <rect width="960" height="60" rx="0" fill="#0f172a" fill-opacity="0.5" stroke="#334155" stroke-width="0" clip-path="inset(0 0 540 0)" />
        
        <!-- Browser dots -->
        <circle cx="30" cy="30" r="8" fill="#ef4444" />
        <circle cx="60" cy="30" r="8" fill="#f59e0b" />
        <circle cx="90" cy="30" r="8" fill="#10b981" />
        
        <!-- Side navigation sidebar mockup -->
        <rect x="20" y="80" width="180" height="500" rx="12" fill="#0f172a" fill-opacity="0.3" />
        <rect x="40" y="110" width="140" height="24" rx="6" fill="url(#purple-cyan)" fill-opacity="0.8" />
        <rect x="40" y="160" width="140" height="18" rx="4" fill="#475569" fill-opacity="0.5" />
        <rect x="40" y="200" width="140" height="18" rx="4" fill="#475569" fill-opacity="0.5" />
        <rect x="40" y="240" width="140" height="18" rx="4" fill="#475569" fill-opacity="0.5" />

        <!-- Dashboard Charts -->
        <rect x="220" y="80" width="460" height="320" rx="16" fill="#0f172a" fill-opacity="0.4" stroke="#334155" />
        <!-- Spline Line Chart -->
        <path d="M250,340 Q350,180 450,280 T650,150" fill="none" stroke="url(#purple-cyan)" stroke-width="5" filter="url(#card-glow)" />
        <circle cx="650" cy="150" r="10" fill="#22d3ee" />

        <!-- Mini Stats Grid -->
        <rect x="700" y="80" width="240" height="145" rx="16" fill="#0f172a" fill-opacity="0.4" stroke="#334155" />
        <rect x="700" y="255" width="240" height="145" rx="16" fill="#0f172a" fill-opacity="0.4" stroke="#334155" />
        
        <circle cx="760" cy="150" r="25" fill="#a855f7" fill-opacity="0.2" />
        <rect x="800" y="130" width="110" height="15" rx="4" fill="#cbd5e1" />
        <rect x="800" y="155" width="70" height="10" rx="2" fill="#64748b" />
        
        <circle cx="760" cy="325" r="25" fill="#06b6d4" fill-opacity="0.2" />
        <rect x="800" y="305" width="110" height="15" rx="4" fill="#cbd5e1" />
        <rect x="800" y="330" width="70" height="10" rx="2" fill="#64748b" />

        <!-- Bottom wide log/activities -->
        <rect x="220" y="420" width="720" height="160" rx="16" fill="#0f172a" fill-opacity="0.4" stroke="#334155" />
        <rect x="250" y="460" width="200" height="16" rx="4" fill="#64748b" fill-opacity="0.6" />
        <rect x="250" y="490" width="450" height="12" rx="3" fill="#475569" fill-opacity="0.4" />
        <rect x="250" y="520" width="320" height="12" rx="3" fill="#475569" fill-opacity="0.4" />
        <circle cx="890" cy="500" r="30" fill="#10b981" fill-opacity="0.2" />
        <polygon points="885,500 892,507 905,492" stroke="#10b981" stroke-width="3" fill="none" />
      </g>
    </svg>`;
  }

  if (styleLower.includes("tech")) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
      <title>${title}</title>
      <defs>
        <radialGradient id="tech-bg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#020205" />
          <stop offset="100%" stop-color="#0a0515" />
        </radialGradient>
        <linearGradient id="neon-glow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ec4899" />
          <stop offset="50%" stop-color="#8b5cf6" />
          <stop offset="100%" stop-color="#3b82f6" />
        </linearGradient>
        <filter id="neon-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="15" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Background -->
      <rect width="1920" height="1080" fill="url(#tech-bg)" />

      <!-- Glowing Orbs -->
      <circle cx="960" cy="540" r="500" fill="#8b5cf6" opacity="0.04" filter="url(#neon-blur)" />
      
      <!-- Tech Circuit Board Vector Graphics -->
      <g stroke="url(#neon-glow)" stroke-width="1.5" fill="none" opacity="0.4" filter="url(#neon-blur)">
        <!-- Horizontal grid connectors -->
        <path d="M 100,540 L 500,540 L 580,460 L 900,460 L 960,520 L 1200,520 L 1260,580 L 1820,580" />
        <path d="M 200,200 L 700,200 L 760,260 L 1100,260 L 1160,200 L 1720,200" />
        <path d="M 300,880 L 600,880 L 680,800 L 1220,800 L 1280,860 L 1620,860" />
        
        <!-- Connecting vertical pins -->
        <path d="M 500,540 L 500,700 L 520,720" />
        <path d="M 1100,260 L 1100,400 L 1140,440" />

        <!-- Glowing Nodes -->
        <circle cx="500" cy="540" r="6" fill="#ec4899" />
        <circle cx="580" cy="460" r="4" fill="#8b5cf6" />
        <circle cx="900" cy="460" r="4" fill="#8b5cf6" />
        <circle cx="960" cy="520" r="6" fill="#3b82f6" />
        <circle cx="1200" cy="520" r="4" fill="#8b5cf6" />
        <circle cx="1260" cy="580" r="6" fill="#ec4899" />
        
        <circle cx="700" cy="200" r="6" fill="#3b82f6" />
        <circle cx="760" cy="260" r="4" fill="#8b5cf6" />
        <circle cx="1100" cy="260" r="6" fill="#ec4899" />
        <circle cx="1160" cy="200" r="4" fill="#3b82f6" />

        <!-- 3D tech cube abstract outline -->
        <g transform="translate(960, 500) scale(1.5)">
          <polygon points="0,-100 86,-50 86,50 0,100 -86,50 -86,-50" stroke-width="2" />
          <path d="M0,-100 L0,100" />
          <path d="M0,0 L86,-50" />
          <path d="M0,0 L-86,-50" />
          <path d="M0,0 L0,100" />
          <line x1="-86" y1="50" x2="0" y2="0" />
          <line x1="86" y1="50" x2="0" y2="0" />
        </g>
      </g>
    </svg>`;
  }

  // Default / Corporate style
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <title>${title}</title>
    <defs>
      <radialGradient id="corp-bg" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="#f8fafc" />
        <stop offset="100%" stop-color="#e2e8f0" />
      </radialGradient>
      <linearGradient id="corp-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e3a8a" />
        <stop offset="100%" stop-color="#3b82f6" />
      </linearGradient>
    </defs>
    
    <!-- Background -->
    <rect width="1920" height="1080" fill="url(#corp-bg)" />
    
    <!-- Professional abstract vector shapes -->
    <g fill="url(#corp-grad)" opacity="0.05">
      <path d="M 0,1080 L 600,400 L 1200,900 L 1920,200 L 1920,1080 Z" />
      <circle cx="1500" cy="300" r="300" />
      <rect x="200" y="100" width="400" height="400" rx="100" transform="rotate(45, 400, 300)" />
    </g>

    <!-- Clean subtle blueprint grid -->
    <g stroke="#94a3b8" stroke-width="0.5" opacity="0.15">
      <path d="M 0,180 L 1920,180 M 0,360 L 1920,360 M 0,540 L 1920,540 M 0,720 L 1920,720 M 0,900 L 1920,900" />
      <path d="M 320,0 L 320,1080 M 640,0 L 640,1080 M 960,0 L 960,1080 M 1280,0 L 1280,1080 M 1600,0 L 1600,1080" />
    </g>
    
    <!-- Focal geometric balance wireframe -->
    <circle cx="960" cy="540" r="200" stroke="url(#corp-grad)" stroke-width="1.5" fill="none" opacity="0.2" />
    <circle cx="960" cy="540" r="220" stroke="url(#corp-grad)" stroke-width="0.7" stroke-dasharray="5,5" fill="none" opacity="0.2" />
  </svg>`;
}

/**
 * Automator for generated visual assets.
 * Fetches generated images from Pollinations AI (based on Flux/Imagen) or falls back.
 */
export async function generateAsset(prompt: string, style: string): Promise<string> {
  const hash = getPromptHash(prompt, style);
  const manifest = readManifest();
  
  // ── Feature 7: Asset Caching Check ──
  if (manifest[hash]) {
    console.log(`[Cache Hit] Asset found for prompt: "${prompt.substring(0, 40)}..."`);
    return manifest[hash].url;
  }

  console.log(`[Cache Miss] Generating new asset for prompt: "${prompt.substring(0, 40)}..." Style: ${style}`);
  
  const filename = `${hash}.png`;
  const relativeUrl = `/generated-assets/${filename}`;
  const localPath = path.join(CACHE_DIR, filename);

  ensureCacheDir();

  // Try calling OpenRouter image generation first (flux-1-schnell)
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const baseUrl = "https://openrouter.ai/api/v1";
      console.log(`[Image API] Calling OpenRouter flux-1-schnell...`);
      
      const genController = new AbortController();
      const genTimeoutId = setTimeout(() => genController.abort(), 20000); // 20s timeout

      const response = await fetch(`${baseUrl}/images/generations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
          model: "flux-1-schnell",
          prompt: `${prompt}, ${style}, 4k high quality, photographic style`,
          n: 1,
          size: "1024x1024"
        }),
        signal: genController.signal
      });
      clearTimeout(genTimeoutId);

      if (response.ok) {
        const data: any = await response.json();
        const imageUrl = data.data?.[0]?.url;
        if (imageUrl) {
          console.log(`[Image API] Fetching generated image from URL: ${imageUrl}`);
          
          const imgController = new AbortController();
          const imgTimeoutId = setTimeout(() => imgController.abort(), 20000); // 20s timeout

          const imageResponse = await fetch(imageUrl, { signal: imgController.signal });
          clearTimeout(imgTimeoutId);

          if (imageResponse.ok) {
            const arrayBuffer = await imageResponse.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            fs.writeFileSync(localPath, uint8Array);
            
            manifest[hash] = {
              prompt,
              style,
              url: relativeUrl,
              timestamp: new Date().toISOString(),
            };
            writeManifest(manifest);
            return relativeUrl;
          }
        }
      } else {
        const errText = await response.text().catch(() => "");
        console.warn(`[Image API Warning] OpenRouter image generation returned status ${response.status}: ${errText}`);
      }
    } catch (imageErr) {
      console.warn(`[Image API Warning] OpenRouter image generation failed:`, imageErr);
    }
  }

  // Try calling the image generation API
  try {
    // We will call the public Pollinations AI image generator which uses Flux/Schnell
    // It's fast, free, high quality, and requires no API key!
    const queryParams = new URLSearchParams({
      width: "1024",
      height: "1024",
      nologo: "true",
      seed: Math.floor(Math.random() * 1000000).toString(),
    });
    
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${queryParams.toString()}`;
    console.log(`[Image API] Fetching from Pollinations: ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Pollinations AI responded with status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Save PNG locally
    fs.writeFileSync(localPath, uint8Array);
    console.log(`[Image API] Saved generated asset to: ${localPath}`);

    // Update manifest cache
    manifest[hash] = {
      prompt,
      style,
      url: relativeUrl,
      timestamp: new Date().toISOString(),
    };
    writeManifest(manifest);

    return relativeUrl;
  } catch (error) {
    console.warn(`[Image API Warning] Image generation failed. Falling back to SVG Illustration. Error:`, error);
    
    // ── Emergency Fallback: Premium SVG Illustration ──
    const svgFilename = `${hash}.svg`;
    const svgRelativeUrl = `/generated-assets/${svgFilename}`;
    const svgLocalPath = path.join(CACHE_DIR, svgFilename);

    try {
      const svgContent = generateFallbackSVG(style, prompt);
      fs.writeFileSync(svgLocalPath, svgContent, "utf-8");
      console.log(`[SVG Fallback] Saved premium SVG illustration to: ${svgLocalPath}`);

      // Update manifest cache with the SVG
      manifest[hash] = {
        prompt,
        style,
        url: svgRelativeUrl,
        timestamp: new Date().toISOString(),
      };
      writeManifest(manifest);

      return svgRelativeUrl;
    } catch (svgError) {
      console.error(`[SVG Fallback Critical] SVG generation failed:`, svgError);
      
      // Ultimate absolute fallback: standard public placeholder or standard gradient SVG
      return "https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?w=800";
    }
  }
}
