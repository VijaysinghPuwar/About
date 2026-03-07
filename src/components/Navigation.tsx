import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, Shield, Terminal, FileText, User, Mail, Briefcase, LogIn, LogOut, Settings, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase } from '@/integrations/supabase/client';

const navItems = [
  { name: 'Home', path: '/', icon: Terminal },
  { name: 'Projects', path: '/projects', icon: Briefcase },
  { name: 'Writeups', path: '/writeups', icon: FileText },
  { name: 'Resume', path: '/resume', icon: User },
  { name: 'About', path: '/about', icon: Shield },
  { name: 'Contact', path: '/contact', icon: Mail },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const { user, profile, isAdmin, signOut } = useAuth();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUnreadCount();
    }
  }, [isAdmin]);

  const fetchUnreadCount = async () => {
    const { count } = await supabase
      .from('admin_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false);
    setUnreadCount(count || 0);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const userInitials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || '?';

  const NavLink = ({ item, mobile = false }: { item: typeof navItems[0]; mobile?: boolean }) => {
    const active = isActive(item.path);
    const Icon = item.icon;
    return (
      <Link
        to={item.path}
        onClick={() => mobile && setIsOpen(false)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
          "hover:bg-card-elevated hover:text-primary",
          active
            ? "bg-primary/10 text-primary border border-primary/20 glow-cyan"
            : "text-muted-foreground hover:text-foreground",
          mobile && "w-full justify-start"
        )}
      >
        <Icon className="w-4 h-4" />
        {item.name}
      </Link>
    );
  };

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
          <Avatar className="h-9 w-9 border border-border/50">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || ''} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">{userInitials}</AvatarFallback>
          </Avatar>
          {profile?.status === 'pending' && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-warning border-2 border-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card border-border">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-foreground truncate">{profile?.full_name || 'User'}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          {profile?.status === 'pending' && (
            <Badge variant="outline" className="mt-1 text-warning border-warning/30 text-xs">Pending</Badge>
          )}
        </div>
        <DropdownMenuSeparator />
        {isAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                <Settings className="w-4 h-4" />
                Admin Dashboard
                {unreadCount > 0 && (
                  <Badge className="ml-auto bg-destructive text-destructive-foreground text-xs h-5 min-w-5 flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="relative">
            <Shield className="w-8 h-8 text-primary" />
            <div className="absolute inset-0 w-8 h-8 text-primary animate-glow-pulse opacity-50" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-foreground">Vijaysingh</span>
            <span className="text-xs text-muted-foreground font-mono">cybersec.engineer</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </div>

        {/* Theme Toggle + Auth - Desktop */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle showLabel />
          {user ? (
            <UserMenu />
          ) : (
            <Button
              size="sm"
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-cyan"
            >
              <Link to="/login">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2">
          {user && <UserMenu />}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 px-0">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-card border-border">
              <div className="flex flex-col gap-6 mt-6">
                <div className="flex items-center gap-2 pb-4 border-b border-border">
                  <Shield className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-bold text-foreground">Vijaysingh Puwar</div>
                    <div className="text-sm text-muted-foreground">Cybersecurity Engineer</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <NavLink key={item.path} item={item} mobile />
                  ))}
                </div>

                <div className="pt-2">
                  <ThemeToggle showLabel />
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  {!user && (
                    <Button
                      className="w-full bg-primary hover:bg-primary/90"
                      asChild
                      onClick={() => setIsOpen(false)}
                    >
                      <Link to="/login">
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
