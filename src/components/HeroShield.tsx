import { useRef, useEffect, useState, useCallback } from 'react';
import { Lock, Terminal, Cloud, Shield, CheckCircle } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';

/* ── Hexagon SVG path generator ── */
function hexPath(size: number): string {
  const r = size / 2;
  const cx = 0, cy = 0;
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ') + ' Z';
}

/* ── Layer config ── */
const layers = [
  { size: 380, stroke: '#00e5ff', opacity: 0.15, baseRotation: 0,  tiltMul: 1.0, idleSpeed: 30,  idleDir: 1  },
  { size: 280, stroke: '#a855f7', opacity: 0.2,  baseRotation: 15, tiltMul: 0.7, idleSpeed: 25,  idleDir: -1 },
  { size: 180, stroke: '#00e5ff', opacity: 0.3,  baseRotation: 30, tiltMul: 0.4, idleSpeed: 20,  idleDir: 1  },
  { size: 100, stroke: '#00e5ff', opacity: 0.1,  baseRotation: 0,  tiltMul: 0.2, idleSpeed: 0,   idleDir: 0, fill: true },
];

/* ── Orbit icon config ── */
const orbitItems = [
  { Icon: Terminal, offsetDeg: 0,   speed: 20 },
  { Icon: Shield,   offsetDeg: 90,  speed: 25 },
  { Icon: Cloud,    offsetDeg: 180, speed: 22 },
  { Icon: Lock,     offsetDeg: 270, speed: 28 },
];

const ORBIT_RADIUS = 190;
const SCATTER_EXTRA = 40;

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

