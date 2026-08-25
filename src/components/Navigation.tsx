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
import { loginHref } from '@/lib/auth-redirect';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogoIcon } from '@/components/LogoIcon';

// Order mirrors the page: work first, then the record, then supporting detail.
const sections = [
  { name: 'Work', id: 'projects' },
  { name: 'Journey', id: 'experience' },
  { name: 'Capabilities', id: 'skills' },
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
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
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
    // Solid on scroll rather than translucent-with-blur: the rule grid behind
    // the hero was showing through the bar and vibrating against the nav text.
    <nav className={cn(
      "fixed top-0 z-50 w-full border-b transition-colors duration-200",
      scrolled ? "border-border bg-background" : "border-transparent bg-transparent"
    )}>
      <div className="container mx-auto flex h-16 max-w-[1180px] items-center justify-between px-5">
        <button onClick={() => scrollTo('home')} aria-label="Vijaysingh Puwar — back to top" className="flex h-11 items-center">
          <LogoIcon size={26} withName />
        </button>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {isHomePage ? (
            sections.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={cn(
                  "relative flex h-11 items-center px-3.5 text-[14px] transition-colors",
                  activeSection === item.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.name}
                {activeSection === item.id && (
                  <span className="absolute bottom-2.5 left-3.5 right-3.5 h-px bg-primary" />
                )}
              </button>
            ))
          ) : (
            <Link to="/" className="flex h-11 items-center px-3.5 text-[14px] text-muted-foreground transition-colors hover:text-foreground">
              ← Back Home
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-2.5">
          <a
            href="/resume.pdf"
            download
            className="btn-outline hidden h-9 items-center gap-2 rounded-md px-3.5 text-[13.5px] font-medium lg:inline-flex"
          >
            Résumé <span className="font-mono text-[11px] text-muted-dim">PDF</span>
          </a>
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-muted text-xs">{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 border-border bg-card">
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
              <Link to={loginHref()}><LogIn className="w-4 h-4 mr-1" /> Sign In</Link>
            </Button>
          )}
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle compact />
          <Sheet open={isOpen} onOpenChange={(open) => {
              setIsOpen(open);
              document.body.style.overflow = open ? 'hidden' : '';
            }}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-11 w-11 px-0" aria-label="Open navigation menu">
                <Menu className="w-5 h-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] border-border bg-background">
              <div className="flex flex-col gap-4 mt-6">
                <div className="border-b border-border pb-3">
                  <LogoIcon size={28} />
                  <div className="text-sm text-muted-foreground">Cybersecurity Engineer</div>
                </div>
                {isHomePage ? (
                  sections.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollTo(item.id)}
                      className={cn(
                        "px-3 py-2 min-h-[44px] rounded-md text-sm font-medium transition-colors text-left flex items-center",
                        activeSection === item.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
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
                <div className="border-t border-border pt-3">
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
                    <Button size="sm" className="w-full gradient-btn rounded-md" asChild onClick={() => setIsOpen(false)}>
                      <Link to={loginHref()}><LogIn className="w-4 h-4 mr-2" /> Sign In</Link>
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
