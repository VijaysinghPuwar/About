import { useEffect, useRef } from 'react';

const CHARS = '01{}< >/\\|$#@!=+-_&%~ABCDEF';
const COL_W = 20;
const CELL_H = 14;
const FPS = 20;
const INTERVAL = 1000 / FPS;

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const visibleRef = useRef(false);
  const dropsRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let lastTime = 0;

    const resize = () => {
      const parent = canvas.parentElement!;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      const colCount = Math.floor(canvas.width / COL_W);
      dropsRef.current = Array.from({ length: colCount }, () => Math.random() * -100);
    };

    const draw = (ts: number) => {
      rafRef.current = requestAnimationFrame(draw);
      if (!visibleRef.current) return;
      if (ts - lastTime < INTERVAL) return;
      lastTime = ts;

      // Fade trail
      ctx.fillStyle = 'rgba(5, 8, 22, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = '12px monospace';
      const drops = dropsRef.current;

      for (let i = 0; i < drops.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * COL_W;
        const y = drops[i] * CELL_H;

        // Head character brighter
        ctx.fillStyle = 'rgba(0, 229, 255, 0.25)';
        ctx.fillText(char, x, y);

        // Draw a slightly dimmer trail char one step behind
        if (drops[i] > 1) {
          const trailChar = CHARS[Math.floor(Math.random() * CHARS.length)];
          ctx.fillStyle = 'rgba(0, 229, 255, 0.10)';
          ctx.fillText(trailChar, x, y - CELL_H);
        }

        drops[i]++;

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
      }
    };

    const io = new IntersectionObserver(([e]) => {
      visibleRef.current = e.isIntersecting;
    }, { threshold: 0 });
    io.observe(canvas);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);
    resize();

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
