import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useIsMobile } from '@/hooks/use-mobile';

export function ThemeTransition() {
  const { isTransitioning, transitionDirection } = useTheme();
  const isMobile = useIsMobile();
  const [showChip, setShowChip] = useState(false);
  const [chipFading, setChipFading] = useState(false);
  const chipDirection = useRef<string | null>(null);

  // Show mode-confirmation chip after transition ends
  useEffect(() => {
    if (isTransitioning && transitionDirection) {
      chipDirection.current = transitionDirection;
    }
    if (!isTransitioning && chipDirection.current) {
      setShowChip(true);
      setChipFading(false);
      const fadeTimer = setTimeout(() => setChipFading(true), 2000);
      const removeTimer = setTimeout(() => {
        setShowChip(false);
        chipDirection.current = null;
      }, 2500);
      return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
    }
  }, [isTransitioning, transitionDirection]);

  if (!isTransitioning && !showChip) return null;

  const isPentest = transitionDirection === 'to-pentest';
  const scanDuration = isMobile ? (isPentest ? 200 : 250) : (isPentest ? 300 : 400);
  const totalDur = isMobile ? 800 : 1100;

  // Colors
  const lineColor = isPentest ? '#f43f5e' : '#00e5ff';
  const lineGradient = isPentest
    ? 'linear-gradient(90deg, transparent 0%, #f43f5e 30%, #fb923c 70%, transparent 100%)'
    : 'linear-gradient(90deg, transparent 0%, #00e5ff 30%, #a855f7 70%, transparent 100%)';
  const pulseColor = isPentest ? 'rgba(244, 63, 94, 0.18)' : 'rgba(0, 229, 255, 0.12)';
  const gridColor = isPentest ? 'rgba(244, 63, 94, 0.04)' : 'rgba(0, 229, 255, 0.04)';

  const modeText = isPentest ? 'PENTEST MODE ACTIVATED' : 'SECURE MODE RESTORED';
  const chipText = chipDirection.current === 'to-pentest' ? 'Pentest Mode Activated' : 'Defensive Mode Restored';
  const chipBorderColor = chipDirection.current === 'to-pentest' ? '#f43f5e' : '#00e5ff';

  return (
    <>
      {/* Full-screen overlay */}
      {isTransitioning && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: 90 }}
        >
          {/* Scan line sweeping top to bottom */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: '2px',
              background: lineGradient,
              boxShadow: `0 0 20px ${lineColor}, 0 0 60px ${lineColor}`,
              animation: `theme-scan-line ${scanDuration}ms ease-in-out forwards`,
              zIndex: 3,
            }}
          />

          {/* Trailing band behind scan line */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: '40px',
              background: `linear-gradient(180deg, ${lineColor}15, transparent)`,
              animation: `theme-scan-line ${scanDuration}ms ease-in-out forwards`,
              zIndex: 2,
            }}
          />

          {/* Radial recalibration pulse */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle at 50% 50%, ${pulseColor} 0%, transparent ${isMobile ? '50%' : '70%'})`,
              animation: `theme-pulse ${totalDur * 0.6}ms ease-out ${scanDuration * 0.75}ms both`,
              zIndex: 1,
            }}
          />

          {/* Grid flash (desktop only) */}
          {!isMobile && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                  linear-gradient(${gridColor} 1px, transparent 1px),
                  linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
                animation: `theme-grid-flash ${totalDur * 0.5}ms ease-out ${scanDuration * 0.5}ms both`,
                zIndex: 1,
              }}
            />
          )}

          {/* Center status text */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 4,
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                letterSpacing: '0.3em',
                color: lineColor,
                textShadow: `0 0 20px ${lineColor}`,
                animation: `theme-text-flash 400ms ease-out ${scanDuration + 100}ms both`,
              }}
            >
              {modeText}
            </span>
          </div>

          {/* Full overlay fade-out at the end */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'transparent',
              animation: `theme-overlay-exit 300ms ease-out ${totalDur - 300}ms forwards`,
              zIndex: 0,
            }}
          />
        </div>
      )}

      {/* Mode confirmation chip */}
      {showChip && (
        <div
          style={{
            position: 'fixed',
            top: '16px',
            right: '16px',
            zIndex: 91,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            padding: '8px 14px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '6px',
            borderLeft: `3px solid ${chipBorderColor}`,
            color: chipBorderColor,
            letterSpacing: '0.08em',
            boxShadow: `0 0 20px ${chipBorderColor}22`,
            opacity: chipFading ? 0 : 1,
            transform: chipFading ? 'translateX(10px)' : 'translateX(0)',
            transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
            animation: 'theme-chip-enter 0.3s ease-out',
          }}
        >
          {chipText}
        </div>
      )}
    </>
  );
}
