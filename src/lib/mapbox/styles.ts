export const NEON_PALETTE = {
  primary: '#3b82f6',
  secondary: '#f59e0b',
  accent: '#ec4899',
  danger: '#ef4444',
  success: '#22c55e',
  water: '#0f172a',
  background: '#020617',
  building: '#1e293b',
  text: '#f8fafc',
} as const;

export const MAPJITSU_STYLE_URL = 'mapbox://styles/mapbox/standard';

export type NeonColor = keyof typeof NEON_PALETTE;
