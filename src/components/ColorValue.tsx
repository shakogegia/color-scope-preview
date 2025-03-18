
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckIcon, CopyIcon } from 'lucide-react';

interface ColorValueProps {
  label: string;
  value: string;
  className?: string;
}

const ColorValue: React.FC<ColorValueProps> = ({ 
  label,
  value,
  className 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };

  return (
    <div className="w-full">
      <div className="color-label">{label}</div>
      <div 
        className={cn(
          "color-value flex items-center justify-between group cursor-pointer",
          className
        )}
        onClick={handleCopy}
      >
        <span className="mr-2 overflow-x-auto scrollbar-none">{value}</span>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
          {copied ? (
            <CheckIcon size={14} className="text-green-500" />
          ) : (
            <CopyIcon size={14} className="text-muted-foreground" />
          )}
        </span>
      </div>
    </div>
  );
};

export default ColorValue;
