
import React from 'react';
import { cn } from '@/lib/utils';

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
    switch (colorSpace) {
      case 'HEX':
        return color;
      case 'P3':
        return `color(display-p3 ${hexToP3(color)})`;
      case 'OKLCH':
        return `oklch(${hexToOklch(color)})`;
      default:
        return color;
    }
  };

  // Convert hex to P3 color space
  const hexToP3 = (hex: string): string => {
    // Convert hex to RGB
    const rgb = hexToRgb(hex);
    if (!rgb) return '0 0 0';
    
    // Normalize RGB values to 0-1 range
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    // Return the P3 color values
    return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)}`;
  };

  // Convert hex to OKLCH color space (approximate conversion)
  const hexToOklch = (hex: string): string => {
    // Convert hex to RGB
    const rgb = hexToRgb(hex);
    if (!rgb) return '0.5 0 0';
    
    // This is a very simplified conversion
    // Convert RGB to relative values (0-1)
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    // Calculate approximate lightness (using luminance formula)
    const lightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    
    // Calculate approximate chroma (saturation)
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const chroma = max === 0 ? 0 : (max - min) / max;
    
    // Calculate approximate hue
    let hue = 0;
    if (max === min) {
      hue = 0;
    } else if (max === r) {
      hue = ((g - b) / (max - min) + (g < b ? 6 : 0)) * 60;
    } else if (max === g) {
      hue = ((b - r) / (max - min) + 2) * 60;
    } else {
      hue = ((r - g) / (max - min) + 4) * 60;
    }
    
    // Scale values to appropriate ranges for OKLCH
    const scaledLight = (lightness * 0.9 + 0.05).toFixed(3);
    const scaledChroma = (chroma * 0.15).toFixed(3);
    const scaledHue = hue.toFixed(1);
    
    return `${scaledLight} ${scaledChroma} ${scaledHue}`;
  };
  
  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const formattedHex = hex.replace(shorthandRegex, (_, r, g, b) => {
      return r + r + g + g + b + b;
    });
  
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(formattedHex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : null;
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
