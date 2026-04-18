import { Crosshair, Shield } from 'lucide-react';
import { MouseEvent } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

export function ThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
  const { isPentest, toggleTheme, isTransitioning } = useTheme();

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    toggleTheme({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isTransitioning}
      className={cn(
        "transition-colors gap-2",
        showLabel ? "px-3" : "w-9 px-0",
        isPentest
          ? "text-destructive hover:bg-destructive/10"
          : "text-muted-foreground hover:text-foreground"
      )}
      title={isPentest ? 'Switch to Default Mode' : 'Activate Pentest Mode'}
    >
      {isPentest ? <Crosshair className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
      {showLabel && (
        <span className="text-sm">{isPentest ? 'Pentest' : 'Default'}</span>
      )}
    </Button>
  );
}
