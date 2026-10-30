import React from 'react';
import { Icon } from './Icon';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}

/** MD3 switch with a check icon in the selected handle. */
export function Switch({ checked, onChange, label, className = '' }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`group relative inline-flex h-8 w-[52px] shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-200 ${
        checked ? 'border-primary bg-primary' : 'border-outline bg-surface-container-highest'
      } ${className}`}
    >
      <span
        className={`absolute top-1/2 grid -translate-y-1/2 place-items-center rounded-full transition-all duration-300 ease-spring-fast group-active:h-7 group-active:w-7 ${
          checked
            ? 'start-[22px] h-6 w-6 bg-on-primary text-on-primary-container'
            : 'start-[6px] h-4 w-4 bg-outline group-hover:bg-on-surface-variant'
        }`}
      >
        {checked && <Icon name="check" size={16} weight={600} />}
      </span>
    </button>
  );
}
