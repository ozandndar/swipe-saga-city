export const COLORS = {
  light: {
    primary: '#007AFF',
    background: '#FFFFFF',
    text: '#000000',
    card: '#F2F2F2',
    border: '#E5E5E5',
    notification: '#FF3B30',
    // Game-specific colors
    happiness: '#FFD700',    // Gold
    budget: '#2ECC71',       // Green
    environment: '#3498DB',  // Blue
  },
  dark: {
    primary: '#0A84FF',
    background: '#000000',
    text: '#FFFFFF',
    card: '#1C1C1E',
    border: '#38383A',
    notification: '#FF453A',
    // Game-specific colors
    happiness: '#FFD700',    // Gold
    budget: '#2ECC71',       // Green
    environment: '#3498DB',  // Blue
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const; 