import React from 'react';
import { shapePath, ShapeKind } from './Shape';

interface LinearProgressProps {
  value: number; // 0..1
  label: string;
  wavy?: boolean;
  className?: string;
}

/** MD3 (2024) linear progress: rounded indicator, gap, track and stop indicator; optional Expressive wave. */
export function LinearProgress({ value, label, wavy = false, className = '' }: LinearProgressProps) {
  const v = Math.min(1, Math.max(0, value));
  const height = wavy ? 10 : 4;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v * 100)}
      className={`flex w-full items-center ${className}`}
      style={{ height }}
    >
      {v > 0 && (
        <div
          className="relative h-full overflow-hidden transition-[flex-grow] duration-500 ease-emphasized"
          style={{ flexGrow: v, flexBasis: 0 }}
        >
          {wavy ? (
            <svg className="absolute inset-y-0 start-0 h-full" width="2000" viewBox="0 0 2000 10" preserveAspectRatio="none" aria-hidden="true">
              <path className="wave-path" d={WAVE_PATH} fill="none" stroke="var(--md-sys-color-primary)" strokeWidth="4" strokeLinecap="round" />
            </svg>
          ) : (
            <div className="h-full w-full rounded-full bg-primary" />
          )}
        </div>
      )}
      {v > 0 && v < 1 && <div className="w-1 shrink-0" />}
      {v < 1 && (
        <div
          className="relative h-1 rounded-full bg-secondary-container transition-[flex-grow] duration-500 ease-emphasized"
          style={{ flexGrow: 1 - v, flexBasis: 0 }}
        >
          <span className="absolute end-0 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-primary" />
        </div>
      )}
    </div>
  );
}

const WAVE_PATH = (() => {
  const pts: string[] = [];
  for (let x = 0; x <= 2040; x += 2) {
    const y = 5 + 3 * Math.sin((x / 24) * 2 * Math.PI);
    pts.push(`${x},${y.toFixed(2)}`);
  }
  return `M${pts.join(' L')}`;
})();

interface CircularProgressProps {
  value: number; // 0..1
  size?: number;
  thickness?: number;
  label: string;
  children?: React.ReactNode;
  className?: string;
  indicatorClassName?: string;
}

/** MD3 (2024) determinate circular progress with a gap between indicator and track. */
export function CircularProgress({
  value,
  size = 48,
  thickness = 4,
  label,
  children,
  className = '',
  indicatorClassName = 'text-primary',
}: CircularProgressProps) {
  const v = Math.min(1, Math.max(0, value));
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const gap = v > 0 && v < 1 ? thickness * 1.6 : 0;
  const indicator = Math.max(0, v * c - gap);
  const track = Math.max(0, c - v * c - gap);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v * 100)}
      className={`relative inline-grid place-items-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="absolute inset-0 -rotate-90" aria-hidden="true">
        {track > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--md-sys-color-secondary-container)"
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={`${track} ${c}`}
            strokeDashoffset={-(v * c + gap / 2)}
          />
        )}
        {indicator > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            className={`${indicatorClassName} transition-[stroke-dasharray] duration-700 ease-emphasized`}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={`${indicator} ${c}`}
            strokeDashoffset={-gap / 2}
          />
        )}
      </svg>
      {children !== undefined && <div className="relative">{children}</div>}
    </div>
  );
}

const LOADER_SHAPES: ShapeKind[] = ['softBurst', 'cookie9', 'pentagon', 'clover4', 'sunny', 'cookie4', 'flower', 'softBurst'];
const LOADER_PATHS = LOADER_SHAPES.map((k) => shapePath(k, 100, 96)).join(';');

/** M3 Expressive loading indicator: a contained shape that morphs while rotating. */
export function LoadingIndicator({ size = 48, label, contained = true }: { size?: number; label: string; contained?: boolean }) {
  const inner = contained ? size * 0.7 : size;
  return (
    <div
      role="progressbar"
      aria-label={label}
      className={`grid place-items-center rounded-full ${contained ? 'bg-primary-container text-on-primary-container' : 'text-primary'}`}
      style={{ width: size, height: size }}
    >
      <svg width={inner} height={inner} viewBox="0 0 100 100" aria-hidden="true">
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="2.8s" repeatCount="indefinite" />
          <path fill="currentColor">
            <animate
              attributeName="d"
              dur="5.6s"
              repeatCount="indefinite"
              values={LOADER_PATHS}
              calcMode="spline"
              keySplines={Array(LOADER_SHAPES.length - 1).fill('0.4 0 0.2 1').join(';')}
            />
          </path>
        </g>
      </svg>
    </div>
  );
}
