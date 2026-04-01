import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useInView } from 'framer-motion';

const SKILLS = [
  { label: 'Identity\n& Access', value: 90, tabKey: 'security' },
  { label: 'Automation', value: 85, tabKey: 'automation' },
  { label: 'Cloud\nSecurity', value: 75, tabKey: 'cloud' },
  { label: 'Network\nDefense', value: 80, tabKey: 'cloud' },
  { label: 'Detection\n& SIEM', value: 85, tabKey: 'security' },
  { label: 'Offensive\nSecurity', value: 70, tabKey: 'tools' },
];

const CENTER = 200;
const RADIUS = 140;
const LEVELS = [0.25, 0.5, 0.75, 1];
const N = SKILLS.length;

function polarToCart(angle: number, r: number) {
  const a = (angle - 90) * (Math.PI / 180);
  return { x: CENTER + r * Math.cos(a), y: CENTER + r * Math.sin(a) };
}

function hexPoints(scale: number) {
  return SKILLS.map((_, i) => {
    const angle = (360 / N) * i;
    const { x, y } = polarToCart(angle, RADIUS * scale);
    return `${x},${y}`;
  }).join(' ');
}

function dataPoints(values: number[]) {
  return values.map((v, i) => {
    const angle = (360 / N) * i;
    const { x, y } = polarToCart(angle, RADIUS * (v / 100));
    return `${x},${y}`;
  }).join(' ');
}

interface SkillsRadarProps {
  activeTab?: string;
  onAxisClick?: (tabKey: string) => void;
}

