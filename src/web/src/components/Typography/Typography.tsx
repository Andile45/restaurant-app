import React from 'react';
import { typographyClasses } from '../../theme/typography';

export type TypographyVariant =
  | 'headingLarge'
  | 'heading'
  | 'headingSmall'
  | 'headingXSmall'
  | 'bodyLarge'
  | 'body'
  | 'bodySmall'
  | 'buttonLarge'
  | 'button'
  | 'buttonSmall'
  | 'caption'
  | 'captionSmall'
  | 'captionXSmall'
  | 'label'
  | 'labelSmall';

export type TypographyColor = 'primary' | 'secondary' | 'inverse';

interface TypographyProps {
  variant?: TypographyVariant;
  color?: TypographyColor;
  className?: string;
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color = 'primary',
  className = '',
  children,
  as,
}) => {
  const baseClass = typographyClasses[variant] || 'body';
  const colorClass = `text-${color === 'primary' ? 'text-primary' : color === 'secondary' ? 'text-secondary' : 'text-inverse'}`;
  const isHeading = variant.startsWith('heading');
  const fontClass = isHeading ? 'font-display' : '';
  
  const combinedClassName = `${baseClass} ${colorClass} ${fontClass} ${className}`.trim();

  const getElement = () => {
    if (as) return as;
    
    if (variant.startsWith('heading')) {
      if (variant === 'headingLarge') return 'h1';
      if (variant === 'heading') return 'h2';
      if (variant === 'headingSmall') return 'h3';
      return 'h4';
    }
    
    return 'p';
  };
  
  const Element = getElement();

  switch (Element) {
    case 'h1':
      return <h1 className={combinedClassName}>{children}</h1>;
    case 'h2':
      return <h2 className={combinedClassName}>{children}</h2>;
    case 'h3':
      return <h3 className={combinedClassName}>{children}</h3>;
    case 'h4':
      return <h4 className={combinedClassName}>{children}</h4>;
    case 'h5':
      return <h5 className={combinedClassName}>{children}</h5>;
    case 'h6':
      return <h6 className={combinedClassName}>{children}</h6>;
    case 'span':
      return <span className={combinedClassName}>{children}</span>;
    case 'div':
      return <div className={combinedClassName}>{children}</div>;
    default:
      return <p className={combinedClassName}>{children}</p>;
  }
};
