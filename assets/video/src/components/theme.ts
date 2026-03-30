// Design tokens matching the Caliber LP (caliber-ai.dev) exactly
export const theme = {
  bg: "#09090b",
  surface: "#18181b",
  surfaceHeader: "#27272a",
  surfaceBorder: "#3f3f46",
  surfaceHover: "#1c1c1e",

  // Brand gradient (logo bars — LP orange palette)
  brand1: "#fdba74", // lightest (orange-300)
  brand2: "#fb923c", // mid (orange-400)
  brand3: "#f97316", // deepest / primary (orange-500)

  // Accent
  accent: "#7dd3fc", // cyan/blue (sky-300)
  accentDim: "#38bdf8",

  // Semantic
  green: "#22c55e",
  greenDim: "#16a34a",
  red: "#ef4444",
  yellow: "#eab308",

  // Text (LP tokens)
  text: "#fafafa",
  textSecondary: "#a1a1aa",
  textMuted: "#71717a",

  // Typography (LP fonts)
  fontSans: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
  fontMono: "'Geist Mono', 'JetBrains Mono', 'SF Mono', ui-monospace, monospace",

  // Radii
  radius: 12,
  radiusSm: 8,
  radiusLg: 16,

  // Additional semantic
  purple: "#c4b5fd",

  // LP signature effects — subtle
  terminalGlow: "0 0 60px -20px rgba(249,115,22,0.08)",
  cardGlow: "0 0 30px -10px rgba(249,115,22,0.05)",
} as const;
