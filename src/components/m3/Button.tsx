import React from 'react';
import { Icon } from './Icon';

export type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated' | 'tertiary' | 'error' | 'success';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

const VARIANT: Record<ButtonVariant, string> = {
  filled: 'bg-primary text-on-primary hover:shadow-elevation-1',
  tonal: 'bg-secondary-container text-on-secondary-container hover:shadow-elevation-1',
  outlined: 'border border-outline-variant text-on-surface-variant disabled:border-on-surface/12',
  text: 'text-primary',
  elevated: 'bg-surface-container-low text-primary shadow-elevation-1 hover:shadow-elevation-2',
  tertiary: 'bg-tertiary-container text-on-tertiary-container hover:shadow-elevation-1',
  error: 'bg-error-container text-on-error-container hover:shadow-elevation-1',
  success: 'bg-success-container text-on-success-container hover:shadow-elevation-1',
};

const SIZE: Record<ButtonSize, { box: string; icon: number }> = {
  xs: { box: 'h-8 px-3 gap-1 text-label-l', icon: 18 },
  sm: { box: 'h-10 px-5 gap-2 text-label-l', icon: 20 },
  md: { box: 'h-14 px-6 gap-2 text-title-m', icon: 24 },
  lg: { box: 'h-24 px-12 gap-3 text-headline-s', icon: 32 },
};

const BASE =
  'state-layer shape-morph inline-flex items-center justify-center rounded-full select-none cursor-pointer whitespace-nowrap ' +
  'disabled:cursor-not-allowed disabled:shadow-none disabled:bg-on-surface/12 disabled:text-on-surface/38';

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  trailingIcon?: string;
  iconFilled?: boolean;
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
};

type ButtonProps = CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AnchorProps = CommonProps & React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function Button(props: ButtonProps | AnchorProps) {
  const {
    variant = 'filled',
    size = 'sm',
    icon,
    trailingIcon,
    iconFilled,
    fullWidth,
    className = '',
    children,
    ...rest
  } = props;
  const s = SIZE[size];
  const classes = `${BASE} ${VARIANT[variant]} ${s.box} ${fullWidth ? 'w-full' : ''} ${
    variant === 'text' && size === 'sm' ? '!px-3' : ''
  } ${className}`;
  const content = (
    <>
      {icon && <Icon name={icon} size={s.icon} filled={iconFilled} className="relative z-[2]" />}
      {children !== undefined && <span className="relative z-[2]">{children}</span>}
      {trailingIcon && <Icon name={trailingIcon} size={s.icon} className="relative z-[2]" />}
    </>
  );

  if ('href' in rest && rest.href !== undefined) {
    return (
      <a data-ripple className={classes} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {content}
      </a>
    );
  }
  return (
    <button data-ripple type="button" className={classes} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {content}
    </button>
  );
}

export type IconButtonVariant = 'standard' | 'filled' | 'tonal' | 'outlined';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  label: string;
  variant?: IconButtonVariant;
  selected?: boolean;
  size?: 'sm' | 'md' | 'lg';
  filledIcon?: boolean;
}

const ICON_BUTTON_SIZE = {
  sm: { box: 'h-8 w-8', icon: 20 },
  md: { box: 'h-10 w-10', icon: 24 },
  lg: { box: 'h-14 w-14', icon: 28 },
};

export function IconButton({
  icon,
  label,
  variant = 'standard',
  selected,
  size = 'md',
  filledIcon,
  className = '',
  ...rest
}: IconButtonProps) {
  const isToggle = selected !== undefined;
  let colors: string;
  switch (variant) {
    case 'filled':
      colors = isToggle && !selected ? 'bg-surface-container-highest text-primary' : 'bg-primary text-on-primary';
      break;
    case 'tonal':
      colors = isToggle && !selected
        ? 'bg-surface-container-highest text-on-surface-variant'
        : 'bg-secondary-container text-on-secondary-container';
      break;
    case 'outlined':
      colors = selected ? 'bg-inverse-surface text-inverse-on-surface' : 'border border-outline-variant text-on-surface-variant';
      break;
    default:
      colors = selected ? 'text-primary' : 'text-on-surface-variant';
  }
  const s = ICON_BUTTON_SIZE[size];
  return (
    <button
      data-ripple
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={isToggle ? selected : undefined}
      className={`state-layer shape-morph inline-flex items-center justify-center rounded-full cursor-pointer shrink-0 disabled:cursor-not-allowed disabled:text-on-surface/38 ${s.box} ${colors} ${className}`}
      {...rest}
    >
      <Icon name={icon} size={s.icon} filled={filledIcon ?? (isToggle ? selected : false)} className="relative z-[2]" />
    </button>
  );
}
