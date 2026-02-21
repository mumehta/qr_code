export const Colors = {
  background: '#0f0f14',
  surface: '#1a1a24',
  surfaceElevated: '#22223a',
  border: '#2e2e4a',
  primary: '#7c6af7',
  primaryDark: '#5a4fd4',
  accent: '#4fc3f7',
  textPrimary: '#f0f0f8',
  textSecondary: '#8888aa',
  textMuted: '#55556a',
  success: '#4caf82',
  error: '#f07070',
  white: '#ffffff',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 9999,
};

export const Typography = {
  heading: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: Colors.textPrimary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
  },
};
