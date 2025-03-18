
import React from 'react';
import { cn } from '@/lib/utils';
import Color from 'colorjs.io';

interface ColorPreviewProps {
  color: string;
  colorSpace: 'HEX' | 'P3' | 'OKLCH';
  className?: string;
}

// P3 conversion function
const toP3 = (color: string | null | undefined): string | undefined => {
  if (!color) return undefined;

  // return unmodified if already in P3 color space
  if (color?.includes("color(display-p3")) return color;

  // regex for matching HEX, RGB, RGBA colors
  const hexColorRegExp = /^#([0-9a-fA-F]{8}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;
  const rgbColorRegExp = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;
  const rgbaColorRegExp = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([01]?(\.\d+)?)\)$/;

  let red = 0;
  let green = 0;
  let blue = 0;
  let alpha = 1;

  if (hexColorRegExp.test(color)) {
    // parse HEX with optional alpha
    const match = color.match(hexColorRegExp);
    if (match) {
      const hex = match[1];
      if (hex.length === 6 || hex.length === 8) {
        // HEX with or without alpha
        const step = hex.length === 8 ? 2 : hex.length / 3;
        red = parseInt(hex.slice(0, step), 16);
        green = parseInt(hex.slice(step, 2 * step), 16);
        blue = parseInt(hex.slice(2 * step, 3 * step), 16);
        alpha = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
      } else if (hex.length === 3 || hex.length === 4) {
        // 3 or 4 digit HEX
        red = parseInt(hex[0] + hex[0], 16);
        green = parseInt(hex[1] + hex[1], 16);
        blue = parseInt(hex[2] + hex[2], 16);
        alpha = hex.length === 4 ? parseInt(hex[3] + hex[3], 16) / 255 : 1;
      }
    }
  } else if (rgbColorRegExp.test(color)) {
    // parse RGB
    const match = color.match(rgbColorRegExp);
    if (match) {
      red = parseInt(match[1], 10);
      green = parseInt(match[2], 10);
      blue = parseInt(match[3], 10);
    }
  } else if (rgbaColorRegExp.test(color)) {
    // parse RGBA
    const match = color.match(rgbaColorRegExp);
    if (match) {
      red = parseInt(match[1], 10);
      green = parseInt(match[2], 10);
      blue = parseInt(match[3], 10);
      alpha = parseFloat(match[4]);
    }
  } else {
    // return transparent without converting if something doesn't match
    return "rgba(0, 0, 0, 0)";
  }

  // convert to P3 color space
  const r = (red / 255).toFixed(6);
  const g = (green / 255).toFixed(6);
  const b = (blue / 255).toFixed(6);
  const a = alpha.toFixed(6);

  return `color(display-p3 ${r} ${g} ${b} / ${a})`;
};

/**
 * Converts a P3 color to a HEX color code with alpha channel.
 * @param p3Color P3 color string.
 * @returns #RRGGBBAA
 */
const toHEX = (p3Color: string): string => {
  // Regular expression to match the P3 color format
  const p3ColorRegExp = /color\(display-p3\s+([0-1]?\.\d+)\s+([0-1]?\.\d+)\s+([0-1]?\.\d+)\s*\/\s*([01]?(\.\d+)?)\)/;

  // Check if the input is a valid P3 color
  if (!p3ColorRegExp.test(p3Color)) {
    return "#000000ff"; // Return black with full opacity if the input is invalid
  }

  const match = p3Color.match(p3ColorRegExp);
  if (!match) {
    return "#000000ff";
  }

  // Convert each color component from float to integer (0-255 range)
  const red = Math.round(parseFloat(match[1]) * 255);
  const green = Math.round(parseFloat(match[2]) * 255);
  const blue = Math.round(parseFloat(match[3]) * 255);
  const alpha = Math.round(parseFloat(match[4]) * 255);

  // Convert the color components to a two-digit hexadecimal code
  const toHexComponent = (component: number) => component.toString(16).padStart(2, "0");

  // Construct the HEX color code with alpha
  return `#${toHexComponent(red)}${toHexComponent(green)}${toHexComponent(blue)}${toHexComponent(alpha)}`;
};

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
          return toP3(color) || color;
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
      const isOutOfGamut = !srgbColor.inGamut("srgb");
      
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
