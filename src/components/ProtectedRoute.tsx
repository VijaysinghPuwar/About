import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, profile, profileError, loading, isAdmin, refetchProfile, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (profileError) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-xl font-semibold text-foreground">Couldn't load your profile</h1>
          <p className="text-sm text-muted-foreground">{profileError.message}</p>
          <div className="flex justify-center gap-2 pt-2">
            <Button onClick={() => { void refetchProfile(); }}>Try again</Button>
            <Button variant="outline" onClick={() => { void signOut(); }}>Sign out</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return <Navigate to="/login" replace />;
  if (profile.status === 'blocked') return <Navigate to="/blocked" replace />;
  if (profile.status === 'pending') return <Navigate to="/pending" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}
