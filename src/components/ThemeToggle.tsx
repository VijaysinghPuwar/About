import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

/**
 * A two-state segmented control, not a mystery icon. Both modes are named and
 * the active one is filled, so the reader knows what they are switching between
 * before they click — the previous version was a single shield/crosshair glyph
 * that gave no clue what the other state was.
 */
export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { isPentest, toggleTheme } = useTheme();

  const segment = (label: string, active: boolean) => (
    <span
      className={cn(
        'flex h-7 items-center rounded-[4px] border px-2.5 font-mono text-[10.5px] tracking-[0.08em] transition-colors',
        active
          ? 'border-primary bg-primary-bg text-primary'
          : 'border-transparent text-muted-dim',
      )}
    >
      {label}
    </span>
  );

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isPentest ? 'Switch to security mode' : 'Switch to pentest mode'}
        className="flex h-11 w-11 items-center justify-center rounded-md border border-border bg-card"
      >
        <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true">
          <path
            d="M8 1 L14.9 5 L14.9 13 L8 17 L1.1 13 L1.1 5 Z"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Switch operational theme"
      className="flex h-9 items-center gap-0.5 rounded-md border border-border bg-card p-0.5"
    >
      {segment('SECURITY', !isPentest)}
      {segment('PENTEST', isPentest)}
    </button>
  );
}
