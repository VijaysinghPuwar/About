import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ShieldX, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function Blocked() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) navigate('/login');
      else if (profile?.status === 'approved') navigate('/');
      else if (profile?.status === 'pending') navigate('/pending');
    }
  }, [user, profile, loading, navigate]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4">
      <Helmet>
        <title>Access Denied | Vijaysingh Puwar</title>
      </Helmet>
      <div className="absolute inset-0 bg-gradient-to-b from-destructive/5 via-transparent to-transparent" />
      <div className="absolute inset-0 cyber-grid opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md text-center"
      >
        <div className="rounded-2xl border border-destructive/20 bg-card/80 backdrop-blur-sm p-8 space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20">
            <ShieldX className="w-8 h-8 text-destructive" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
            <p className="text-muted-foreground">
              Your account has been blocked. If you believe this is an error, please contact the administrator.
            </p>
          </div>

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
