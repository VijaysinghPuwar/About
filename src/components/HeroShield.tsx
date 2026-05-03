import { memo, useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { CheckCircle, Cloud, Lock, Shield, Terminal } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';

interface LayerConfig {
  size: number;
  stroke: string;
  opacity: number;
  baseRotation: number;
  idleSpeed: number;
  reverse?: boolean;
  fill?: boolean;
  path: string;
}

interface OrbitItemConfig {
  Icon: typeof Terminal;
  offsetDeg: number;
  speed: number;
  reverse?: boolean;
}

function hexPath(size: number): string {
  const radius = size / 2;
  return Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 3) * index - Math.PI / 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ') + ' Z';
}

const layers: LayerConfig[] = [
  { size: 360, stroke: '#00e5ff', opacity: 0.14, baseRotation: 0, idleSpeed: 42, path: hexPath(324) },
  { size: 274, stroke: '#a855f7', opacity: 0.18, baseRotation: 14, idleSpeed: 34, reverse: true, path: hexPath(246.6) },
  { size: 186, stroke: '#00e5ff', opacity: 0.24, baseRotation: 28, idleSpeed: 28, path: hexPath(167.4) },
  { size: 108, stroke: '#00e5ff', opacity: 0.12, baseRotation: 0, idleSpeed: 6, fill: true, path: hexPath(97.2) },
];

const orbitItems: OrbitItemConfig[] = [
  { Icon: Terminal, offsetDeg: 0, speed: 24 },
  { Icon: Shield, offsetDeg: 90, speed: 30, reverse: true },
  { Icon: Cloud, offsetDeg: 180, speed: 27 },
  { Icon: Lock, offsetDeg: 270, speed: 33, reverse: true },
];

const ORBIT_RADIUS = 168;
const MAX_TILT = 8;
const TILT_LERP = 0.12;
const TILT_EPSILON = 0.08;

function clampTilt(value: number) {
  return Math.max(-MAX_TILT, Math.min(MAX_TILT, value));
}

