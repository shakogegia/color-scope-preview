
import React, { useState, useEffect } from 'react';
import ColorInput from '@/components/ColorInput';
import ColorPreview from '@/components/ColorPreview';
import ColorValue from '@/components/ColorValue';
import Color from 'colorjs.io';

const Index = () => {
  const [hexColor, setHexColor] = useState('#0088FF');
  const [p3Value, setP3Value] = useState('');
  const [oklchValue, setOklchValue] = useState('');

  // Convert hex to P3 value string using ColorJS
  const calculateP3 = (hex: string) => {
    try {
      const color = new Color(hex);
      const p3 = color.to("p3");
      const coords = [
        p3.coords[0].toFixed(3),
        p3.coords[1].toFixed(3),
        p3.coords[2].toFixed(3)
      ];
      return `color(display-p3 ${coords[0]} ${coords[1]} ${coords[2]})`;
    } catch (e) {
      console.error('P3 calculation error:', e);
      return 'color(display-p3 0 0 0)';
    }
  };

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
