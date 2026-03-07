import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Clock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function Pending() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) navigate('/login');
      else if (profile?.status === 'approved') navigate('/');
      else if (profile?.status === 'blocked') navigate('/blocked');
    }
  }, [user, profile, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-warning/5 via-transparent to-transparent" />
      <div className="absolute inset-0 cyber-grid opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md text-center"
      >
        <div className="rounded-2xl border border-warning/20 bg-card/80 backdrop-blur-sm p-8 space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-warning/10 border border-warning/20">
            <Clock className="w-8 h-8 text-warning" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Access Pending</h1>
            <p className="text-muted-foreground">
              Your access request is pending approval. You'll be able to access protected content once an admin approves your account.
            </p>
          </div>

          {user && (
            <div className="px-4 py-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-sm text-muted-foreground">Signed in as</p>
              <p className="text-sm font-medium text-foreground">{user.email}</p>
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => signOut()}
            className="border-border/50 hover:border-destructive/50 hover:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
