
import React from 'react';
import { cn } from '@/lib/utils';
import Color from 'colorjs.io';

interface ColorPreviewProps {
  color: string;
  colorSpace: 'HEX' | 'P3' | 'OKLCH';
  className?: string;
}

const ColorPreview: React.FC<ColorPreviewProps> = ({ 
  color, 
  colorSpace,
  className 
}) => {
  // Get the appropriate color value based on color space
  const getColorValue = () => {
    try {
      switch (colorSpace) {
        case 'HEX':
          return color;
        case 'P3':
          return `color(display-p3 ${hexToP3(color)})`;
        case 'OKLCH':
          return hexToOklch(color);
        default:
          return color;
      }
    } catch (e) {
      console.error('Color conversion error:', e);
      return colorSpace === 'HEX' ? color : '#000000';
    }
  };

  // Convert hex to P3 color space
  const hexToP3 = (hex: string): string => {
    try {
      const color = new Color(hex);
      const p3 = color.to("p3");
      return `${p3.coords[0].toFixed(3)} ${p3.coords[1].toFixed(3)} ${p3.coords[2].toFixed(3)}`;
    } catch (e) {
      console.error('P3 conversion error:', e);
      return '0 0 0';
    }
  };

  // Convert hex to OKLCH color space using ColorJS
  const hexToOklch = (hex: string): string => {
    try {
      const oklch = new Color(hex).to("oklch");
      const roundedCoords = [
        oklch.coords[0].toFixed(3),
        oklch.coords[1].toFixed(3),
        oklch.coords[2].toFixed(1)
      ];
      return `oklch(${roundedCoords[0]} ${roundedCoords[1]} ${roundedCoords[2]})`;
    } catch (e) {
      console.error('OKLCH conversion error:', e);
      return 'oklch(0.5 0 0)';
    }
  };

  return (
    <div className="space-y-2 w-full">
      <div className="color-label">{colorSpace}</div>
      <div 
        className={cn("color-preview animate-fade-in", className)}
        style={{ 
          backgroundColor: getColorValue(),
          transition: 'background-color 0.4s ease-out'
        }}
        aria-label={`${colorSpace} color preview`}
      />
    </div>
  );
};

export default ColorPreview;
