import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { loginHref } from '@/lib/auth-redirect';
import { cn } from '@/lib/utils';
import { contactEmail } from '@/lib/contact-email';

interface ProtectedEmailProps {
  /** `card` is the contact-section tile; `inline` sits in a row of text links. */
  variant?: 'inline' | 'card';
  className?: string;
}

/**
 * The email address for a signed-in visitor, and a way to sign in for anyone
 * else.
 *
 * Signed out, nothing about the address is rendered: no first letters, no
 * domain, no dots standing in for the missing part. See `@/lib/contact-email`
 * for what that does and does not protect.
 */
export function ProtectedEmail({ variant = 'inline', className }: ProtectedEmailProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    // Assembled here, inside the signed-in branch, so the signed-out render
    // never holds the string at all.
    const email = contactEmail();

    if (variant === 'card') {
      return (
        <a
          href={`mailto:${email}`}
          className={cn('panel panel-hover flex flex-col gap-1.5 rounded-lg px-[18px] py-4', className)}
        >
          <span className="meta-label">Email</span>
          <span className="truncate text-[15px] text-foreground">{email}</span>
        </a>
      );
    }

    return (
      <a
        href={`mailto:${email}`}
        className={cn('inline-flex items-center underline-offset-4 hover:text-foreground hover:underline', className)}
      >
        {email}
      </a>
    );
  }

  const signIn = () => navigate(loginHref());

  if (variant === 'card') {
    return (
      <button
        type="button"
        onClick={signIn}
        className={cn('panel panel-hover flex flex-col gap-1.5 rounded-lg px-[18px] py-4 text-left', className)}
      >
        <span className="meta-label flex items-center gap-1.5">
          Email
          <Lock className="h-[10px] w-[10px]" aria-hidden="true" />
        </span>
        <span className="text-[15px] text-foreground">Sign in to view</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={signIn}
      className={cn(
        'inline-flex items-center gap-1.5 underline-offset-4 hover:text-foreground hover:underline',
        className,
      )}
    >
      <Lock className="h-3 w-3" aria-hidden="true" />
      {/* The explanation is read out at every width and shown from `sm`. On a
          phone the padlock says it, and the full phrase pushed the last link
          in the row onto a line of its own. */}
      <span>
        Email<span className="max-sm:sr-only">, sign in to view</span>
      </span>
    </button>
  );
}
