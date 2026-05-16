import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  status: 'pending' | 'approved' | 'blocked';
  last_login_at: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  profileError: Error | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
            checkAdminRole(session.user.id);
            updateLastLogin(session.user.id, session.user.email || '');
          }, 0);
        } else {
          setProfile(null);
          setProfileError(null);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        checkAdminRole(session.user.id);
        updateLastLogin(session.user.id, session.user.email || '');
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Three outcomes:
  //   1. row found            → data truthy, error null  → success
  //   2. no row exists        → data null,  error null   → legit "not provisioned yet"
  //                                                        falls through to existing /login
  //                                                        redirect in ProtectedRoute
  //   3. Supabase / net error → error truthy or thrown   → toast + one retry; if retry
  //                                                        also fails, set profileError so
  //                                                        ProtectedRoute renders an
  //                                                        inline error UI instead of
  //                                                        silently redirecting to /login.
  const fetchProfile = async (userId: string, isRetry = false) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        if (!isRetry) {
          toast.error("Couldn't load your profile, retrying…");
          setTimeout(() => { void fetchProfile(userId, true); }, 1000);
          return;
        }
        setProfileError(new Error(error.message || 'Failed to fetch profile'));
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(data as Profile | null);
      setProfileError(null);
      setLoading(false);
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      if (!isRetry) {
        toast.error("Couldn't load your profile, retrying…");
        setTimeout(() => { void fetchProfile(userId, true); }, 1000);
        return;
      }
      setProfileError(err instanceof Error ? err : new Error(String(err)));
      setProfile(null);
      setLoading(false);
    }
  };

  const refetchProfile = async () => {
    if (!user) return;
    setProfileError(null);
    setLoading(true);
    await fetchProfile(user.id);
  };

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      setIsAdmin(!error && !!data);
    } catch {
      setIsAdmin(false);
    }
  };

  const updateLastLogin = async (userId: string, email: string) => {
    try {
      await supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('user_id', userId);

      // Log auth event for suspicious login detection
      await supabase.functions.invoke('log-auth-event', {
        body: {
          user_id: userId,
          email,
          event_type: 'login',
          user_agent: navigator.userAgent,
        },
      });
    } catch {
      // silent fail — don't block login
    }
  };

  // Native Supabase OAuth (same path as GitHub). Supabase redirects to
  // /auth/callback with a session hash that detectSessionInUrl consumes;
  // identity conflicts surface there via parseOAuthErrorFromUrl. This does
  // not depend on Lovable Cloud, so it works regardless of Cloud balance.
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        return { error: error instanceof Error ? error : new Error(String(error)) };
      }
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setProfileError(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, profileError, loading, isAdmin, signInWithGoogle, signOut, refetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
