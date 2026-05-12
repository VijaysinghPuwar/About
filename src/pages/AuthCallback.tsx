import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: number | undefined;

    // detectSessionInUrl: true on the supabase client parses the OAuth/magic-link
    // tokens automatically. Here we just wait for the resulting session, then route.
    const finish = (hasSession: boolean) => {
      if (cancelled) return;
      if (timeoutId) window.clearTimeout(timeoutId);
      if (hasSession) {
        navigate('/', { replace: true });
      } else {
        setError('We could not complete sign-in. Please try again.');
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) finish(true);
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        if (!cancelled) setError(error.message);
        return;
      }
      if (data.session) finish(true);
    });

    timeoutId = window.setTimeout(() => finish(false), 6000);

    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-xl font-semibold text-foreground">Sign-in failed</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Link to="/login" className="text-primary hover:underline underline-offset-4 text-sm">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
