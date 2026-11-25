import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';

/*
  Who is signed in, if anyone.

  Almost nobody is. This is a portfolio: the visitor is a recruiter who will
  never make an account, and the two things behind one (the book reader and the
  contact address) are a small part of the site. The provider is written for
  that visitor first.

  ── what a signed-out visit costs ──

  Nothing from the backend. The Supabase client is a dynamic import, fetched
  only when there may be a session to restore (see `sessionMayExist`) or when
  someone starts to sign in. It used to be a static import of this file, which
  sits at the root of the app, so every visitor downloaded and ran 53 kB of
  client library to learn that they were not signed in.

  ── what a signed-in page load costs ──

  One read of the profile and one of the role. It used to cost eight calls.
  The provider both subscribed to auth changes and asked for the session
  itself, and the client answers a new subscriber with the session it already
  holds, so each page load ran everything twice: two profile reads, two role
  reads, two writes of `last_login_at`, and two invocations of the
  `log-auth-event` function, each recording a "login" that was a page view.
  The client reports again on every token refresh and when the tab regains
  focus, and each of those ran the set once more.

  Now a session is acted on when the person changes, not when the client
  mentions them again, and a sign-in is recorded once per sign-in (keyed on the
  `last_sign_in_at` the auth server stamps), which is what the audit log was
  for in the first place.
*/

type Client = (typeof import('@/integrations/supabase/client'))['supabase'];

let clientPromise: Promise<Client> | null = null;
const loadClient = (): Promise<Client> =>
  (clientPromise ??= import('@/integrations/supabase/client').then(m => m.supabase));

/** Routes that sign someone in, or that only a signed-in person can use. */
const AUTH_PATHS = /^\/(login|auth\/|admin|blocked|\.lovable\/)|^\/books\/[^/]+\/read/;

/**
 * Whether it is worth loading the client to look for a session.
 *
 * True when the browser holds a stored session (or a sign-in half way through,
 * which leaves a `code-verifier` under the same prefix), when the URL is an
 * auth redirect, when the route is one of the auth routes, and always inside a
 * frame: in the Lovable editor the session is brokered from the parent window
 * and is not in this window's storage to be found.
 */
function sessionMayExist(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.parent !== window) return true;
  if (AUTH_PATHS.test(window.location.pathname)) return true;
  if (/[#?&](access_token|refresh_token|code|error_description)=/.test(window.location.hash + window.location.search)) {
    return true;
  }
  try {
    for (let i = 0; i < localStorage.length; i++) {
      if (/^sb-.+-auth-token/.test(localStorage.key(i) ?? '')) return true;
    }
  } catch {
    // Storage is blocked, so no session can have been kept in it.
  }
  return false;
}

