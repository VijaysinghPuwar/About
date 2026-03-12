import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, Shield, LogIn, LogOut, Settings, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Projects', path: '/projects', gated: true },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, profile, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const userInitials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || '?';

  return (
    <nav className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      scrolled
        ? "bg-background/95 backdrop-blur border-b border-border/40 shadow-sm"
        : "bg-transparent border-b border-transparent"
    )}>
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Shield className="w-6 h-6 text-primary" />
          <span className="font-bold text-foreground">Vijaysingh Puwar</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.gated && !user ? '/login' : item.path}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-1.5",
                isActive(item.path)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.name}
              {item.gated && !user && <Lock className="w-3 h-3 text-muted-foreground" />}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                  <Avatar className="h-8 w-8 border border-border/50">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-muted text-xs">{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" /> Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" variant="ghost" asChild>
              <Link to="/login"><LogIn className="w-4 h-4 mr-1" /> Sign In</Link>
            </Button>
          )}
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 px-0">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-card border-border">
              <div className="flex flex-col gap-4 mt-6">
                <div className="pb-3 border-b border-border">
                  <div className="font-bold text-foreground">Vijaysingh Puwar</div>
                  <div className="text-sm text-muted-foreground">Cybersecurity Engineer</div>
                </div>
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.gated && !user ? '/login' : item.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-1.5",
                      isActive(item.path) ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.name}
                    {item.gated && !user && <Lock className="w-3 h-3 text-muted-foreground" />}
                  </Link>
                ))}
                <div className="pt-3 border-t border-border">
                  {user ? (
                    <div className="space-y-2">
                      {isAdmin && (
                        <Button variant="ghost" size="sm" className="w-full justify-start" asChild onClick={() => setIsOpen(false)}>
                          <Link to="/admin"><Settings className="w-4 h-4 mr-2" /> Admin</Link>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="w-full justify-start text-destructive" onClick={handleSignOut}>
                        <LogOut className="w-4 h-4 mr-2" /> Sign Out
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" className="w-full" asChild onClick={() => setIsOpen(false)}>
                      <Link to="/login"><LogIn className="w-4 h-4 mr-2" /> Sign In</Link>
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
