import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogoIcon } from '@/components/LogoIcon';
import { Helmet } from 'react-helmet-async';
import { Loader2, CheckCircle2, Mail } from 'lucide-react';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { consumeNext, storeNext } from '@/lib/auth-redirect';

const emailSchema = z
  .string()
  .trim()
  .email({ message: 'Please enter a valid email address.' })
  .max(255, { message: 'Email must be less than 255 characters.' });

export default function Login() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentToAddress, setSentToAddress] = useState('');

  const { user, profile, loading: authLoading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Remember where the visitor was headed; /auth/callback consumes it.
  useEffect(() => {
    storeNext(searchParams.get('next'));
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && user) {
      if (profile?.status === 'blocked') navigate('/blocked');
      else navigate(consumeNext() ?? '/');
    }
  }, [user, profile, authLoading, navigate]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error('Sign in failed', { description: error.message || 'Could not sign in with Google.' });
        setGoogleLoading(false);
      }
    } catch {
      toast.error('Sign in failed', { description: 'An unexpected error occurred.' });
      setGoogleLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setEmailError(parsed.error.issues[0]?.message ?? 'Invalid email.');
      return;
    }
    setEmailLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: parsed.data,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true,
        },
      });
      if (error) {
        toast.error('Could not send link', { description: error.message });
      } else {
        setSentToAddress(parsed.data);
        setEmailSent(true);
      }
    } catch (err) {
      toast.error('Could not send link', {
        description: err instanceof Error ? err.message : 'An unexpected error occurred.',
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const resetEmailForm = () => {
    setEmailSent(false);
    setEmail('');
    setSentToAddress('');
    setEmailError(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // What signing in is for, said in terms of why this visitor is here. The
  // only two things behind an account are the reader and the contact address.
  const reading = /^\/books\/[^/]+\/read/.test(searchParams.get('next') ?? '');

  return (
    <div className="page-gutter flex min-h-[100dvh] items-center justify-center py-24">
      <Helmet>
        <title>Sign in | Vijaysingh Puwar</title>
      </Helmet>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="glass-card rounded-lg p-8 space-y-6">
          {/* The site's own mark and a heading that says what the page is. It
              read SECURE ACCESS, letter-spaced in the accent colour, over a
              boxed pair of initials: a login screen dressed as a vault door,
              which told the visitor nothing about what they were signing in
              to or why. */}
          <div className="space-y-4 text-center">
            <LogoIcon size={40} className="justify-center" />
            <div>
              <h1 className="text-[26px] font-semibold tracking-[-0.022em] text-foreground">Sign in</h1>
              <p className="mx-auto mt-2 max-w-[34ch] text-sm leading-relaxed text-muted-foreground">
                {reading
                  ? 'The reader keeps your place and carries it between devices, which is what the account is for.'
                  : 'An account shows the contact email and opens the book reader.'}
              </p>
            </div>
          </div>

          {/* Primary: Google */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading || emailLoading}
              aria-label="Continue with Google"
              className="w-full h-12 rounded-md font-medium text-base bg-foreground text-background hover:bg-foreground/90 transition-colors inline-flex items-center justify-center disabled:opacity-50"
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              Continue with Google
            </button>
          </div>

          {/* The "Continue with GitHub" button that used to sit here was removed:
              GitHub is not an enabled provider on this Supabase project
              (auth/v1/settings reports external.github = false), so the button
              could only ever return "Unsupported provider". Google and the
              email magic link are the two flows that actually work. */}

          {/* Divider */}
          <div className="flex items-center gap-3" role="separator" aria-label="Other options">
            <Separator className="flex-1" />
            <span className="text-muted-foreground text-[11px] font-mono uppercase tracking-wider">
              Other options
            </span>
            <Separator className="flex-1" />
          </div>


          {/* Magic link */}
          {emailSent ? (
            <div className="text-center space-y-3 py-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <CheckCircle2 className="w-7 h-7 text-primary" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Check your email</h2>
              <p className="text-sm text-muted-foreground">
                We sent a sign-in link to{' '}
                <span className="font-medium text-foreground">{sentToAddress}</span>. Click the link to continue.
              </p>
              <button
                onClick={resetEmailForm}
                className="text-xs text-primary hover:underline underline-offset-4"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-3" noValidate>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? 'email-error' : undefined}
                disabled={emailLoading}
                // An invalid address turns the field's own edge and focus ring
                // red. The message used to appear in red under a field still
                // ringed in the accent green, two signals disagreeing.
                className="h-12 aria-[invalid=true]:border-destructive aria-[invalid=true]:outline-destructive"
              />
              {/* The line is always in the layout. Mounted only on an error, it
                  made the card taller, and the card is centred, so it jumped. */}
              <p id="email-error" role="alert" className="min-h-4 text-xs text-destructive">
                {emailError}
              </p>
              <button
                type="submit"
                disabled={emailLoading || googleLoading}
                className="w-full h-12 rounded-md font-medium text-sm bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-border transition-colors inline-flex items-center justify-center disabled:opacity-50"
              >
                {emailLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Mail className="w-5 h-5 mr-2" aria-hidden="true" />
                )}
                Email me a sign-in link
              </button>
            </form>
          )}

          {/* The old line here promised sign-in unlocked "the full project
              portfolio and resume". Both are public: every project, every
              repository link and /resume need no account. */}
          <p className="text-center text-xs text-muted-foreground">
            The projects and the résumé are public and need no account.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
