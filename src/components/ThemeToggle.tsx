import { Crosshair, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

export function ThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
  const { isPentest, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={cn(
        "transition-all duration-200 gap-2",
        showLabel ? "px-3" : "w-9 px-0",
        isPentest
          ? "text-destructive hover:bg-destructive/10 hover:text-destructive shadow-[0_0_10px_hsl(0_85%_55%/0.2)]"
          : "hover:bg-primary/10 hover:text-primary"
      )}
      title={isPentest ? 'Switch to Default Mode' : 'Activate Pentest Mode'}
    >
      {isPentest ? (
        <Crosshair className="w-5 h-5" />
      ) : (
        <Shield className="w-5 h-5" />
      )}
      {showLabel && (
        <span className="text-sm font-medium">
          {isPentest ? 'Pentest Mode' : 'Default Mode'}
        </span>
      )}
      <span className="sr-only">Toggle Pentest Mode</span>
    </Button>
  );
}
