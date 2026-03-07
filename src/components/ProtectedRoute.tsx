import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, profile, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!profile) return <Navigate to="/login" replace />;
  if (profile.status === 'blocked') return <Navigate to="/blocked" replace />;
  if (profile.status === 'pending') return <Navigate to="/pending" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}
