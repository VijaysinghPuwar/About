import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      try {
        const url = window.location.href;
        // Handle PKCE / OAuth code exchange. Magic links with `?code=` also flow through here.
        if (url.includes('code=')) {
          const { error } = await supabase.auth.exchangeCodeForSession(url);
          if (error) throw error;
        }
        // For implicit-flow magic links (#access_token=...), the supabase client
        // auto-detects the session from the URL on load — nothing else to do.
        navigate('/', { replace: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Sign-in failed.';
        toast.error('Sign-in failed', { description: message });
        navigate('/login', { replace: true });
      }
    };
    run();
  }, [navigate]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
