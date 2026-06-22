import React from 'react';

const BRANDS = [
  { name: 'Adobe', accent: '#FF0000' },
  { name: 'Figma', accent: '#A259FF' },
  { name: 'After Effects', short: 'Ae', accent: '#9999FF' },
  { name: 'DaVinci', accent: '#FF6B4A' },
  { name: 'Premiere', accent: '#9999FF' },
  { name: 'Canva', accent: '#00C4CC' },
  { name: 'Runway', accent: '#FFFFFF' },
  { name: 'Shopify', accent: '#95BF47' },
  { name: 'Notion', accent: '#FFFFFF' },
  { name: 'Stripe', accent: '#635BFF' },
];

function BrandMark({ name, short, accent }) {
  return (
    <div className="flex items-center gap-3 px-2 select-none">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-md border border-outline-variant/50 bg-surface-container-low text-[11px] font-bold tracking-tight"
        style={{ color: accent, boxShadow: `0 0 20px ${accent}22` }}
      >
        {short || name.slice(0, 2).toUpperCase()}
      </span>
      <span className="font-label-sm text-label-sm tracking-wider text-primary/75 whitespace-nowrap">
        {name.toUpperCase()}
      </span>
    </div>
  );
}

export const brandLogoItems = BRANDS.map((b) => ({
  node: <BrandMark {...b} />,
  title: b.name,
}));

export default function BrandMarqueeLabel() {
  return (
    <div className="font-code-md text-[9px] text-surface-variant tracking-widest uppercase text-center">
      Trusted by teams building with industry-leading creative stacks
    </div>
  );
}
