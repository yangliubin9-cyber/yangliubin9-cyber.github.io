export const themeModes = ['light', 'dark'] as const;

export type ThemeMode = (typeof themeModes)[number];

export const themeStorageKey = 'muzi-theme';

export const utterancesThemeMap: Record<ThemeMode, string> = {
  light: 'github-light',
  dark: 'github-dark'
};

export function isThemeMode(value: string): value is ThemeMode {
  return themeModes.includes(value as ThemeMode);
}
