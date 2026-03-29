import { useState, useEffect, useRef, useCallback } from 'react';
import { useInView } from 'framer-motion';

const SKILLS = [
  { label: 'Identity\n& Access', value: 90 },
  { label: 'Automation', value: 85 },
  { label: 'Cloud\nSecurity', value: 75 },
  { label: 'Network\nDefense', value: 80 },
  { label: 'Detection\n& SIEM', value: 85 },
  { label: 'Offensive\nSecurity', value: 70 },
];

const CENTER = 200;
const RADIUS = 140;
const LEVELS = [0.25, 0.5, 0.75, 1];

function polarToCart(angle: number, r: number) {
  const a = (angle - 90) * (Math.PI / 180);
  return { x: CENTER + r * Math.cos(a), y: CENTER + r * Math.sin(a) };
}

function hexPoints(scale: number) {
  return SKILLS.map((_, i) => {
    const angle = (360 / SKILLS.length) * i;
    const { x, y } = polarToCart(angle, RADIUS * scale);
    return `${x},${y}`;
  }).join(' ');
}

function dataPoints(values: number[]) {
  return values.map((v, i) => {
    const angle = (360 / SKILLS.length) * i;
    const { x, y } = polarToCart(angle, RADIUS * (v / 100));
    return `${x},${y}`;
  }).join(' ');
}

export function SkillsRadar() {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    if (!isInView) return;
    let start: number | null = null;
    let raf: number;
    const duration = 1000;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      // ease out cubic
      setProgress(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isInView]);

  const animatedValues = SKILLS.map(s => s.value * progress);

  return (
    <div className="w-full max-w-md mx-auto relative">
      <svg ref={ref} viewBox="0 0 400 400" className="w-full h-auto">
        <defs>
          <linearGradient id="radar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" />
          </linearGradient>
        </defs>

        {/* Grid hexagons */}
        {LEVELS.map(l => (
          <polygon
            key={l}
            points={hexPoints(l)}
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeOpacity={0.1}
            strokeWidth={1}
          />
        ))}

        {/* Axis lines */}
        {SKILLS.map((_, i) => {
          const angle = (360 / SKILLS.length) * i;
          const { x, y } = polarToCart(angle, RADIUS);
          return (
            <line
              key={i}
              x1={CENTER} y1={CENTER} x2={x} y2={y}
              stroke="hsl(var(--muted-foreground))"
              strokeOpacity={0.08}
              strokeWidth={1}
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={dataPoints(animatedValues)}
          fill="url(#radar-gradient)"
          fillOpacity={0.2}
          stroke="url(#radar-gradient)"
          strokeWidth={2}
        />

        {/* Axis endpoints + labels */}
        {SKILLS.map((skill, i) => {
          const angle = (360 / SKILLS.length) * i;
          const pointR = RADIUS * (animatedValues[i] / 100);
          const { x: px, y: py } = polarToCart(angle, pointR);
          const { x: lx, y: ly } = polarToCart(angle, RADIUS + 28);
          const isHov = hovered === i;
          const lines = skill.label.split('\n');

          return (
            <g key={i}>
              {/* Label */}
              <text
                x={lx} y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground font-mono"
                fontSize={10}
              >
                {lines.map((line, li) => (
                  <tspan key={li} x={lx} dy={li === 0 ? 0 : 13}>{line}</tspan>
                ))}
              </text>

              {/* Hit area */}
              <circle
                cx={px} cy={py} r={16}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />

              {/* Visible dot */}
              <circle
                cx={px} cy={py}
                r={isHov ? 6 : 4}
                fill="url(#radar-gradient)"
                className="transition-all duration-200"
                style={{ filter: isHov ? 'drop-shadow(0 0 6px hsl(var(--primary)))' : 'none' }}
              />

              {/* Tooltip */}
              {isHov && (
                <g>
                  <rect
                    x={px - 55} y={py - 42}
                    width={110} height={34}
                    rx={6}
                    fill="hsl(var(--card))"
                    stroke="hsl(var(--border))"
                    strokeWidth={1}
                  />
                  <text
                    x={px} y={py - 30}
                    textAnchor="middle"
                    className="fill-foreground font-mono"
                    fontSize={10}
                    fontWeight={600}
                  >
                    {skill.label.replace('\n', ' ')}
                  </text>
                  {/* Percentage bar bg */}
                  <rect x={px - 40} y={py - 20} width={80} height={4} rx={2} fill="hsl(var(--muted))" />
                  {/* Percentage bar fill */}
                  <rect x={px - 40} y={py - 20} width={80 * (skill.value / 100)} height={4} rx={2} fill="url(#radar-gradient)" />
                  <text x={px + 45} y={py - 16} className="fill-muted-foreground font-mono" fontSize={9}>
                    {skill.value}%
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
