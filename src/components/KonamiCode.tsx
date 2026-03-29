import { useEffect, useRef } from 'react';

const SEQUENCE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA',
];

export function KonamiCode() {
  const idx = useRef(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === SEQUENCE[idx.current]) {
        idx.current++;
        if (idx.current === SEQUENCE.length) {
          idx.current = 0;
          document.documentElement.classList.add('rainbow-mode');
          setTimeout(() => document.documentElement.classList.remove('rainbow-mode'), 5000);
        }
      } else {
        idx.current = e.code === SEQUENCE[0] ? 1 : 0;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return null;
}
