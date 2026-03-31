import { useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/useTheme';

interface GridDot {
  x: number;
  y: number;
  currentOpacity: number;
  currentSize: number;
  targetOpacity: number;
  targetSize: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  opacity: number;
}

const BASE_OPACITY = 0.05;
const BASE_SIZE = 2;
const LERP = 0.08;
const PROXIMITY_RADIUS = 120;
const CONNECT_RADIUS = 80;
const RIPPLE_MAX = 400;
const RIPPLE_SPEED = 400 / 1200; // 400px over 1200ms ≈ px per ms → we'll use per-frame

export function CyberGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<GridDot[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const scrollRef = useRef(0);
  const rafRef = useRef(0);
  const isMobile = useIsMobile();
  const spacingRef = useRef(60);
  const { isPentest } = useTheme();
  const colorRef = useRef({ r: 0, g: 229, b: 255 });
  const targetColorRef = useRef({ r: 0, g: 229, b: 255 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const mobile = window.innerWidth < 768;
    const spacing = mobile ? 40 : 60;
    spacingRef.current = spacing;

    const buildGrid = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const dots: GridDot[] = [];
      const cols = Math.ceil(canvas.width / spacing) + 2;
      const rows = Math.ceil((canvas.height + 400) / spacing) + 2; // extra for parallax
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({
            x: c * spacing,
            y: r * spacing,
            currentOpacity: BASE_OPACITY,
            currentSize: BASE_SIZE,
            targetOpacity: BASE_OPACITY,
            targetSize: BASE_SIZE,
          });
        }
      }
      dotsRef.current = dots;
    };
    buildGrid();
    window.addEventListener('resize', buildGrid);

    // Scroll
    const onScroll = () => { scrollRef.current = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mouse (desktop only)
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    if (!mobile) window.addEventListener('mousemove', onMove, { passive: true });

    // Click / tap ripple
    const spawnRipple = (x: number, y: number) => {
      ripplesRef.current.push({ x, y, radius: 0, opacity: 0.15 });
    };
    const onClick = (e: MouseEvent) => spawnRipple(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) spawnRipple(t.clientX, t.clientY);
    };
    window.addEventListener('click', onClick);
    if (mobile) window.addEventListener('touchstart', onTouch, { passive: true });

    let lastTime = 0;

    const animate = (ts: number) => {
      rafRef.current = requestAnimationFrame(animate);
      const dt = ts - lastTime;
      lastTime = ts;

      const w = canvas.width;
      const h = canvas.height;
      const offsetY = scrollRef.current * -0.3;
      const dots = dotsRef.current;
      const ripples = ripplesRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      ctx.clearRect(0, 0, w, h);

      // Draw grid lines
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.03)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const yStart = (offsetY % spacing + spacing) % spacing;
      for (let y = yStart; y < h; y += spacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      for (let x = 0; x < w; x += spacing) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      ctx.stroke();

      // Reset targets
      for (let i = 0; i < dots.length; i++) {
        dots[i].targetOpacity = BASE_OPACITY;
        dots[i].targetSize = BASE_SIZE;
      }

      // Process ripples — affect dot targets
      for (let r = ripples.length - 1; r >= 0; r--) {
        const rip = ripples[r];
        const rippleEdge = rip.radius;
        const edgeWidth = 30;

        for (let i = 0; i < dots.length; i++) {
          const d = dots[i];
          const dy = d.y + offsetY;
          const dist = Math.sqrt((d.x - rip.x) ** 2 + (dy - rip.y) ** 2);
          if (Math.abs(dist - rippleEdge) < edgeWidth) {
            const intensity = 1 - Math.abs(dist - rippleEdge) / edgeWidth;
            d.targetOpacity = Math.max(d.targetOpacity, 0.5 * intensity);
            d.targetSize = Math.max(d.targetSize, 5 * intensity);
          }
        }

        // Draw ripple circle
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 229, 255, ${rip.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Advance ripple
        rip.radius += RIPPLE_SPEED * (dt || 16);
        rip.opacity = 0.15 * (1 - rip.radius / RIPPLE_MAX);
        if (rip.radius > RIPPLE_MAX || rip.opacity < 0.01) {
          ripples.splice(r, 1);
        }
      }

      // Proximity glow (desktop, skip if frame is slow)
      const skipProximity = mobile || dt > 20;
      const glowingDots: number[] = [];

      if (!skipProximity) {
        const minX = mx - PROXIMITY_RADIUS;
        const maxX = mx + PROXIMITY_RADIUS;
        const minY = my - PROXIMITY_RADIUS - offsetY;
        const maxY = my + PROXIMITY_RADIUS - offsetY;

        for (let i = 0; i < dots.length; i++) {
          const d = dots[i];
          if (d.x < minX || d.x > maxX || d.y < minY || d.y > maxY) continue;
          const dy = d.y + offsetY;
          const dist = Math.sqrt((d.x - mx) ** 2 + (dy - my) ** 2);
          if (dist < PROXIMITY_RADIUS) {
            const t = 1 - dist / PROXIMITY_RADIUS;
            d.targetOpacity = Math.max(d.targetOpacity, 0.06 + 0.34 * t);
            d.targetSize = Math.max(d.targetSize, BASE_SIZE + 2 * t);
            if (dist < CONNECT_RADIUS) glowingDots.push(i);
          }
        }
      }

      // Draw dots
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        d.currentOpacity += (d.targetOpacity - d.currentOpacity) * LERP;
        d.currentSize += (d.targetSize - d.currentSize) * LERP;

        const dy = d.y + offsetY;
        if (dy < -spacing || dy > h + spacing) continue;

        ctx.beginPath();
        ctx.arc(d.x, dy, d.currentSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${d.currentOpacity})`;
        ctx.fill();
      }

      // Connecting lines between glowing dots near cursor
      if (glowingDots.length > 1) {
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
        ctx.lineWidth = 0.5;
        for (let a = 0; a < glowingDots.length; a++) {
          for (let b = a + 1; b < glowingDots.length; b++) {
            const da = dots[glowingDots[a]];
            const db = dots[glowingDots[b]];
            const dist = Math.sqrt((da.x - db.x) ** 2 + (da.y - db.y) ** 2);
            if (dist < spacing * 1.5) {
              ctx.beginPath();
              ctx.moveTo(da.x, da.y + offsetY);
              ctx.lineTo(db.x, db.y + offsetY);
              ctx.stroke();
            }
          }
        }
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', buildGrid);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('click', onClick);
      window.removeEventListener('touchstart', onTouch);
    };
  }, [isMobile]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
