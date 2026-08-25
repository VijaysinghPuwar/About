import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { loginHref } from '@/lib/auth-redirect';
import { cn } from '@/lib/utils';
import { contactEmail, maskedContactEmail } from '@/lib/contact-email';

// Assembled only when an authenticated user is rendering it — see
// `@/lib/contact-email` for why this is not written as a single literal.
const EMAIL = contactEmail();
const MASKED = maskedContactEmail();

interface ProtectedEmailProps {
  variant?: 'row' | 'icon' | 'card';
  className?: string;
  /** For icon variant: size/style the mail glyph without touching the lock badge. */
  iconClassName?: string;
  /** For row variant: hide the "Sign in to unlock" hint on small screens. */
  compactHint?: boolean;
}

export function ProtectedEmail({
  variant = 'row',
  className,
  iconClassName,
  compactHint = false,
}: ProtectedEmailProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── Authenticated: render real mailto: ──────────────────────────────
  if (user) {
    if (variant === 'card') {
      return (
        <a
          href={`mailto:${EMAIL}`}
          className={cn('panel panel-hover flex flex-col gap-1.5 rounded-lg px-[18px] py-4', className)}
        >
          <span className="meta-label">Email</span>
          <span className="truncate text-[15px] text-foreground">{EMAIL}</span>
        </a>
      );
    }
    if (variant === 'icon') {
      return (
        <a
          href={`mailto:${EMAIL}`}
          aria-label="Email Vijaysingh"
          className={cn(
            'inline-flex items-center justify-center text-muted-foreground hover:text-primary transition-colors',
            className,
          )}
        >
          <Mail className={cn('w-4 h-4', iconClassName)} aria-hidden="true" />
        </a>
      );
    }
    return (
      <a
        href={`mailto:${EMAIL}`}
        aria-label="Email Vijaysingh"
        className={cn(
          'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:text-foreground transition-colors',
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
  if (variant === 'card') {
    return (
      <button
        type="button"
        onClick={() => navigate(loginHref())}
        aria-label="Sign in to reveal email"
        className={cn('panel panel-hover flex flex-col gap-1.5 rounded-lg px-[18px] py-4 text-left', className)}
      >
        <span className="meta-label flex items-center gap-1.5">
          <Lock className="h-[9px] w-[9px]" aria-hidden="true" />
          Email — protected
        </span>
        <span className="truncate font-mono text-[14px] text-muted-foreground" aria-hidden="true">
          {MASKED}
        </span>
      </button>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={() => navigate(loginHref())}
        aria-label="Sign in to email Vijaysingh"
        className={cn(
          'inline-flex items-center justify-center text-muted-foreground hover:text-primary transition-colors',
          className,
        )}
      >
        {/* Badge anchors to the glyph, not the button box, so padded callers stay aligned. */}
        <span className="relative inline-flex">
          <Mail className={cn('w-4 h-4', iconClassName)} aria-hidden="true" />
          <span
            className="pointer-events-none absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-background ring-1 ring-background"
            aria-hidden="true"
          >
            <Lock className="!h-[7px] !w-[7px] text-primary/80" aria-hidden="true" />
          </span>
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => navigate(loginHref())}
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
