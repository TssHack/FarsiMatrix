import {
  argbFromHex,
  hexFromArgb,
  Hct,
  Blend,
  TonalPalette,
  DynamicScheme,
  MaterialDynamicColors,
  SchemeTonalSpot,
  SchemeVibrant,
  SchemeExpressive,
  SchemeContent,
} from '@material/material-color-utilities';

export type ThemeMode = 'light' | 'dark' | 'system';
export type SchemeVariant = 'tonal' | 'vibrant' | 'expressive' | 'content';
export type ContrastLevel = 0 | 0.5 | 1;

export interface ThemeSettings {
  seed: string;
  mode: ThemeMode;
  variant: SchemeVariant;
  contrast: ContrastLevel;
}

export interface SeedOption {
  id: string;
  label: string;
  hex: string;
}

// Persian-inspired seed colors for dynamic color
export const SEED_OPTIONS: SeedOption[] = [
  { id: 'firouzeh', label: 'فیروزه‌ای', hex: '#1A8C8C' },
  { id: 'lajvard', label: 'لاجوردی', hex: '#2F5BD3' },
  { id: 'zafaran', label: 'زعفرانی', hex: '#D99A00' },
  { id: 'anar', label: 'اناری', hex: '#C2185B' },
  { id: 'banafsh', label: 'بنفش', hex: '#6750A4' },
  { id: 'zomorrod', label: 'زمردی', hex: '#2E7D32' },
  { id: 'kahroba', label: 'کهربایی', hex: '#B4541E' },
  { id: 'nili', label: 'نیلی', hex: '#3F51B5' },
];

export const DEFAULT_THEME: ThemeSettings = {
  seed: SEED_OPTIONS[0].hex,
  mode: 'system',
  variant: 'tonal',
  contrast: 0,
};

export const THEME_SETTINGS_KEY = 'farsimatrix_theme_settings_v2';
export const THEME_CSS_KEY = 'farsimatrix_theme_css_v2';

const ROLES: Record<string, (s: DynamicScheme) => number> = {
  primary: (s) => MaterialDynamicColors.primary.getArgb(s),
  'on-primary': (s) => MaterialDynamicColors.onPrimary.getArgb(s),
  'primary-container': (s) => MaterialDynamicColors.primaryContainer.getArgb(s),
  'on-primary-container': (s) => MaterialDynamicColors.onPrimaryContainer.getArgb(s),
  'inverse-primary': (s) => MaterialDynamicColors.inversePrimary.getArgb(s),
  secondary: (s) => MaterialDynamicColors.secondary.getArgb(s),
  'on-secondary': (s) => MaterialDynamicColors.onSecondary.getArgb(s),
  'secondary-container': (s) => MaterialDynamicColors.secondaryContainer.getArgb(s),
  'on-secondary-container': (s) => MaterialDynamicColors.onSecondaryContainer.getArgb(s),
  tertiary: (s) => MaterialDynamicColors.tertiary.getArgb(s),
  'on-tertiary': (s) => MaterialDynamicColors.onTertiary.getArgb(s),
  'tertiary-container': (s) => MaterialDynamicColors.tertiaryContainer.getArgb(s),
  'on-tertiary-container': (s) => MaterialDynamicColors.onTertiaryContainer.getArgb(s),
  error: (s) => MaterialDynamicColors.error.getArgb(s),
  'on-error': (s) => MaterialDynamicColors.onError.getArgb(s),
  'error-container': (s) => MaterialDynamicColors.errorContainer.getArgb(s),
  'on-error-container': (s) => MaterialDynamicColors.onErrorContainer.getArgb(s),
  background: (s) => MaterialDynamicColors.background.getArgb(s),
  'on-background': (s) => MaterialDynamicColors.onBackground.getArgb(s),
  surface: (s) => MaterialDynamicColors.surface.getArgb(s),
  'on-surface': (s) => MaterialDynamicColors.onSurface.getArgb(s),
  'surface-variant': (s) => MaterialDynamicColors.surfaceVariant.getArgb(s),
  'on-surface-variant': (s) => MaterialDynamicColors.onSurfaceVariant.getArgb(s),
  'surface-dim': (s) => MaterialDynamicColors.surfaceDim.getArgb(s),
  'surface-bright': (s) => MaterialDynamicColors.surfaceBright.getArgb(s),
  'surface-container-lowest': (s) => MaterialDynamicColors.surfaceContainerLowest.getArgb(s),
  'surface-container-low': (s) => MaterialDynamicColors.surfaceContainerLow.getArgb(s),
  'surface-container': (s) => MaterialDynamicColors.surfaceContainer.getArgb(s),
  'surface-container-high': (s) => MaterialDynamicColors.surfaceContainerHigh.getArgb(s),
  'surface-container-highest': (s) => MaterialDynamicColors.surfaceContainerHighest.getArgb(s),
  'inverse-surface': (s) => MaterialDynamicColors.inverseSurface.getArgb(s),
  'inverse-on-surface': (s) => MaterialDynamicColors.inverseOnSurface.getArgb(s),
  outline: (s) => MaterialDynamicColors.outline.getArgb(s),
  'outline-variant': (s) => MaterialDynamicColors.outlineVariant.getArgb(s),
  scrim: (s) => MaterialDynamicColors.scrim.getArgb(s),
  shadow: (s) => MaterialDynamicColors.shadow.getArgb(s),
  'surface-tint': (s) => MaterialDynamicColors.surfaceTint.getArgb(s),
};

