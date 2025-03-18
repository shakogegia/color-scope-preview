
import React, { useState, useEffect } from 'react';
import ColorInput from '@/components/ColorInput';
import ColorPreview from '@/components/ColorPreview';
import ColorValue from '@/components/ColorValue';
import Color from 'colorjs.io';

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

const Index = () => {
  const [hexColor, setHexColor] = useState('#0088FF');
  const [p3Value, setP3Value] = useState('');
  const [oklchValue, setOklchValue] = useState('');

  // Convert hex to OKLCH value string using ColorJS
  const calculateOklch = (hex: string) => {
    try {
      const oklch = new Color(hex).to("oklch");
      const roundedCoords = [
        oklch.coords[0].toFixed(3),
        oklch.coords[1].toFixed(3),
        oklch.coords[2].toFixed(1)
      ];
      return `oklch(${roundedCoords[0]} ${roundedCoords[1]} ${roundedCoords[2]})`;
    } catch (e) {
      console.error('OKLCH calculation error:', e);
      return 'oklch(0.5 0 0)';
    }
  };

  // Update color values when hex changes
  useEffect(() => {
    setP3Value(toP3(hexColor) || '');
    setOklchValue(calculateOklch(hexColor));
  }, [hexColor]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-background">
      <div className="max-w-2xl w-full mx-auto">
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-block px-3 py-1 mb-4 bg-secondary text-secondary-foreground rounded-full text-xs font-medium tracking-wide">
            Color Spaces Preview
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Color Space Converter
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Enter a hex color value to see its representation in different color spaces.
          </p>
        </div>
        
        <div className="glass-card rounded-xl overflow-hidden border backdrop-blur-sm p-6 w-full shadow-sm">
          <div className="mb-8 w-full max-w-sm mx-auto">
            <ColorInput value={hexColor} onChange={setHexColor} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <ColorPreview color={hexColor} colorSpace="HEX" />
              <ColorValue label="HEX" value={hexColor} />
            </div>
            
            <div className="flex flex-col items-center space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <ColorPreview color={hexColor} colorSpace="P3" />
              <ColorValue label="P3" value={p3Value} />
            </div>
            
            <div className="flex flex-col items-center space-y-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <ColorPreview color={hexColor} colorSpace="OKLCH" />
              <ColorValue label="OKLCH" value={oklchValue} />
            </div>
          </div>
        </div>
        
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>Click any color value to copy to clipboard</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
