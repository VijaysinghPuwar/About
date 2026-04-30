import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  velocityX: number;
  velocityY: number;
  color: string;
}

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (isMobile || reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;
      if (Math.sqrt(dx * dx + dy * dy) < 5) return;
      lastPosRef.current = { x: e.clientX, y: e.clientY };

      const particles = particlesRef.current;
      if (particles.length >= 50) particles.shift();
      particles.push({
        x: e.clientX,
        y: e.clientY,
        size: Math.random() * 3 + 1,
        opacity: 0.8,
        velocityX: (Math.random() - 0.5) * 1,
        velocityY: (Math.random() - 0.5) * 1,
        color: Math.random() > 0.5 ? '#00e5ff' : '#a855f7',
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(')', `, ${p.opacity * 0.5})`).replace('#', '');
        // Use hex with globalAlpha for glow
        ctx.globalAlpha = p.opacity * 0.5;
        ctx.fillStyle = p.color;
        ctx.fill();

        // Core
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;

        p.x += p.velocityX;
        p.y += p.velocityY;
        p.opacity -= 0.02;
        p.size -= 0.03;

        if (p.opacity <= 0 || p.size <= 0) {
          particles.splice(i, 1);
        }
      }
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isMobile, reducedMotion]);

  if (isMobile || reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
    />
  );
}