function createScheme(seed: string, isDark: boolean, variant: SchemeVariant, contrast: number): DynamicScheme {
  const hct = Hct.fromInt(argbFromHex(seed));
  switch (variant) {
    case 'vibrant':
      return new SchemeVibrant(hct, isDark, contrast, '2021');
    case 'expressive':
      return new SchemeExpressive(hct, isDark, contrast, '2021');
    case 'content':
      return new SchemeContent(hct, isDark, contrast, '2021');
    default:
      return new SchemeTonalSpot(hct, isDark, contrast, '2021');
  }
}

// MD3 custom colors harmonized toward the seed so they feel native to every theme
const CUSTOM_COLORS = [
  { name: 'success', source: '#2E7D32' },
  { name: 'flame', source: '#FF6D00' },
];

function customTokens(seed: string, isDark: boolean, contrast: number): Record<string, string> {
  const out: Record<string, string> = {};
  const boost = contrast * 10;
  for (const { name, source } of CUSTOM_COLORS) {
    const palette = TonalPalette.fromInt(Blend.harmonize(argbFromHex(source), argbFromHex(seed)));
    const tones = isDark
      ? { main: 80 + boost / 2, on: 20 - boost, container: 30 - boost, onContainer: 90 + boost }
      : { main: 40 - boost, on: 100, container: 90 + boost / 2, onContainer: 10 - boost / 2 };
    out[name] = hexFromArgb(palette.tone(tones.main));
    out[`on-${name}`] = hexFromArgb(palette.tone(tones.on));
    out[`${name}-container`] = hexFromArgb(palette.tone(tones.container));
    out[`on-${name}-container`] = hexFromArgb(palette.tone(Math.max(0, tones.onContainer)));
  }
  return out;
}

export function buildTokens(settings: ThemeSettings, isDark: boolean): Record<string, string> {
  const scheme = createScheme(settings.seed, isDark, settings.variant, settings.contrast);
  const tokens: Record<string, string> = {};
  for (const [name, getter] of Object.entries(ROLES)) {
    tokens[name] = hexFromArgb(getter(scheme));
  }
  return { ...tokens, ...customTokens(settings.seed, isDark, settings.contrast) };
}

function tokensToCss(tokens: Record<string, string>): string {
  return Object.entries(tokens)
    .map(([name, value]) => `--md-sys-color-${name}:${value};`)
    .join('');
}

export function buildThemeCss(settings: ThemeSettings): string {
  const light = tokensToCss(buildTokens(settings, false));
  const dark = tokensToCss(buildTokens(settings, true));
  return `:root{${light}color-scheme:light;}:root.dark{${dark}color-scheme:dark;}`;
}

export function loadThemeSettings(): ThemeSettings {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  try {
    const raw = localStorage.getItem(THEME_SETTINGS_KEY);
    if (!raw) return DEFAULT_THEME;
    return { ...DEFAULT_THEME, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_THEME;
  }
}

export function resolveIsDark(mode: ThemeMode): boolean {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return mode === 'dark';
}

export function applyTheme(settings: ThemeSettings): void {
  const css = buildThemeCss(settings);
  let style = document.getElementById('m3-dynamic-theme') as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = 'm3-dynamic-theme';
    document.head.appendChild(style);
  }
  style.textContent = css;

  const isDark = resolveIsDark(settings.mode);
  document.documentElement.classList.toggle('dark', isDark);

  const surface = buildTokens(settings, isDark).surface;
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', surface));

  try {
    localStorage.setItem(THEME_SETTINGS_KEY, JSON.stringify(settings));
    localStorage.setItem(THEME_CSS_KEY, css);
  } catch {
    // storage unavailable: theme still applies for this session
  }
}

// Runs before first paint (inlined in <head>) to avoid a flash of the wrong theme
export const THEME_BOOT_SCRIPT = `(function(){try{var c=localStorage.getItem('${THEME_CSS_KEY}');if(c){var s=document.createElement('style');s.id='m3-dynamic-theme';s.textContent=c;document.head.appendChild(s);}var t=JSON.parse(localStorage.getItem('${THEME_SETTINGS_KEY}')||'{}');var m=t.mode||'system';var d=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;
