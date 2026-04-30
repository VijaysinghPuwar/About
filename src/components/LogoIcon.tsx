import { useId } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

interface LogoIconProps {
  size?: number;
  className?: string;
}

const HEX_PATH = 'M20 2 L36.66 11 L36.66 29 L20 38 L3.34 29 L3.34 11 Z';

export function LogoIcon({ size = 36, className }: LogoIconProps) {
  const uid = useId();
  const { isPentest, isTransitioning } = useTheme();

  const stop1 = isPentest ? '#f43f5e' : '#3b82f6';
  const stop2 = isPentest ? '#fb923c' : '#a855f7';
  const gradientId = `hex-grad-${uid}`;
  const fontPx = Math.round(size * 0.36);

  return (
    <div
      className={cn('group relative inline-flex items-center justify-center', className)}
      style={{
        width: size,
        height: size,
        transition: 'filter 0.4s ease-out, transform 0.3s ease-out',
        filter: isTransitioning ? `drop-shadow(0 0 12px ${stop1}) drop-shadow(0 0 4px ${stop2})` : 'none',
        transform: isTransitioning ? 'scale(1.06)' : 'scale(1)',
      }}
    >
      <svg
        viewBox="0 0 40 40"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="geometricPrecision"
        className="absolute inset-0"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={stop1} style={{ transition: 'stop-color 0.4s ease-out' }} />
            <stop offset="100%" stopColor={stop2} style={{ transition: 'stop-color 0.4s ease-out' }} />
          </linearGradient>
        </defs>
        <path
          d={HEX_PATH}
          stroke={`url(#${gradientId})`}
          strokeWidth="1.5"
          fill="none"
          vectorEffect="non-scaling-stroke"
          className="transition-all duration-300 group-hover:[stroke-opacity:1]"
        />
      </svg>

      <span
        aria-hidden="true"
        className="relative z-10 select-none leading-none font-bold tracking-tight"
        style={{
          fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
          fontSize: `${fontPx}px`,
          letterSpacing: '-0.02em',
        }}
      >
        <span
          className="transition-colors duration-300 group-hover:!text-white"
          style={{ color: stop1, transition: 'color 0.4s ease-out' }}
        >V</span>
        <span
          className="transition-colors duration-300 group-hover:!text-white"
          style={{ color: stop2, transition: 'color 0.4s ease-out' }}
        >J</span>
      </span>
    </div>
  );
}
