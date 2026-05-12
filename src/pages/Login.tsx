import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Loader2, Github, CheckCircle2, Mail } from 'lucide-react';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const emailSchema = z
  .string()
  .trim()
  .email({ message: 'Please enter a valid email address.' })
  .max(255, { message: 'Email must be less than 255 characters.' });

export default function Login() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentToAddress, setSentToAddress] = useState('');

  const { user, profile, loading: authLoading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user && profile) {
      if (profile.status === 'approved') navigate('/');
      else if (profile.status === 'blocked') navigate('/blocked');
      else navigate('/pending');
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

  const handleGithubSignIn = async () => {
    setGithubLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        toast.error('Sign in failed', { description: error.message });
        setGithubLoading(false);
      }
    } catch (err) {
      toast.error('Sign in failed', {
        description: err instanceof Error ? err.message : 'An unexpected error occurred.',
      });
      setGithubLoading(false);
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

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 hero-grid-bg">
      <Helmet>
        <title>Sign In | Vijaysingh Puwar</title>
      </Helmet>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 space-y-6">
          {/* Logo */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-border">
              <span className="text-2xl font-bold gradient-text">VJ</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Welcome</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Sign in to request access to the full portfolio.
              </p>
            </div>
          </div>

          {/* OAuth buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading || githubLoading || emailLoading}
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

            <button
              onClick={handleGithubSignIn}
              disabled={googleLoading || githubLoading || emailLoading}
              aria-label="Continue with GitHub"
              className="w-full h-12 rounded-md font-medium text-base bg-[#1F1F1F] text-white hover:bg-[#2A2A2A] transition-colors inline-flex items-center justify-center disabled:opacity-50 border border-white/10"
            >
              {githubLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Github className="w-5 h-5 mr-2" aria-hidden="true" />
              )}
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3" role="separator" aria-label="or">
            <Separator className="flex-1" />
            <span className="text-muted-foreground text-xs uppercase tracking-wider">or</span>
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
                className="h-12"
              />
              {emailError && (
                <p id="email-error" role="alert" className="text-destructive text-xs">
                  {emailError}
                </p>
              )}
              <button
                type="submit"
                disabled={emailLoading || googleLoading || githubLoading}
                className="w-full h-12 rounded-md font-medium text-base bg-primary text-primary-foreground hover:bg-primary/90 transition-colors inline-flex items-center justify-center disabled:opacity-50"
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

          <p className="text-center text-xs text-muted-foreground">
            Sign in to access the full project portfolio and resume.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
