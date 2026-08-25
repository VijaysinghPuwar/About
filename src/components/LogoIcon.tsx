import { cn } from '@/lib/utils';

interface LogoIconProps {
  size?: number;
  className?: string;
  /** Renders the full name beside the mark. Used in the nav. */
  withName?: boolean;
}

const HEX_PATH = 'M20 3.6 L34.2 11.8 L34.2 28.2 L20 36.4 L5.8 28.2 L5.8 11.8 Z';

/**
 * Vijaysingh Puwar. The mark read VJ — two letters of the first name — while
 * the account avatar beside it derived VP from the same name, so the header
 * showed a person two different sets of initials. Exported so the favicon and
 * anything else that spells them out has one place to read them from.
 */
export const INITIALS = 'VP';

/**
 * Hex outline in the accent colour, initials in the foreground. Single stroke,
 * no gradient fill, no drop-shadow, no hue-rotate on theme change — it inherits
 * the active theme through the token, which is the point of having one accent.
 */
export function LogoIcon({ size = 26, className, withName = false }: LogoIconProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg
        viewBox="0 0 40 40"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="geometricPrecision"
        role="img"
        aria-label="Vijaysingh Puwar"
        className="shrink-0"
      >
        <title>Vijaysingh Puwar</title>
        <path
          d={HEX_PATH}
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        <text
          x="20"
          y="25.4"
          textAnchor="middle"
          style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: '13.5px',
            fontWeight: 600,
            letterSpacing: '-0.03em',
            fill: 'hsl(var(--foreground))',
          }}
        >
          {INITIALS}
        </text>
      </svg>
      {withName && (
        <span className="text-[14.5px] font-medium tracking-[-0.008em] text-foreground">
          Vijaysingh Puwar
        </span>
      )}
    </span>
  );
}
