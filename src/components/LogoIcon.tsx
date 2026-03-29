import { cn } from '@/lib/utils';

interface LogoIconProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

const HEX_PATH = 'M20 2 L36.66 11 L36.66 29 L20 38 L3.34 29 L3.34 11 Z';
const HEX_GLOW_PATH = 'M20 0.5 L37.86 10.25 L37.86 29.75 L20 39.5 L2.14 29.75 L2.14 10.25 Z';

export function LogoIcon({ size = 40, className, animated = false }: LogoIconProps) {
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

        {/* Outer glow hexagon */}
        <path
          d={HEX_GLOW_PATH}
          stroke="url(#hex-gradient)"
          strokeWidth="0.8"
          strokeOpacity="0.15"
          fill="none"
          className={cn(
            'origin-center transition-transform duration-300',
            animated && 'animate-logo-rotate group-hover:scale-[1.15]'
          )}
          style={{ transformOrigin: '20px 20px' }}
        />

        {/* Inner hexagon */}
        <path
          d={HEX_PATH}
          stroke="url(#hex-gradient)"
          strokeWidth="1.2"
          fill="none"
          className="transition-all duration-300 group-hover:[stroke-opacity:1]"
        />

        {/* V letter */}
        <text
          x="14.5"
          y="26"
          fontFamily="'Space Grotesk', system-ui, sans-serif"
          fontWeight="700"
          fontSize="15"
          fill="#00e5ff"
          className="transition-colors duration-300 group-hover:fill-white"
          style={{ transition: 'fill 0.3s ease' }}
        >
          V
        </text>

        {/* P letter */}
        <text
          x="22"
          y="26"
          fontFamily="'Space Grotesk', system-ui, sans-serif"
          fontWeight="700"
          fontSize="15"
          fill="#a855f7"
          className="transition-colors duration-300 group-hover:fill-white"
          style={{ transition: 'fill 0.3s ease' }}
        >
          P
        </text>
      </svg>
    </div>
  );
}
