import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

/**
 * A two-state segmented control, not a mystery icon. Both modes are named and
 * the active one is filled, so the reader knows what they are switching between
 * before they click. The previous version was a single shield/crosshair glyph
 * that gave no clue what the other state was.
 */
export function ThemeToggle({ className, onToggle }: { className?: string; onToggle?: () => void }) {
  const { isPentest, toggleTheme } = useTheme();

  const segment = (label: string, active: boolean) => (
    <span
      className={cn(
        'flex h-7 flex-1 items-center justify-center rounded-[4px] border px-2.5 font-mono text-[10.5px] tracking-[0.08em] transition-colors',
        active
          ? 'border-primary bg-primary-bg text-primary'
          : 'border-transparent text-muted-dim',
      )}
    >
      {label}
    </span>
  );

  /* There is no icon-only version. The phone bar used to carry one: a bare
     hexagon, the same shape as the logo two buttons to its left, that ran a
     full-screen transition with sound when tapped and said nothing about it
     beforehand. On a phone the control now lives in the menu, with both names
     on it. */
  return (
    <button
      type="button"
      onClick={() => { toggleTheme(); onToggle?.(); }}
      aria-label={isPentest ? 'Mode: pentest. Switch to security' : 'Mode: security. Switch to pentest'}
      className={cn('flex h-[34px] items-center gap-0.5 rounded-md border border-border bg-card p-0.5', className)}
    >
      {segment('SECURITY', !isPentest)}
      {segment('PENTEST', isPentest)}
    </button>
  );
}
