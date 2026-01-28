/**
 * Typography System - Matching Mobile App
 * 
 * This file provides TypeScript types and utilities for consistent typography
 * across the CMS, matching the mobile app's typography system.
 */

export const typography = {
  // Heading Styles - Using Poppins font
  heading: {
    fontFamily: 'Poppins',
    fontWeight: 600, // SemiBold
    fontSize: '24px',
    lineHeight: '32px',
  },
  headingLarge: {
    fontFamily: 'Poppins',
    fontWeight: 700, // Bold
    fontSize: '28px',
    lineHeight: '36px',
  },
  headingSmall: {
    fontFamily: 'Poppins',
    fontWeight: 600, // SemiBold
    fontSize: '20px',
    lineHeight: '28px',
  },
  headingXSmall: {
    fontFamily: 'Poppins',
    fontWeight: 600, // SemiBold
    fontSize: '18px',
    lineHeight: '24px',
  },
  
  // Body Styles
  body: {
    fontFamily: 'Inter',
    fontWeight: 400, // Regular
    fontSize: '16px',
    lineHeight: '24px',
  },
  bodyLarge: {
    fontFamily: 'Inter',
    fontWeight: 400, // Regular
    fontSize: '18px',
    lineHeight: '26px',
  },
  bodySmall: {
    fontFamily: 'Inter',
    fontWeight: 400, // Regular
    fontSize: '14px',
    lineHeight: '20px',
  },
  
  // Button Styles
  button: {
    fontFamily: 'Inter',
    fontWeight: 600, // SemiBold
    fontSize: '16px',
    lineHeight: '20px',
  },
  buttonLarge: {
    fontFamily: 'Inter',
    fontWeight: 600, // SemiBold
    fontSize: '18px',
    lineHeight: '24px',
  },
  buttonSmall: {
    fontFamily: 'Inter',
    fontWeight: 600, // SemiBold
    fontSize: '14px',
    lineHeight: '18px',
  },
  
  // Caption Styles
  caption: {
    fontFamily: 'Inter',
    fontWeight: 500, // Medium
    fontSize: '14px',
    lineHeight: '20px',
  },
  captionSmall: {
    fontFamily: 'Inter',
    fontWeight: 400, // Regular
    fontSize: '12px',
    lineHeight: '16px',
  },
  captionXSmall: {
    fontFamily: 'Inter',
    fontWeight: 400, // Regular
    fontSize: '11px',
    lineHeight: '14px',
  },
  
  // Label Styles
  label: {
    fontFamily: 'Inter',
    fontWeight: 500, // Medium
    fontSize: '14px',
    lineHeight: '20px',
  },
  labelSmall: {
    fontFamily: 'Inter',
    fontWeight: 500, // Medium
    fontSize: '12px',
    lineHeight: '16px',
  },
};

export type Typography = typeof typography;

/**
 * Tailwind CSS class mappings for typography
 * Use these classes in your components for consistent typography
 */
export const typographyClasses = {
  // Headings
  headingLarge: 'heading-lg',
  heading: 'heading',
  headingSmall: 'heading-sm',
  headingXSmall: 'heading-xs',
  
  // Body
  bodyLarge: 'body-lg',
  body: 'body',
  bodySmall: 'body-sm',
  
  // Buttons
  buttonLarge: 'button-lg',
  button: 'button',
  buttonSmall: 'button-sm',
  
  // Captions
  caption: 'caption',
  captionSmall: 'caption-sm',
  captionXSmall: 'caption-xs',
  
  // Labels
  label: 'label',
  labelSmall: 'label-sm',
};