export function HeroShield() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const tiltTarget = useRef({ x: 0, y: 0 });
  const tiltCurrent = useRef({ x: 0, y: 0 });
  const isHovering = useRef(false);
  const isMobile = useRef(false);
  const startTime = useRef(Date.now());

  const [hovering, setHovering] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [orbitPositions, setOrbitPositions] = useState<{ x: number; y: number }[]>(
    orbitItems.map(() => ({ x: 0, y: 0 }))
  );
  const [pulses, setPulses] = useState<number[]>([]);
  const [flashing, setFlashing] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    isMobile.current = window.matchMedia('(max-width: 767px)').matches;
  }, []);

  /* ── RAF loop: tilt lerp + orbit positions ── */
  useEffect(() => {
    if (reducedMotion) return;
    const loop = () => {
      // Lerp tilt
      const lf = 0.08;
      tiltCurrent.current.x = lerp(tiltCurrent.current.x, tiltTarget.current.x, lf);
      tiltCurrent.current.y = lerp(tiltCurrent.current.y, tiltTarget.current.y, lf);

      const snapThreshold = 0.01;
      if (
        Math.abs(tiltCurrent.current.x - tilt.x) > snapThreshold ||
        Math.abs(tiltCurrent.current.y - tilt.y) > snapThreshold
      ) {
        setTilt({ x: tiltCurrent.current.x, y: tiltCurrent.current.y });
      }

      // Orbit positions
      const elapsed = (Date.now() - startTime.current) / 1000;
      const scatterMul = isHovering.current ? 1 : 0;
      const newPos = orbitItems.map(({ offsetDeg, speed }) => {
        const angle = (offsetDeg * Math.PI) / 180 + (elapsed * 2 * Math.PI) / speed;
        const r = ORBIT_RADIUS + (scatterMul * SCATTER_EXTRA);
        return { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
      });
      setOrbitPositions(newPos);

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reducedMotion]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Mouse handlers ── */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isMobile.current) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    tiltTarget.current = {
      x: Math.max(-20, Math.min(20, ((e.clientY - cy) / rect.height) * 20)),
      y: Math.max(-20, Math.min(20, ((e.clientX - cx) / rect.width) * -20)),
    };
  }, []);

  const handleMouseEnter = useCallback(() => {
    isHovering.current = true;
    setHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    isHovering.current = false;
    setHovering(false);
    tiltTarget.current = { x: 0, y: 0 };
  }, []);

  /* ── Click scan pulse ── */
  const triggerPulse = useCallback(() => {
    const id = Date.now();
    setPulses(prev => [...prev, id]);
    setFlashing(true);
    setShowCheck(true);
    setTimeout(() => setFlashing(false), 200);
    setTimeout(() => setShowCheck(false), 1000);
    setTimeout(() => setPulses(prev => prev.filter(p => p !== id)), 800);
  }, []);

  const handleClick = useCallback(() => triggerPulse(), [triggerPulse]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: TouchEvent) => { e.preventDefault(); triggerPulse(); };
    el.addEventListener('touchstart', handler, { passive: false });
    return () => el.removeEventListener('touchstart', handler);
  }, [triggerPulse]);

  return (
    <div
      ref={containerRef}
      className="theme-glow relative w-full h-full flex items-center justify-center cursor-pointer md:scale-100 scale-[0.6]"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{ perspective: '800px' }}
    >
      {/* Glow backdrops */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-primary/[0.06] blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 left-2/3 w-[200px] h-[200px] rounded-full bg-secondary/[0.05] blur-[80px] pointer-events-none" />

      {/* Hexagon layers */}
      {layers.map((layer, i) => {
        const tx = tilt.x * layer.tiltMul;
        const ty = tilt.y * layer.tiltMul;
        const idleRotateStyle: React.CSSProperties = reducedMotion
          ? {}
          : !hovering && layer.idleSpeed > 0
          ? {
              animation: `hero-hex-spin ${layer.idleSpeed}s linear infinite${layer.idleDir < 0 ? ' reverse' : ''}`,
            }
          : layer.idleSpeed === 0 && !hovering
          ? { animation: 'hero-hex-pulse 3s ease-in-out infinite' }
          : {};

        return (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 pointer-events-none"
            style={{
              width: layer.size,
              height: layer.size,
              marginLeft: -layer.size / 2,
              marginTop: -layer.size / 2,
              transform: `rotateX(${tx}deg) rotateY(${ty}deg)`,
              transition: hovering ? 'none' : 'transform 0.6s ease-out',
              ...idleRotateStyle,
              animationPlayState: hovering && layer.idleSpeed > 0 ? 'paused' : 'running',
            }}
          >
            <svg
              viewBox={`${-layer.size / 2} ${-layer.size / 2} ${layer.size} ${layer.size}`}
              width={layer.size}
              height={layer.size}
              className="w-full h-full"
            >
              <defs>
                <linearGradient id={`hex-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00e5ff" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <path
                d={hexPath(layer.size * 0.9)}
                fill={layer.fill ? `url(#hex-grad-${i})` : 'none'}
                fillOpacity={layer.fill ? 0.1 : 0}
                stroke={layer.fill ? 'none' : layer.stroke}
                strokeWidth={1.5}
                opacity={flashing ? Math.min(1, layer.opacity + 0.4) : layer.opacity}
                style={{
                  transform: `rotate(${layer.baseRotation}deg)`,
                  transformOrigin: 'center',
                  transition: 'opacity 0.15s ease',
                }}
              />
            </svg>
          </div>
        );
      })}

      {/* Center icon */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
        style={{
          transform: `translate(-50%, -50%) rotateX(${tilt.x * 0.2}deg) rotateY(${tilt.y * 0.2}deg)`,
        }}
      >
        {showCheck ? (
          <CheckCircle className="w-8 h-8 text-[#22d3ee]" strokeWidth={1.5} />
        ) : (
          <Lock className="w-8 h-8 text-white/60" strokeWidth={1.5} />
        )}
      </div>

      {/* Orbiting icons */}
      {orbitItems.map(({ Icon }, i) => {
        const pos = orbitPositions[i];
        const tiltShiftX = tilt.y * 0.5;
        const tiltShiftY = tilt.x * 0.5;
        return (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 pointer-events-none z-10"
            style={{
              transform: `translate(${pos.x + tiltShiftX - 18}px, ${pos.y + tiltShiftY - 18}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center backdrop-blur-sm"
              style={{
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(100, 220, 255, 0.15)',
              }}
            >
              <Icon className="w-4 h-4 text-primary/70" />
            </div>
          </div>
        );
      })}

      {/* Scan pulse rings */}
      {pulses.map(id => (
        <div
          key={id}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full"
          style={{
            animation: 'hero-scan-pulse 0.8s ease-out forwards',
            border: '2px solid',
            borderImage: 'linear-gradient(135deg, #00e5ff, #a855f7) 1',
          }}
        />
      ))}
    </div>
  );
}
