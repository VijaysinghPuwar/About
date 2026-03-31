import { Crosshair, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

export function ThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
  const { isPentest, toggleTheme, isTransitioning } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
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
