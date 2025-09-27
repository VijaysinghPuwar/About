import { Badge } from '@/components/ui/badge';
import { badgeVariants } from '@/components/ui/badge-variants';
import { cn } from '@/lib/utils';

interface TechBadgeProps {
  tech: string;
  variant?: 'tech' | 'category' | 'status' | 'year' | 'featured';
  className?: string;
}

export function TechBadge({ tech, variant = 'tech', className }: TechBadgeProps) {
  return (
    <Badge 
      className={cn(badgeVariants({ variant }), className)}
    >
      {tech}
    </Badge>
  );
}