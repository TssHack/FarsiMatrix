import React from 'react';

interface IconProps {
  name: string;
  filled?: boolean;
  size?: number;
  weight?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Icon({ name, filled = false, size = 24, weight = 400, className = '', style }: IconProps) {
  const opsz = Math.min(48, Math.max(20, size));
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-rounded ${className}`}
      style={{
        fontSize: size,
        width: size,
        height: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${opsz}`,
        ...style,
      }}
    >
      {name}
    </span>
  );
}
