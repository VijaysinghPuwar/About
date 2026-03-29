import { useState, useEffect, useCallback } from 'react';

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  const onScroll = useCallback(() => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    setProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  return (
    <div className="fixed top-0 left-0 w-full h-[2px] z-[60]">
      <div
        className="h-full bg-gradient-to-r from-primary to-secondary"
        style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
      />
    </div>
  );
}
