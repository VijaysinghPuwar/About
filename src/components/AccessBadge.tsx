import { Lock, Unlock, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccessBadgeProps {
  level: 'public' | 'basic' | 'admin';
  className?: string;
  showLabel?: boolean;
}

export function AccessBadge({ level, className, showLabel = true }: AccessBadgeProps) {
  const config = {
    public: {
      icon: Unlock,
      label: 'Public',
      colors: 'bg-success/10 text-success border-success/20',
    },
    basic: {
      icon: Eye,
      label: 'Login Required',
      colors: 'bg-warning/10 text-warning border-warning/20',
    },
    admin: {
      icon: Lock,
      label: 'Admin Only',
      colors: 'bg-destructive/10 text-destructive border-destructive/20',
    },
  };

  const { icon: Icon, label, colors } = config[level];

  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium',
      colors,
      className
    )}>
      <Icon className="w-3 h-3" />
      {showLabel && <span>{label}</span>}
    </div>
  );
}
