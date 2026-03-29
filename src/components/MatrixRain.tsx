import { useEffect, useRef } from 'react';

const CHARS = '01{}< >/\\|$#@!=+-_&%~ABCDEF'.split('');
const TERMS = ['ENCRYPT','HASH','AUTH','FIREWALL','PATCH','SUDO','ROOT','CHMOD','SSH','TLS','AES','RSA'];
const FONT = '11px "JetBrains Mono", monospace';
const COLOR = '#00e5ff';
const COL_WIDTH = 28;
const FPS_INTERVAL = 1000 / 30;

interface Column {
  x: number;
  y: number;
  speed: number;
  chars: { char: string; y: number; age: number }[];
  term: string | null;
  termIdx: number;
}

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const visibleRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let cols: Column[] = [];
    let lastFrame = 0;

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      initCols();
    };

    const initCols = () => {
      const count = Math.max(10, Math.min(30, Math.floor(canvas.width / COL_WIDTH)));
      const spacing = canvas.width / count;
      cols = Array.from({ length: count }, (_, i) => ({
        x: spacing * i + spacing / 2,
        y: -(Math.random() * canvas.height),
        speed: 30 + Math.random() * 50,
        chars: [],
        term: Math.random() < 0.3 ? TERMS[Math.floor(Math.random() * TERMS.length)] : null,
        termIdx: 0,
      }));
    };

    const getChar = (col: Column): string => {
      if (col.term && col.termIdx < col.term.length) {
        return col.term[col.termIdx++];
      }
      if (col.term && col.termIdx >= col.term.length) {
        col.term = Math.random() < 0.15 ? TERMS[Math.floor(Math.random() * TERMS.length)] : null;
        col.termIdx = 0;
      }
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    };

    const draw = (ts: number) => {
      rafRef.current = requestAnimationFrame(draw);
      if (!visibleRef.current) return;
      const delta = ts - lastFrame;
      if (delta < FPS_INTERVAL) return;
      lastFrame = ts - (delta % FPS_INTERVAL);

      const dt = delta / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = FONT;
      ctx.textAlign = 'center';

      for (const col of cols) {
        col.y += col.speed * dt;

        // Spawn new char every ~14px
        if (col.chars.length === 0 || col.y - (col.chars[col.chars.length - 1]?.y ?? -20) > 14) {
          col.chars.push({ char: getChar(col), y: col.y, age: 0 });
        }

        // Draw chars
        for (let i = col.chars.length - 1; i >= 0; i--) {
          const c = col.chars[i];
          c.age += dt;
          const bottomFade = 1 - Math.max(0, (c.y - canvas.height * 0.7) / (canvas.height * 0.3));
          const flash = c.age < 0.15 ? 0.3 : 0.06 + Math.random() * 0.06;
          const alpha = Math.max(0, flash * bottomFade);
          if (alpha <= 0 || c.y > canvas.height) {
            col.chars.splice(i, 1);
            continue;
          }
          ctx.fillStyle = COLOR;
          ctx.globalAlpha = alpha;
          ctx.fillText(c.char, col.x, c.y);
        }

        // Reset column when it's gone past
        if (col.y > canvas.height + 40 && col.chars.length === 0) {
          col.y = -(Math.random() * 200);
          col.speed = 30 + Math.random() * 50;
          col.term = Math.random() < 0.15 ? TERMS[Math.floor(Math.random() * TERMS.length)] : null;
          col.termIdx = 0;
        }
      }
      ctx.globalAlpha = 1;
    };

    // Intersection Observer
    const io = new IntersectionObserver(([e]) => { visibleRef.current = e.isIntersecting; }, { threshold: 0 });
    io.observe(canvas);

    // Resize Observer
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
