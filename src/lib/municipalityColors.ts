// 17 Highly Distinct Colors — extends the same palette used for
// per-municipality chart coloring on the Population page (BRGY_COLORS).
const MUNICIPALITY_COLOR_PALETTE = [
  '#0066eb', // Municipal Blue
  '#cc3e00', // Brand Orange
  '#059669', // Emerald Green
  '#7c3aed', // Vivid Purple
  '#dc2626', // Strong Red
  '#0891b2', // Cyan/Teal
  '#db2777', // Pink/Rose
  '#1e40af', // Navy
  '#b45309', // Amber/Brown
  '#4f46e5', // Indigo
  '#0d9488', // Dark Teal
  '#9333ea', // Violet
  '#475569', // Slate
  '#be123c', // Crimson
  '#16a34a', // Green
  '#ea580c', // Deep Orange
  '#0369a1', // Sky Blue
];

// Fixed slug order so the same municipality always gets the same color,
// regardless of how the boundary GeoJSON happens to be sorted.
const SLUG_ORDER = [
  'altavas',
  'balete',
  'banga',
  'batan',
  'buruanga',
  'ibajay',
  'kalibo',
  'lezo',
  'libacao',
  'madalag',
  'makato',
  'malay',
  'malinao',
  'nabas',
  'new-washington',
  'numancia',
  'tangalan',
];

const MUNICIPALITY_COLOR_MAP: Record<string, string> = Object.fromEntries(
  SLUG_ORDER.map((slug, i) => [slug, MUNICIPALITY_COLOR_PALETTE[i]])
);

const FALLBACK_COLOR = MUNICIPALITY_COLOR_PALETTE[0];

export function getMunicipalityColor(slug: string): string {
  return MUNICIPALITY_COLOR_MAP[slug] ?? FALLBACK_COLOR;
}
