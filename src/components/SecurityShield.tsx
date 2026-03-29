import { Lock, Terminal, Cloud, Shield } from 'lucide-react';

const orbitIcons = [
  { Icon: Lock, delay: '0s' },
  { Icon: Terminal, delay: '-7.5s' },
  { Icon: Cloud, delay: '-15s' },
  { Icon: Shield, delay: '-22.5s' },
];

export function SecurityShield() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Glow backdrops */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-primary/[0.06] blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 left-2/3 w-[200px] h-[200px] rounded-full bg-secondary/[0.05] blur-[80px] pointer-events-none" />

      {/* Shield container with slow rotation */}
      <div className="relative w-[340px] h-[340px] animate-shield-rotate">
        <svg viewBox="0 0 400 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
              <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="shield-grad-inner" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Outer hexagon */}
          <polygon
            points="200,40 340,110 340,250 200,360 60,250 60,110"
            fill="none"
            stroke="url(#shield-grad)"
            strokeWidth="1.5"
            className="animate-shield-pulse"
          />

          {/* Mid hexagon */}
          <polygon
            points="200,80 310,135 310,235 200,320 90,235 90,135"
            fill="none"
            stroke="url(#shield-grad-inner)"
            strokeWidth="1"
            opacity="0.6"
          />

          {/* Inner hexagon */}
          <polygon
            points="200,120 280,160 280,220 200,280 120,220 120,160"
            fill="url(#shield-grad)"
            fillOpacity="0.08"
            stroke="url(#shield-grad)"
            strokeWidth="0.8"
            opacity="0.8"
          />

          {/* Circuit lines */}
          {[
            'M200,40 L200,80', 'M340,110 L310,135', 'M340,250 L310,235',
            'M200,360 L200,320', 'M60,250 L90,235', 'M60,110 L90,135',
          ].map((d, i) => (
            <path key={i} d={d} stroke="url(#shield-grad)" strokeWidth="0.5" opacity="0.4" />
          ))}

          {/* Center keyhole / shield icon */}
          <circle cx="200" cy="185" r="18" fill="none" stroke="url(#shield-grad)" strokeWidth="1.5" opacity="0.7" />
          <rect x="195" y="200" width="10" height="22" rx="2" fill="url(#shield-grad)" opacity="0.5" />

          {/* Circuit dots at vertices */}
          {[
            [200, 40], [340, 110], [340, 250], [200, 360], [60, 250], [60, 110],
          ].map(([cx, cy], i) => (
            <circle key={`dot-${i}`} cx={cx} cy={cy} r="3" fill="url(#shield-grad)" opacity="0.6" />
          ))}
        </svg>
      </div>

      {/* Orbiting icons */}
      {orbitIcons.map(({ Icon, delay }, i) => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2 w-0 h-0"
          style={{
            animation: `orbit 30s linear infinite`,
            animationDelay: delay,
          }}
        >
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-lg glass-card flex items-center justify-center"
            style={{ top: '-170px', left: '0px' }}
          >
            <Icon className="w-4 h-4 text-primary/70" />
          </div>
        </div>
      ))}
    </div>
  );
}
