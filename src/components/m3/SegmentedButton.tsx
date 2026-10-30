import React from 'react';
import { Icon } from './Icon';

export interface SegmentOption<T extends string | number> {
  value: T;
  label: React.ReactNode;
  icon?: string;
}

interface SegmentedButtonProps<T extends string | number> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
  showCheck?: boolean;
}

export function SegmentedButton<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
  className = '',
  showCheck = true,
}: SegmentedButtonProps<T>) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={`flex h-10 rounded-full border border-outline ${className}`}>
      {options.map((opt, idx) => {
        const selected = opt.value === value;
        const icon = selected && showCheck ? 'check' : opt.icon;
        return (
          <button
            key={String(opt.value)}
            data-ripple
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={`state-layer flex flex-1 min-w-0 items-center justify-center gap-1.5 px-3 text-label-l cursor-pointer transition-colors duration-200 ${
              idx > 0 ? 'border-s border-outline' : ''
            } ${idx === 0 ? 'rounded-s-full' : ''} ${idx === options.length - 1 ? 'rounded-e-full' : ''} ${
              selected ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface'
            }`}
          >
            {icon && <Icon name={icon} size={18} className="relative z-[2]" />}
            <span className="relative z-[2] truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
