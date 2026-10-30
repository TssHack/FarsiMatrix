import React from 'react';

export type ShapeKind =
  | 'circle'
  | 'cookie4'
  | 'cookie6'
  | 'cookie9'
  | 'cookie12'
  | 'clover4'
  | 'clover8'
  | 'burst'
  | 'softBurst'
  | 'pentagon'
  | 'sunny'
  | 'flower';

// Polar approximations of the M3 Expressive shape library: r(θ) = 1 + a·cos(kθ)
const SHAPE_PARAMS: Record<ShapeKind, { k: number; a: number; rot?: number }> = {
  circle: { k: 0, a: 0 },
  cookie4: { k: 4, a: 0.09, rot: 45 },
  cookie6: { k: 6, a: 0.075 },
  cookie9: { k: 9, a: 0.06 },
  cookie12: { k: 12, a: 0.045 },
  clover4: { k: 4, a: 0.2, rot: 45 },
  clover8: { k: 8, a: 0.13 },
  burst: { k: 12, a: 0.11 },
  softBurst: { k: 10, a: 0.08 },
  pentagon: { k: 5, a: 0.1, rot: -90 },
  sunny: { k: 8, a: 0.055 },
  flower: { k: 6, a: 0.16 },
};

export const SHAPE_SEQUENCE: ShapeKind[] = ['cookie9', 'clover4', 'softBurst', 'pentagon', 'cookie6', 'flower', 'sunny', 'cookie4', 'burst', 'clover8'];

export function shapePath(kind: ShapeKind, size = 100, points = 120): string {
  const { k, a, rot = 0 } = SHAPE_PARAMS[kind];
  const c = size / 2;
  const base = c / (1 + a);
  const offset = (rot * Math.PI) / 180;
  const pts: string[] = [];
  for (let i = 0; i < points; i++) {
    const th = (2 * Math.PI * i) / points;
    const r = base * (1 + a * Math.cos(k * th));
    pts.push(`${(c + r * Math.cos(th + offset)).toFixed(2)},${(c + r * Math.sin(th + offset)).toFixed(2)}`);
  }
  return `M${pts.join(' L')}Z`;
}

const PATH_CACHE = new Map<ShapeKind, string>();
function cachedPath(kind: ShapeKind) {
  let p = PATH_CACHE.get(kind);
  if (!p) {
    p = shapePath(kind);
    PATH_CACHE.set(kind, p);
  }
  return p;
}

interface ShapeProps {
  kind: ShapeKind;
  size: number;
  className?: string;
  children?: React.ReactNode;
  spin?: boolean;
}

/** An expressive-shape container: the shape takes `currentColor` from className (e.g. text-primary-container). */
export function Shape({ kind, size, className = '', children, spin }: ShapeProps) {
  const position = /(^|\s)(absolute|fixed)(\s|$)/.test(className) ? '' : 'relative';
  return (
    <span className={`${position} inline-grid shrink-0 place-items-center ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        aria-hidden="true"
        className={`absolute inset-0 ${spin ? 'animate-spin-slow' : ''}`}
      >
        <path d={cachedPath(kind)} fill="currentColor" />
      </svg>
      {children !== undefined && <span className="relative">{children}</span>}
    </span>
  );
}
