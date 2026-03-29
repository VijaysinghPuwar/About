import { useState, useEffect, useCallback } from 'react';
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
import { Menu, LogIn, LogOut, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogoIcon } from '@/components/LogoIcon';

const sections = [
  { name: 'Home', id: 'home' },
  { name: 'Skills', id: 'skills' },
  { name: 'Projects', id: 'projects' },
  { name: 'Experience', id: 'experience' },
  { name: 'Contact', id: 'contact' },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();
  const { user, profile, isAdmin, signOut } = useAuth();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // IntersectionObserver for active section detection
  useEffect(() => {
    if (!isHomePage) return;
    const observers: IntersectionObserver[] = [];
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: '-40% 0px -55% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [isHomePage]);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setIsOpen(false);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const userInitials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || '?';

  return (
    <nav className={cn(
      "fixed top-0 z-50 w-full transition-all duration-300",
      scrolled
        ? "bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm"
        : "bg-transparent border-b border-transparent"
    )}>
      <div className="container flex h-14 items-center justify-between">
        <button onClick={() => scrollTo('home')} className="flex items-center gap-1 hover:opacity-80 transition-opacity">
          <LogoIcon size={36} animated />
        </button>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {isHomePage ? (
            sections.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={cn(
                  "relative px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  activeSection === item.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.name}
                {activeSection === item.id && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-primary to-secondary" />
                )}
              </button>
            ))
          ) : (
            <Link to="/" className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              ← Back Home
            </Link>
          )}
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
              <DropdownMenuContent align="end" className="w-48 glass-card">
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
            <SheetContent side="right" className="w-[280px] glass-card border-border/40">
              <div className="flex flex-col gap-4 mt-6">
                <div className="pb-3 border-b border-border/40">
                  <div className="font-bold gradient-text text-lg">VP</div>
                  <div className="text-sm text-muted-foreground">Cybersecurity Engineer</div>
                </div>
                {isHomePage ? (
                  sections.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollTo(item.id)}
                      className={cn(
                        "px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
                        activeSection === item.id ? "text-foreground bg-primary/5" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {item.name}
                    </button>
                  ))
                ) : (
                  <Link to="/" onClick={() => setIsOpen(false)} className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground">
                    ← Back Home
                  </Link>
                )}
                <div className="pt-3 border-t border-border/40">
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
                    <Button size="sm" className="w-full gradient-btn" asChild onClick={() => setIsOpen(false)}>
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
