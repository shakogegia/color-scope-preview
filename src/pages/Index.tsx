
import React, { useState, useEffect } from 'react';
import ColorInput from '@/components/ColorInput';
import ColorPreview from '@/components/ColorPreview';
import ColorValue from '@/components/ColorValue';

const Index = () => {
  const [hexColor, setHexColor] = useState('#0088FF');
  const [p3Value, setP3Value] = useState('');
  const [oklchValue, setOklchValue] = useState('');

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

  // Convert hex to P3 value string
  const calculateP3 = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 'color(display-p3 0 0 0)';
    
    const r = (rgb.r / 255).toFixed(3);
    const g = (rgb.g / 255).toFixed(3);
    const b = (rgb.b / 255).toFixed(3);
    
    return `color(display-p3 ${r} ${g} ${b})`;
  };

  // Convert hex to OKLCH value string
  const calculateOklch = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 'oklch(0.5 0 0)';
    
    // This is a simplified conversion
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    // Calculate approximate lightness
    const lightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    
    // Calculate approximate chroma
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
    
    // Scale values for OKLCH
    const scaledLight = (lightness * 0.9 + 0.05).toFixed(3);
    const scaledChroma = (chroma * 0.15).toFixed(3);
    const scaledHue = hue.toFixed(1);
    
    return `oklch(${scaledLight} ${scaledChroma} ${scaledHue})`;
  };

  // Update color values when hex changes
  useEffect(() => {
    setP3Value(calculateP3(hexColor));
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
