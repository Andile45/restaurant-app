export const colors = {
  // Primary Brand Colors
  primary: '#00B4BF',       // The vibrant teal used in buttons and the logo
  secondary: '#F1F1F1',     // The light grey used for the 'Skip' buttons
  
  // Background & Surfaces
  background: '#FFFFFF',    // Main white background for the content cards
  appBackground: '#E0F7F8', // The light teal/blue gradient background
  
  // Text Colors
  textPrimary: '#000000',   // Bold black for headings
  textSecondary: '#4A4A4A', // Muted grey for descriptions and body text
  textInverse: '#FFFFFF',  // White text used on the primary buttons
  
  // Status/Action Colors
  activeDot: '#00B4BF',     // Teal color for the active pagination indicator
  inactiveDot: '#D1D1D1',   // Grey color for inactive pagination indicators
  
  // Border Colors
  border: '#E8E8E8',        // Subtle borders for buttons or containers
  
  // Status Colors
  success: '#4CAF50',      // Success/Completed status
  error: '#F44336',         // Error/Failed status
  warning: '#FF9800',       // Warning/Pending status
  info: '#2196F3',          // Info/Information status
  
  // Status Color Variants (with opacity)
  successLight: '#4CAF5020',   // Light success background
  errorLight: '#F4433620',     // Light error background
  warningLight: '#FF980020',   // Light warning background
  infoLight: '#2196F320',      // Light info background
  
  // Shadow Colors
  shadow: 'rgba(0, 0, 0, 0.1)',     // Standard shadow
  shadowLight: 'rgba(0, 0, 0, 0.05)', // Light shadow
  shadowDark: 'rgba(0, 0, 0, 0.2)',   // Dark shadow
  
  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.5)',    // Modal overlay
  overlayLight: 'rgba(0, 0, 0, 0.3)', // Light overlay
  
  // Divider Colors
  divider: '#E8E8E8',       // Section dividers
};

export type Colors = typeof colors;

// Spacing system for consistent spacing throughout the app
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
};

// Border radius system
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 9999, // Fully rounded
};