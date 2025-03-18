
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
      
      // For P3, we want to push the color to the edges of the gamut
      if (colorSpace === 'P3') {
        // Boost saturation for P3 to show its wider gamut
        p3.coords[1] = Math.min(p3.coords[1] * 1.2, 1);
      }
      
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
      
      // For OKLCH, we might adjust lightness or chroma to show its perceptual properties
      if (colorSpace === 'OKLCH') {
        // Boost chroma/saturation for OKLCH to show its perceptual advantages
        oklch.coords[1] = Math.min(oklch.coords[1] * 1.15, 0.4);
      }
      
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

  // Add an overlay with gamut indication
  const renderGamutOverlay = () => {
    if (colorSpace === 'HEX') return null;
    
    try {
      const srgbColor = new Color(color);
      const targetColor = colorSpace === 'P3' 
        ? srgbColor.to("p3") 
        : srgbColor.to("oklch");
      
      // Check if the color is out of sRGB gamut
      const isOutOfGamut = !srgbColor.inGamut();
      
      if (isOutOfGamut) {
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded-full">
              Extended Gamut
            </span>
          </div>
        );
      }
    } catch (e) {
      console.error('Gamut check error:', e);
    }
    
    return null;
  };

  return (
    <div className="space-y-2 w-full">
      <div className="color-label">{colorSpace}</div>
      <div className="relative">
        <div 
          className={cn("color-preview animate-fade-in", className)}
          style={{ 
            backgroundColor: getColorValue(),
            transition: 'background-color 0.4s ease-out'
          }}
          aria-label={`${colorSpace} color preview`}
        />
        {renderGamutOverlay()}
      </div>
    </div>
  );
};

export default ColorPreview;
