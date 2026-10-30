import React from 'react';
import { Icon } from './Icon';

interface FilterChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  label: React.ReactNode;
  selected: boolean;
  icon?: string;
}

export function FilterChip({ label, selected, icon, className = '', ...rest }: FilterChipProps) {
  const leading = selected ? 'check' : icon;
  return (
    <button
      data-ripple
      type="button"
      aria-pressed={selected}
      className={`state-layer inline-flex h-8 shrink-0 items-center gap-2 rounded-shape-sm text-label-l whitespace-nowrap cursor-pointer transition-colors duration-200 ${
        leading ? 'ps-2 pe-4' : 'px-4'
      } ${
        selected
          ? 'bg-secondary-container text-on-secondary-container'
          : 'border border-outline-variant text-on-surface-variant'
      } ${className}`}
      {...rest}
    >
      {leading && <Icon name={leading} size={18} className="relative z-[2]" />}
      <span className="relative z-[2]">{label}</span>
    </button>
  );
}

interface AssistChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: React.ReactNode;
  icon?: string;
  iconClassName?: string;
  iconFilled?: boolean;
  elevated?: boolean;
}

export function AssistChip({ label, icon, iconClassName = 'text-primary', iconFilled, elevated, className = '', ...rest }: AssistChipProps) {
  return (
    <button
      data-ripple
      type="button"
      className={`state-layer inline-flex h-8 shrink-0 items-center gap-2 rounded-shape-sm text-label-l text-on-surface whitespace-nowrap cursor-pointer ${
        icon ? 'ps-2 pe-4' : 'px-4'
      } ${elevated ? 'bg-surface-container-low shadow-elevation-1' : 'border border-outline-variant'} ${className}`}
      {...rest}
    >
      {icon && <Icon name={icon} size={18} filled={iconFilled} className={`relative z-[2] ${iconClassName}`} />}
      <span className="relative z-[2]">{label}</span>
    </button>
  );
}

/** Non-interactive label chip (badge-like metadata) */
export function Tag({
  children,
  icon,
  tone = 'surface',
  className = '',
}: {
  children: React.ReactNode;
  icon?: string;
  tone?: 'surface' | 'primary' | 'secondary' | 'tertiary' | 'success' | 'error';
  className?: string;
}) {
  const tones = {
    surface: 'bg-surface-container-highest text-on-surface-variant',
    primary: 'bg-primary-container text-on-primary-container',
    secondary: 'bg-secondary-container text-on-secondary-container',
    tertiary: 'bg-tertiary-container text-on-tertiary-container',
    success: 'bg-success-container text-on-success-container',
    error: 'bg-error-container text-on-error-container',
  };
  return (
    <span className={`inline-flex h-6 items-center gap-1 rounded-shape-sm px-2 text-label-m whitespace-nowrap ${tones[tone]} ${className}`}>
      {icon && <Icon name={icon} size={16} />}
      {children}
    </span>
  );
}
