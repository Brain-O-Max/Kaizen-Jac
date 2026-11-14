import type { ThemeId } from '@/lib/site';

// Accent colours per site. Tailwind needs complete class names in the source, so each is written out in full.
export interface Theme {
  eyebrow: string;
  badge: string;
  button: string;
  glow: string;
  gradient: string;
  icon: string;
  selection: string;
}

export const THEMES: Record<ThemeId, Theme> = {
  teal: {
    eyebrow: 'text-teal-400',
    badge: 'bg-teal-950/60 border-teal-800/60 text-teal-400',
    button: 'bg-teal-600 hover:bg-teal-500 shadow-teal-600/25',
    glow: 'bg-teal-600/10',
    gradient: 'from-teal-300 to-blue-400',
    icon: 'text-teal-400',
    selection: 'selection:bg-teal-600',
  },
  blue: {
    eyebrow: 'text-blue-400',
    badge: 'bg-blue-950/60 border-blue-800/60 text-blue-400',
    button: 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/25',
    glow: 'bg-blue-600/10',
    gradient: 'from-blue-300 to-teal-300',
    icon: 'text-blue-400',
    selection: 'selection:bg-blue-600',
  },
  amber: {
    eyebrow: 'text-amber-400',
    badge: 'bg-amber-950/60 border-amber-800/60 text-amber-400',
    button: 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/25',
    glow: 'bg-amber-600/10',
    gradient: 'from-amber-300 to-orange-400',
    icon: 'text-amber-400',
    selection: 'selection:bg-amber-600',
  },
};
