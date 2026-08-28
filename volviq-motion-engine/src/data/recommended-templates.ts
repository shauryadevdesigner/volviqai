export interface TemplateCard {
  id: string;
  title: string;
  description: string;
  prompt: string;
  aspect: "vertical" | "horizontal" | "square";
  tags: string[];
}

export const ALL_TEMPLATES: TemplateCard[] = [
  {
    id: "luxury-product",
    title: "Luxury Product Ad",
    description: "Cinematic product reveal with premium typography",
    prompt: "Create a luxury product advertisement with elegant motion typography and soft lighting",
    aspect: "horizontal",
    tags: ["product", "ads", "motion"],
  },
  {
    id: "motion-ad-20s",
    title: "20s Motion Graphic",
    description: "Fast-paced brand motion graphic",
    prompt: "Generate a 20-second motion graphic ad with bold typography and dynamic transitions",
    aspect: "horizontal",
    tags: ["motion", "ads"],
  },
  {
    id: "ig-reel-startup",
    title: "Startup Reel",
    description: "Vertical reel for social launch",
    prompt: "Create an Instagram reel for my startup with energetic text animations and brand colors",
    aspect: "vertical",
    tags: ["reel", "startup", "instagram"],
  },
  {
    id: "black-friday",
    title: "Black Friday Promo",
    description: "High-impact sale countdown",
    prompt: "Generate a Black Friday promotion video with countdown and sale highlights",
    aspect: "vertical",
    tags: ["campaign", "ecommerce"],
  },
  {
    id: "yt-short",
    title: "YouTube Short",
    description: "Hook-first vertical short",
    prompt: "Create a YouTube Short with hook text in the first 2 seconds and kinetic typography",
    aspect: "vertical",
    tags: ["youtube", "shorts"],
  },
  {
    id: "brand-campaign",
    title: "Brand Campaign",
    description: "Multi-scene brand story",
    prompt: "Design a brand campaign motion piece with logo reveal and tagline animation",
    aspect: "horizontal",
    tags: ["brand", "campaign"],
  },
];
