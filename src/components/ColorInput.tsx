
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ColorInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const ColorInput: React.FC<ColorInputProps> = ({ value, onChange, className }) => {
  const [inputValue, setInputValue] = useState(value);
  const [isValid, setIsValid] = useState(true);

  // Validate hex color
  const validateHexColor = (color: string): boolean => {
    return /^#([A-Fa-f0-9]{3}){1,2}$/.test(color);
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Add # prefix if user starts typing without it
    if (newValue.length > 0 && !newValue.startsWith('#')) {
      const valueWithHash = `#${newValue}`;
      setInputValue(valueWithHash);
      setIsValid(validateHexColor(valueWithHash));
      if (validateHexColor(valueWithHash)) {
        onChange(valueWithHash);
      }
      return;
    }
    
    setIsValid(validateHexColor(newValue));
    if (validateHexColor(newValue)) {
      onChange(newValue);
    }
  };

  // Handle blur event
  const handleBlur = () => {
    // Convert 3-char hex to 6-char hex
    if (inputValue.length === 4 && validateHexColor(inputValue)) {
      const expandedHex = `#${inputValue[1]}${inputValue[1]}${inputValue[2]}${inputValue[2]}${inputValue[3]}${inputValue[3]}`;
      setInputValue(expandedHex);
      onChange(expandedHex);
    }
    
    // If empty, reset to #000000
    if (inputValue === '' || inputValue === '#') {
      setInputValue('#000000');
      setIsValid(true);
      onChange('#000000');
    }
  };

  // Update local state when prop changes externally
  useEffect(() => {
    if (value !== inputValue && validateHexColor(value)) {
      setInputValue(value);
      setIsValid(true);
    }
  }, [value]);

  return (
    <div className="w-full space-y-2">
      <label className="color-label">Hex Color</label>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="#000000"
        className={cn(
          "color-input",
          isValid ? "" : "border-destructive focus:ring-destructive/20 focus:border-destructive",
          className
        )}
        aria-invalid={!isValid}
        maxLength={7}
        spellCheck={false}
        autoComplete="off"
      />
      {!isValid && (
        <p className="text-destructive text-xs mt-1 animate-fade-in">
          Please enter a valid hex color (e.g., #FF0000)
        </p>
      )}
    </div>
  );
};

export default ColorInput;
