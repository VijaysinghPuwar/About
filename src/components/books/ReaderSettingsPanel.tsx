import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Check } from 'lucide-react';
import { PAGES, TEXT_SIZES, type ReaderPage, useReaderSettings } from '@/lib/reader-settings';
import { cn } from '@/lib/utils';

/** The swatch for each page theme is the page itself, at the size of a thumb. */
const SWATCH: Record<ReaderPage, { bg: string; fg: string }> = {
  site: { bg: 'hsl(var(--background))', fg: 'hsl(240 8% 88%)' },
  plain: { bg: '#ffffff', fg: 'hsl(240 6% 16%)' },
  paper: { bg: '#f6f0e3', fg: 'hsl(30 14% 17%)' },
};

/**
 * "Aa": page theme, typeface and size, the three controls Apple Books puts
 * behind the same button. Each change applies immediately, so the panel is
 * its own preview; there is nothing to confirm.
 */
export function ReaderSettingsPanel() {
  const [settings, update] = useReaderSettings();

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger
        aria-label="Appearance"
        className="reader-btn flex h-10 w-10 items-center justify-center font-semibold"
      >
        <span aria-hidden="true" className="text-[15px] leading-none tracking-tight">
          A<span className="text-[12px]">a</span>
        </span>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={8}
          collisionPadding={12}
          data-page={settings.page}
          style={{ background: 'var(--r-bg)' }}
          className="reader reader-panel z-[60] w-[min(300px,calc(100vw-24px))] rounded-xl border p-4 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.5)] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        >
          <fieldset>
            <legend className="mb-2.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-[hsl(var(--r-dim))]">Page</legend>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Page theme">
              {PAGES.map(p => {
                const active = settings.page === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => update({ page: p.id })}
                    className={cn(
                      'relative flex h-[68px] flex-col items-center justify-center gap-1 rounded-lg border text-[12.5px] transition-colors',
                      active ? 'border-[hsl(var(--r-accent))] ring-1 ring-[hsl(var(--r-accent))]' : 'border-[hsl(var(--r-border-strong))]',
                    )}
                    style={{ background: SWATCH[p.id].bg, color: SWATCH[p.id].fg }}
                  >
                    <span className="text-[17px] font-semibold leading-none" aria-hidden="true">Aa</span>
                    <span>{p.label}</span>
                    {active && (
                      <Check className="absolute right-1.5 top-1.5 h-3.5 w-3.5" style={{ color: 'hsl(var(--r-accent))' }} aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mt-5">
            <legend className="mb-2.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-[hsl(var(--r-dim))]">Typeface</legend>
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-[hsl(var(--r-surface))] p-1" role="radiogroup" aria-label="Typeface">
              {(['sans', 'serif'] as const).map(f => {
                const active = settings.font === f;
                return (
                  <button
                    key={f}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => update({ font: f })}
                    className={cn(
                      'flex h-10 items-center justify-center rounded-md text-[14px] transition-colors',
                      active
                        ? 'bg-[var(--r-bg)] text-[hsl(var(--r-strong))] shadow-[0_1px_2px_rgba(0,0,0,0.2)]'
                        : 'text-[hsl(var(--r-muted))] hover:text-[hsl(var(--r-strong))]',
                    )}
                    style={{
                      fontFamily: f === 'serif'
                        ? "'Iowan Old Style', 'Charter', 'Sitka Text', Cambria, Georgia, serif"
                        : "'IBM Plex Sans', system-ui, sans-serif",
                    }}
                  >
                    {f === 'serif' ? 'Serif' : 'Sans'}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mt-5">
            <legend className="mb-2.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-[hsl(var(--r-dim))]">Text size</legend>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => update({ size: Math.max(0, settings.size - 1) })}
                disabled={settings.size === 0}
                aria-label="Smaller text"
                className="reader-btn flex h-11 w-11 items-center justify-center border border-[hsl(var(--r-border-strong))] text-[13px] font-semibold disabled:opacity-35"
              >
                A
              </button>
              <div className="flex flex-1 items-center justify-center gap-2" aria-hidden="true">
                {TEXT_SIZES.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      'h-1.5 w-1.5 rounded-full transition-colors',
                      i <= settings.size ? 'bg-[hsl(var(--r-accent))]' : 'bg-[hsl(var(--r-border-strong))]',
                    )}
                  />
                ))}
              </div>
              <span className="sr-only" aria-live="polite">{TEXT_SIZES[settings.size]} pixels</span>
              <button
                type="button"
                onClick={() => update({ size: Math.min(TEXT_SIZES.length - 1, settings.size + 1) })}
                disabled={settings.size === TEXT_SIZES.length - 1}
                aria-label="Larger text"
                className="reader-btn flex h-11 w-11 items-center justify-center border border-[hsl(var(--r-border-strong))] text-[19px] font-semibold disabled:opacity-35"
              >
                A
              </button>
            </div>
          </fieldset>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
