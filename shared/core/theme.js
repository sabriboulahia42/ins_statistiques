/**
 * shared/core/theme.js
 * ──────────────────────────────────────────────────────────────
 * Centralized design tokens for the INS Statistics Portal.
 * Consistent across Web, Desktop, and Mobile.
 */

export const theme = {
  colors: {
    primary: '#0056b3',      // INS Official Blue
    secondary: '#005a7d',    // Data Portal Teal
    background: '#0F172A',   // Slate Dark
    surface: '#1E293B',      // Slate Lighter
    text: '#F8FAFC',         // Ghost White
    textMuted: '#94A3B8',    // Slate Muted
    accent: '#10B981',       // Success Green
    error: '#EF4444',        // Red
    warning: '#F59E0B',      // Amber
    border: '#334155',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 20,
  },
  typography: {
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    size: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 28,
    },
    weight: {
      light: '300',
      regular: '400',
      medium: '500',
      bold: '700',
    },
  },
};
