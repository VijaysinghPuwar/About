import { cn } from '@/lib/utils';

interface LogoIconProps {
  size?: number;
  className?: string;
}

const HEX_PATH = 'M20 2 L36.66 11 L36.66 29 L20 38 L3.34 29 L3.34 11 Z';

export function LogoIcon({ size = 36, className }: LogoIconProps) {
  return (
    <div className={cn('group inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 40 40"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="hex-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00e5ff" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        <path
          d={HEX_PATH}
          stroke="url(#hex-gradient)"
          strokeWidth="1.5"
          fill="none"
          className="transition-all duration-300 group-hover:[stroke-opacity:1]"
        />

        <text
          x="19"
          y="20"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="'Space Grotesk', system-ui, sans-serif"
          fontWeight="700"
          fontSize="18"
          letterSpacing="-0.8"
        >
          <tspan fill="#00e5ff" className="transition-colors duration-300 group-hover:fill-white" style={{ transition: 'fill 0.3s ease' }}>V</tspan>
          <tspan fill="#a855f7" className="transition-colors duration-300 group-hover:fill-white" style={{ transition: 'fill 0.3s ease' }}>P</tspan>
        </text>
      </svg>
    </div>
  );
}