/** Remembers which sign-in has been recorded, so a page view is not logged as one. */
const SIGN_IN_MARK = 'vj-sign-in-recorded';

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
  /** True until the user_roles check for the current session has finished
      (or there is no session). ProtectedRoute must gate requireAdmin on this
      too, or an admin gets bounced to "/" before the roles query resolves. */
  adminLoading: boolean;
  isAdmin: boolean;
  /** Loads the client and starts listening for a session. The sign-in page
      calls it on mount, so a sign-in finished in another tab is noticed here. */
  connect: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isMissingTableError = (e: unknown): boolean => {
  const err = e as { code?: string; message?: string } | null;
  if (!err) return false;
  return err.code === 'PGRST205' || /schema cache/i.test(err.message || '');
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // Decided once, before the first render: with no session to look for there is
  // nothing to wait on, and the page must not render a loading state for it.
  const [expectSession] = useState(sessionMayExist);

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(expectSession);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(expectSession);

  /** The person the profile and role were last read for. */
  const actedOn = useRef<string | null>(null);
  const unsubscribe = useRef<(() => void) | null>(null);
  const connecting = useRef<Promise<void> | null>(null);

  // Three outcomes:
  //   1. row found            → success
  //   2. no row exists        → "not provisioned yet"; ProtectedRoute sends
  //                             the visitor to /login
  //   3. Supabase / net error → one retry; if that also fails, profileError is
  //                             set so ProtectedRoute shows an error instead
  //                             of silently redirecting.
  const fetchProfile = useCallback(async (userId: string, isRetry = false) => {
    const retry = () => { setTimeout(() => { void fetchProfile(userId, true); }, 1000); };
    try {
      const supabase = await loadClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        // Backend not provisioned with a profiles table: treat as "no
        // profile". The public site still renders.
        if (isMissingTableError(error)) {
          setProfile(null);
          setProfileError(null);
          setLoading(false);
          return;
        }
        console.warn('Profile fetch failed:', error.message || error);
        if (!isRetry) { retry(); return; }
        setProfileError(new Error(error.message || 'Failed to fetch profile'));
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(data as Profile | null);
      setProfileError(null);
      setLoading(false);
    } catch (err) {
      if (isMissingTableError(err)) {
        setProfile(null);
        setProfileError(null);
        setLoading(false);
        return;
      }
      console.warn('Profile fetch threw:', err);
      if (!isRetry) { retry(); return; }
      setProfileError(err instanceof Error ? err : new Error(String(err)));
      setProfile(null);
      setLoading(false);
    }
  }, []);

  const checkAdminRole = useCallback(async (userId: string) => {
    try {
      const supabase = await loadClient();
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      // A missing table or any other error means not an admin.
      setIsAdmin(!error && !!data);
    } catch {
      setIsAdmin(false);
    } finally {
      // The roles query has answered (or failed): the admin gate may decide.
      setAdminLoading(false);
    }
  }, []);

  /** Stamps `last_login_at` and writes the audit event, once per sign-in. */
  const recordSignIn = useCallback(async (signedIn: User) => {
    const mark = `${signedIn.id}:${signedIn.last_sign_in_at ?? ''}`;
    try {
      if (localStorage.getItem(SIGN_IN_MARK) === mark) return;
      localStorage.setItem(SIGN_IN_MARK, mark);
    } catch {
      // No storage to remember it in. Recording it again is the safe side.
    }

    try {
      const supabase = await loadClient();
      await supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('user_id', signedIn.id);

      // For suspicious-login detection. Silent on failure.
      await supabase.functions.invoke('log-auth-event', {
        body: {
          user_id: signedIn.id,
          email: signedIn.email || '',
          event_type: 'login',
          user_agent: navigator.userAgent,
        },
      });
    } catch {
      // Never block a sign-in on its own bookkeeping.
    }
  }, []);

  const apply = useCallback((next: Session | null) => {
    setSession(next);
    setUser(next?.user ?? null);

    const person = next?.user ?? null;
    if (!person) {
      actedOn.current = null;
      setProfile(null);
      setProfileError(null);
      setIsAdmin(false);
      setAdminLoading(false);
      setLoading(false);
      return;
    }

    // The same person again: a refreshed token, a refocused tab, the client's
    // greeting to a new subscriber. Nothing about them needs reading twice.
    if (actedOn.current === person.id) return;
    actedOn.current = person.id;

    setAdminLoading(true);
    // Deferred: the client must not be called from inside its own callback.
    setTimeout(() => {
      void fetchProfile(person.id);
      void checkAdminRole(person.id);
      void recordSignIn(person);
    }, 0);
  }, [fetchProfile, checkAdminRole, recordSignIn]);

  const connect = useCallback((): Promise<void> => {
    connecting.current ??= loadClient().then(supabase => {
      // Subscribing answers with the current session, signed in or not, so
      // this one listener is also the initial read.
      const { data } = supabase.auth.onAuthStateChange((_event, next) => apply(next));
      unsubscribe.current = () => data.subscription.unsubscribe();
    }).catch(err => {
      // The client failed to load (offline, blocked). The site stays signed
      // out and usable, and a later attempt may try again.
      connecting.current = null;
      console.warn('Auth client failed to load:', err);
      apply(null);
    });
    return connecting.current;
  }, [apply]);

  useEffect(() => {
    if (expectSession) void connect();
    return () => {
      unsubscribe.current?.();
      unsubscribe.current = null;
      connecting.current = null;
    };
  }, [expectSession, connect]);

  const refetchProfile = async () => {
    if (!user) return;
    setProfileError(null);
    setLoading(true);
    await fetchProfile(user.id);
  };

  // Google sign-in is brokered by Lovable Cloud, not by Supabase directly:
  // lovable.auth.signInWithOAuth navigates to the origin-relative broker path
  // /~oauth/initiate, which only Lovable's own host serves. On a local dev
  // server that path falls through to the SPA and renders NotFound.
  //
  // It stays brokered because the native flow is not available: GET
  // /auth/v1/authorize?provider=google on this project answers "Unsupported
  // provider: missing OAuth secret". To move to the native flow, set the
  // Google client ID and secret under Supabase → Authentication → Providers →
  // Google, add every dev origin under URL Configuration → Redirect URLs, and
  // swap this body for supabase.auth.signInWithOAuth({ provider: 'google',
  // options: { redirectTo: `${window.location.origin}/auth/callback` } }).
  const signInWithGoogle = async () => {
    try {
      // Listening first: the broker can hand tokens back without a redirect,
      // and the session it sets has to be heard here.
      await connect();
      const { lovable } = await import('@/integrations/lovable/index');
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: `${window.location.origin}/auth/callback`,
      });
      if (result.error) {
        const err = result.error as unknown;
        return { error: err instanceof Error ? err : new Error(String(err)) };
      }
      // Either the browser is redirecting to Google, or the session is already set.
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  const signOut = async () => {
    const supabase = await loadClient();
    await supabase.auth.signOut();
    setProfile(null);
    setProfileError(null);
    setIsAdmin(false);
    setAdminLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, profileError, loading, adminLoading, isAdmin, connect, signInWithGoogle, signOut, refetchProfile }}>
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
