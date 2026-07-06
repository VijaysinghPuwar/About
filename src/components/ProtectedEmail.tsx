import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

// Split to avoid trivial source-grep harvesting; never assembled in DOM
// for logged-out visitors.
const LOCAL = 'contact';
const DOMAIN = 'vijaysinghpuwar.com';
const EMAIL = `${LOCAL}@${DOMAIN}`;
const MASKED = `${LOCAL.slice(0, 4)}••••@${DOMAIN}`;

interface ProtectedEmailProps {
  variant?: 'row' | 'icon';
  className?: string;
  /** For row variant: hide the "Sign in to unlock" hint on small screens. */
  compactHint?: boolean;
}

export function ProtectedEmail({ variant = 'row', className, compactHint = false }: ProtectedEmailProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── Authenticated: render real mailto: ──────────────────────────────
  if (user) {
    if (variant === 'icon') {
      return (
        <a
          href={`mailto:${EMAIL}`}
          aria-label="Email Vijaysingh"
          className={cn(
            'text-muted-foreground hover:text-primary transition-colors',
            className,
          )}
        >
          <Mail className="w-4 h-4" aria-hidden="true" />
        </a>
      );
    }
    return (
      <a
        href={`mailto:${EMAIL}`}
        aria-label="Email Vijaysingh"
        className={cn(
          'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-primary/5 hover:shadow-[inset_0_0_20px_hsl(var(--primary)/0.05)] transition-all duration-500',
          className,
        )}
      >
        <Mail className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
        <span className="min-w-0 truncate transition-[filter,opacity] duration-500 opacity-100 blur-0">
          {EMAIL}
        </span>
      </a>
    );
  }

  // ── Unauthenticated: no real address in DOM, route to /login ────────
  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={() => navigate('/login')}
        aria-label="Sign in to email Vijaysingh"
        className={cn(
          'relative text-muted-foreground hover:text-primary transition-colors',
          className,
        )}
      >
        <Mail className="w-4 h-4" aria-hidden="true" />
        <Lock
          className="absolute -bottom-1 -right-1 w-2.5 h-2.5 text-primary/80"
          aria-hidden="true"
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => navigate('/login')}
      aria-label="Sign in to reveal email"
      className={cn(
        'group w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all min-h-[44px]',
        className,
      )}
    >
      <Mail className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
      <span
        className="min-w-0 truncate font-mono select-none blur-[5px] group-hover:blur-[3px] transition-[filter] duration-300"
        aria-hidden="true"
      >
        {MASKED}
      </span>
      <span
        className={cn(
          'ml-auto shrink-0 flex items-center gap-1.5 text-[11px] font-mono text-primary/80 group-hover:text-primary transition-colors',
        )}
      >
        <Lock className="w-3 h-3" aria-hidden="true" />
        <span className={compactHint ? 'hidden sm:inline' : ''}>Sign in to unlock</span>
      </span>
    </button>
  );
}
