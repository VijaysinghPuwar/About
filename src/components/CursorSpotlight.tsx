import { useEffect, useRef, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const raf = useRef(0);
  const isMobile = useIsMobile();

  const update = useCallback(() => {
    if (ref.current) {
      ref.current.style.transform = `translate(${pos.current.x - 175}px, ${pos.current.y - 175}px)`;
    }
    raf.current = requestAnimationFrame(update);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    document.addEventListener('mousemove', onMove, { passive: true });
    raf.current = requestAnimationFrame(update);
    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf.current);
    };
  }, [isMobile, update]);

  if (isMobile) return null;

  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 w-[350px] h-[350px] rounded-full pointer-events-none z-[9999]"
      style={{
        background: 'radial-gradient(circle, hsl(var(--primary) / 0.04) 0%, transparent 70%)',
        willChange: 'transform',
      }}
    />
  );
}