export const HeroShield = memo(function HeroShield() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const tiltCurrent = useRef({ x: 0, y: 0 });
  const tiltTarget = useRef({ x: 0, y: 0 });
  const timersRef = useRef<number[]>([]);
  const canHoverRef = useRef(false);

  const [flashing, setFlashing] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [pulses, setPulses] = useState<number[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const reducedMotion = useReducedMotion();

  const canAnimate = !reducedMotion && isVisible;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
  }, []);

  const setSceneTilt = useCallback((x: number, y: number) => {
    const scene = sceneRef.current;
    if (!scene) return;
    scene.style.setProperty('--hero-tilt-x', `${x.toFixed(2)}deg`);
    scene.style.setProperty('--hero-tilt-y', `${y.toFixed(2)}deg`);
  }, []);

  const stopTiltLoop = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const updateTilt = useCallback(() => {
    const nextX = tiltCurrent.current.x + (tiltTarget.current.x - tiltCurrent.current.x) * TILT_LERP;
    const nextY = tiltCurrent.current.y + (tiltTarget.current.y - tiltCurrent.current.y) * TILT_LERP;

    tiltCurrent.current = { x: nextX, y: nextY };
    setSceneTilt(nextX, nextY);

    const settled =
      Math.abs(tiltTarget.current.x - nextX) < TILT_EPSILON &&
      Math.abs(tiltTarget.current.y - nextY) < TILT_EPSILON;

    if (settled) {
      tiltCurrent.current = { ...tiltTarget.current };
      setSceneTilt(tiltTarget.current.x, tiltTarget.current.y);
      if (tiltTarget.current.x === 0 && tiltTarget.current.y === 0) {
        stopTiltLoop();
        return;
      }
    }

    frameRef.current = requestAnimationFrame(updateTilt);
  }, [setSceneTilt, stopTiltLoop]);

  const startTiltLoop = useCallback(() => {
    if (!canAnimate || frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(updateTilt);
  }, [canAnimate, updateTilt]);

  useEffect(() => {
    canHoverRef.current = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (canAnimate) return;
    tiltCurrent.current = { x: 0, y: 0 };
    tiltTarget.current = { x: 0, y: 0 };
    stopTiltLoop();
    setSceneTilt(0, 0);
  }, [canAnimate, setSceneTilt, stopTiltLoop]);

  useEffect(() => () => {
    stopTiltLoop();
    clearTimers();
  }, [clearTimers, stopTiltLoop]);

  const queueTimer = useCallback((fn: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter(timerId => timerId !== id);
      fn();
    }, delay);
    timersRef.current.push(id);
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!canAnimate || !canHoverRef.current) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    tiltTarget.current = {
      x: clampTilt(((event.clientY - centerY) / rect.height) * MAX_TILT * 1.35),
      y: clampTilt(((centerX - event.clientX) / rect.width) * MAX_TILT * 1.35),
    };

    startTiltLoop();
  }, [canAnimate, startTiltLoop]);

  const handleMouseLeave = useCallback(() => {
    tiltTarget.current = { x: 0, y: 0 };
    startTiltLoop();
  }, [startTiltLoop]);

  const triggerPulse = useCallback(() => {
    const pulseId = Date.now();
    setPulses(current => [...current, pulseId]);
    setFlashing(true);
    setShowCheck(true);

    queueTimer(() => setFlashing(false), 180);
    queueTimer(() => setShowCheck(false), 950);
    queueTimer(() => {
      setPulses(current => current.filter(id => id !== pulseId));
    }, 760);
  }, [queueTimer]);

  const sceneStyle = {
    '--hero-orbit-radius': `${ORBIT_RADIUS}px`,
  } as CSSProperties;

  return (
    <div
      ref={containerRef}
      className="hero-shield theme-glow relative flex h-full w-full cursor-pointer items-center justify-center md:scale-100 scale-[0.6]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={triggerPulse}
      style={{ perspective: '900px' }}
    >
      <div className="hero-shield__glow hero-shield__glow--primary" />
      <div className="hero-shield__glow hero-shield__glow--secondary" />

      <div
        ref={sceneRef}
        className="hero-shield__scene absolute inset-0 flex items-center justify-center"
        data-animate={canAnimate ? 'true' : 'false'}
        style={sceneStyle}
      >
        {layers.map((layer, index) => {
          const animationClass = layer.fill ? 'hero-shield__layer--pulse' : 'hero-shield__layer--spin';
          return (
            <div
              key={layer.size}
              className={`hero-shield__layer ${animationClass} absolute top-1/2 left-1/2 pointer-events-none`}
              style={{
                width: layer.size,
                height: layer.size,
                marginLeft: -(layer.size / 2),
                marginTop: -(layer.size / 2),
                animationDuration: `${layer.idleSpeed}s`,
                animationDirection: layer.reverse ? 'reverse' : 'normal',
                animationPlayState: canAnimate ? 'running' : 'paused',
              }}
            >
              <svg
                viewBox={`${-layer.size / 2} ${-layer.size / 2} ${layer.size} ${layer.size}`}
                width={layer.size}
                height={layer.size}
                aria-hidden="true"
                focusable="false"
                className="h-full w-full"
              >
                <defs>
                  <linearGradient id={`hex-grad-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00e5ff" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <path
                  d={layer.path}
                  fill={layer.fill ? `url(#hex-grad-${index})` : 'none'}
                  fillOpacity={layer.fill ? 0.08 : 0}
                  stroke={layer.fill ? 'none' : layer.stroke}
                  strokeWidth={1.5}
                  opacity={flashing ? Math.min(1, layer.opacity + 0.3) : layer.opacity}
                  style={{
                    transform: `rotate(${layer.baseRotation}deg)`,
                    transformOrigin: 'center',
                    transition: 'opacity 150ms ease-out',
                  }}
                />
              </svg>
            </div>
          );
        })}

        {orbitItems.map(({ Icon, offsetDeg, speed, reverse }) => (
          <div
            key={`${Icon.displayName || Icon.name}-${offsetDeg}`}
            className="absolute top-1/2 left-1/2 pointer-events-none z-10"
            style={{ transform: `translate(-50%, -50%) rotate(${offsetDeg}deg)` }}
          >
            <div
              className="hero-shield__orbit"
              style={{
                animationDuration: `${speed}s`,
                animationDirection: reverse ? 'reverse' : 'normal',
                animationPlayState: canAnimate ? 'running' : 'paused',
              }}
            >
              <div className="hero-shield__orbit-chip">
                <Icon className="h-4 w-4 text-primary/70" />
              </div>
            </div>
          </div>
        ))}

        <div className="pointer-events-none absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          {showCheck ? (
            <CheckCircle className="h-8 w-8 text-[#22d3ee]" strokeWidth={1.5} />
          ) : (
            <Lock className="h-8 w-8 text-white/60" strokeWidth={1.5} />
          )}
        </div>
      </div>

      {pulses.map(pulseId => (
        <div
          key={pulseId}
          className="hero-shield__pulse absolute top-1/2 left-1/2 pointer-events-none rounded-full"
          style={{
            animationPlayState: canAnimate ? 'running' : 'paused',
            border: '1.5px solid rgba(0, 229, 255, 0.45)',
            boxShadow: '0 0 18px rgba(0, 229, 255, 0.12)',
          }}
        />
      ))}
    </div>
  );
});
