import { Flame, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={cn(
        "w-9 px-0 transition-colors",
        theme === 'red' 
          ? "hover:bg-primary/10 hover:text-primary" 
          : "hover:bg-primary/10 hover:text-primary"
      )}
      title={`Switch to ${theme === 'blue' ? 'red' : 'blue'} theme`}
    >
      {theme === 'blue' ? (
        <Flame className="w-5 h-5" />
      ) : (
        <Waves className="w-5 h-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