export function SkillsRadar({ activeTab, onAxisClick }: SkillsRadarProps) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const [hovered, setHovered] = useState<number | null>(null);

  // Animation phases: 0=hidden, 1=grid, 2=polygon, 3=dots, 4=labels, 5=done
  const [phase, setPhase] = useState(0);
  const [polyProgress, setPolyProgress] = useState(0);
  const [tabHighlight, setTabHighlight] = useState<string | null>(null);
  const tabHighlightTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Lerp state
  const displayedRef = useRef<number[]>(SKILLS.map(() => 0));
  const targetRef = useRef<number[]>(SKILLS.map(s => s.value));
  const rafRef = useRef<number>(0);
  const [renderTick, setRenderTick] = useState(0);

  // Phased entry
  useEffect(() => {
    if (!isInView) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    setPhase(1);
    timers.push(setTimeout(() => setPhase(2), 800));
    timers.push(setTimeout(() => setPhase(3), 1600));
    timers.push(setTimeout(() => setPhase(4), 2200));
    timers.push(setTimeout(() => setPhase(5), 2500));
    return () => timers.forEach(clearTimeout);
  }, [isInView]);

  // Polygon grow
  useEffect(() => {
    if (phase < 2) return;
    let start: number | null = null;
    let raf: number;
    const duration = 800;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setPolyProgress(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  // Update targets
  useEffect(() => {
    const base = SKILLS.map(s => s.value);
    if (hovered !== null) {
      targetRef.current = base.map((v, i) => (i === hovered ? 100 : v * 0.6));
    } else if (tabHighlight) {
      targetRef.current = base.map((v, i) => (SKILLS[i].tabKey === tabHighlight ? 100 : v * 0.5));
    } else {
      targetRef.current = base;
    }
  }, [hovered, tabHighlight]);

  // Lerp loop — stops when settled
  useEffect(() => {
    if (phase < 2) return;

    const lerp = () => {
      let needsUpdate = false;
      const displayed = displayedRef.current;
      const target = targetRef.current;
      for (let i = 0; i < N; i++) {
        const t = target[i] * polyProgress;
        const diff = t - displayed[i];
        if (Math.abs(diff) > 0.3) {
          displayed[i] += diff * 0.12;
          needsUpdate = true;
        } else {
          displayed[i] = t;
        }
      }
      setRenderTick(prev => prev + 1);
      if (needsUpdate) {
        rafRef.current = requestAnimationFrame(lerp);
      }
    };
    rafRef.current = requestAnimationFrame(lerp);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, polyProgress, hovered, tabHighlight]);

  const animatedValues = displayedRef.current;

  // Tab highlight from parent
  const prevTabRef = useRef(activeTab);
  useEffect(() => {
    if (activeTab && activeTab !== prevTabRef.current && phase >= 5) {
      setTabHighlight(activeTab);
      clearTimeout(tabHighlightTimeout.current);
      tabHighlightTimeout.current = setTimeout(() => setTabHighlight(null), 1500);
    }
    prevTabRef.current = activeTab;
  }, [activeTab, phase]);

  const handleAxisClick = useCallback((i: number) => {
    onAxisClick?.(SKILLS[i].tabKey);
  }, [onAxisClick]);

  const handleAxisHover = useCallback((i: number | null) => {
    setHovered(i);
  }, []);

  const isIdle = hovered === null && !tabHighlight && phase >= 5;

  return (
    <div className="w-full max-w-md mx-auto relative overflow-hidden">
      <svg ref={ref} viewBox="0 0 400 400" className="w-full h-auto max-w-[360px] mx-auto sm:max-w-none">
        <defs>
          <linearGradient id="radar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00e5ff" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        {/* Grid hexagons */}
        {LEVELS.map((l, li) => {
          const visible = phase >= 1;
          return (
            <polygon
              key={l}
              points={hexPoints(l)}
              fill="none"
              stroke="rgba(0, 229, 255, 0.06)"
              strokeWidth={1}
              opacity={visible ? 1 : 0}
              style={{ transition: `opacity 0.4s ease-out ${li * 0.15}s` }}
            />
          );
        })}

        {/* Axis lines */}
        {SKILLS.map((_, i) => {
          const angle = (360 / N) * i;
          const { x, y } = polarToCart(angle, RADIUS);
          return (
            <line
              key={i}
              x1={CENTER} y1={CENTER} x2={x} y2={y}
              stroke="rgba(0, 229, 255, 0.06)"
              strokeWidth={1}
              opacity={phase >= 1 ? 1 : 0}
              style={{ transition: 'opacity 0.3s ease-out' }}
            />
          );
        })}

        {/* Data polygon */}
        {phase >= 2 && (
          <polygon
            points={dataPoints(animatedValues)}
            fill="url(#radar-gradient)"
            fillOpacity={isIdle ? undefined : 0.2}
            stroke="url(#radar-gradient)"
            strokeWidth={2}
            style={isIdle ? { animation: 'radarBreathe 3s ease-in-out infinite' } : undefined}
          />
        )}

        {/* Axis endpoints + labels */}
        {SKILLS.map((skill, i) => {
          const angle = (360 / N) * i;
          const pointR = RADIUS * (animatedValues[i] / 100);
          const { x: px, y: py } = polarToCart(angle, pointR);
          const { x: lx, y: ly } = polarToCart(angle, RADIUS + 28);
          const isHov = hovered === i;
          const isHighlighted = tabHighlight === skill.tabKey;
          const lines = skill.label.split('\n');

          const dotVisible = phase >= 3;
          const labelVisible = phase >= 4;
          const dotDelay = i * 0.1;

          return (
            <g key={i}>
              {/* Label */}
              <text
                x={lx} y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={10}
                fontFamily="ui-monospace, monospace"
                fill={isHov || isHighlighted ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))'}
                opacity={labelVisible ? 1 : 0}
                style={{ transition: 'opacity 0.3s ease-out, fill 0.2s ease-out' }}
              >
                {lines.map((line, li) => (
                  <tspan key={li} x={lx} dy={li === 0 ? 0 : 13}>{line}</tspan>
                ))}
              </text>

              {/* Hit area */}
              <circle
                cx={px} cy={py} r={20}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => handleAxisHover(i)}
                onMouseLeave={() => handleAxisHover(null)}
                onClick={() => handleAxisClick(i)}
                onTouchStart={() => {
                  handleAxisHover(hovered === i ? null : i);
                  handleAxisClick(i);
                }}
              />

              {/* Visible dot — opacity pulse instead of transform scale */}
              <circle
                cx={px} cy={py}
                r={isHov ? 10 : 6}
                fill="#00e5ff"
                opacity={dotVisible ? 1 : 0}
                style={{
                  transition: `opacity 0.2s ease-out ${dotDelay}s`,
                  filter: isHov ? 'drop-shadow(0 0 8px #00e5ff)' : 'none',
                  ...(isIdle && dotVisible ? {
                    animation: `dotPulseOpacity 2s ease-in-out ${i * 0.3}s infinite`,
                  } : {}),
                }}
              />

              {/* Tooltip */}
              {isHov && (
                <g style={{ animation: 'tooltipIn 0.2s ease-out' }}>
                  <foreignObject x={px - 70} y={py - 60} width={140} height={52}>
                    <div
                      style={{
                        background: 'rgba(15,23,42,0.9)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '11px', fontFamily: 'ui-monospace, monospace' }}>
                          {skill.label.replace('\n', ' ')}
                        </span>
                        <span style={{ color: '#00e5ff', fontWeight: 700, fontSize: '11px', fontFamily: 'ui-monospace, monospace' }}>
                          {skill.value}%
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                        <div style={{ width: `${skill.value}%`, height: '100%', borderRadius: '2px', background: 'linear-gradient(90deg, #00e5ff, #a855f7)' }} />
                      </div>
                    </div>
                  </foreignObject>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      <style>{`
        @keyframes radarBreathe {
          0%, 100% { fill-opacity: 0.15; }
          50% { fill-opacity: 0.25; }
        }
        @keyframes dotPulseOpacity {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes tooltipIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
