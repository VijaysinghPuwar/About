import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogoIcon } from '@/components/LogoIcon';

// Order mirrors the page: work first, then the record, then supporting detail.
const sections = [
  { name: 'Work', id: 'projects' },
  { name: 'Journey', id: 'experience' },
  { name: 'Capabilities', id: 'skills' },
  { name: 'Contact', id: 'contact' },
];

/** Distance the fixed bar covers, so a scrolled-to heading clears it. */
const BAR_HEIGHT = 72;

export function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
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

  /**
   * The open menu holds the page still and closes on Escape.
   *
   * Locking `body` used to shift the layout sideways on Windows, where Chrome
   * draws a scrollbar that occupies width. `scrollbar-gutter: stable` in
   * `index.css` reserves that space on both platforms, so the lock is now
   * invisible on either.
   */
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  /** A route change must never leave the panel open over the new page. */
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - BAR_HEIGHT;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setMenuOpen(false);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setMenuOpen(false);
  };

  const userInitials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || '?';

  return (
    // Solid on scroll rather than translucent-with-blur: the rule grid behind
    // the hero was showing through the bar and vibrating against the nav text.
    // The open menu takes the solid treatment too, so the panel and the bar it
    // hangs from read as one surface.
    <nav className={cn(
      'fixed top-0 z-50 w-full border-b transition-colors duration-200',
      scrolled || menuOpen ? 'border-border bg-background' : 'border-transparent bg-transparent'
    )}>
      <div className="page-gutter container mx-auto flex h-16 max-w-[1180px] items-center gap-6">
        <button
          onClick={() => scrollTo('home')}
          aria-label="Vijaysingh Puwar, back to top"
          className="flex h-11 shrink-0 items-center"
        >
          <LogoIcon size={26} withName />
        </button>

        {/* Desktop and tablet.

            The section links and the résumé button used to part company here:
            links appeared at `md`, the résumé only at `lg`. A tablet therefore
            got a navigation bar with no way to take the document away, which
            is the one thing a recruiter on an iPad is there to do. Both now
            appear together. */}
        <div className="ml-auto hidden items-center gap-px wide:flex">
          {isHomePage ? (
            sections.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                aria-current={activeSection === item.id ? 'true' : undefined}
                className={cn(
                  'relative flex h-11 items-center px-[13px] text-[14px] transition-colors',
                  activeSection === item.id
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {item.name}
                {activeSection === item.id && (
                  <span className="absolute bottom-[13px] left-[13px] right-[13px] h-px bg-primary" />
                )}
              </button>
            ))
          ) : (
            <Link to="/" className="flex h-11 items-center px-[13px] text-[14px] text-muted-foreground transition-colors hover:text-foreground">
              ← Back home
            </Link>
          )}

          <a
            href="/resume.pdf"
            download
            className="btn-outline ml-3.5 inline-flex h-[34px] items-center gap-2 rounded-md px-[15px] text-[13.5px] font-medium"
          >
            Résumé <span className="font-mono text-[11px] text-muted-dim">PDF</span>
          </a>

          <div className="ml-2.5">
            <ThemeToggle />
          </div>

          {/* Signed out, the bar carries no account control at all: a recruiter
              has nothing to sign in to, and the one gated thing on the site
              (the email address) offers its own sign-in where it is used.
              Signed in, the avatar stays so the owner can reach /admin and get
              back out again. */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="ml-1.5 h-8 w-8 rounded-full p-0">
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-muted text-xs">{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 border-border bg-card">
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-medium">{profile?.full_name || 'User'}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" /> Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile */}
        <div className="ml-auto flex items-center gap-2 wide:hidden">
          <ThemeToggle compact />
          <button
            type="button"
            onClick={() => setMenuOpen(o => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="flex h-11 w-11 items-center justify-center rounded-md border border-border bg-card"
          >
            {/* Three rules rather than a glyph, so the closed and open states
                are the same object rotated instead of two different icons. */}
            <span className="flex w-[15px] flex-col gap-[3px]" aria-hidden="true">
              <span className={cn('h-px w-full bg-foreground transition-transform duration-200', menuOpen && 'translate-y-1 rotate-45')} />
              <span className={cn('h-px w-full bg-foreground transition-opacity duration-200', menuOpen && 'opacity-0')} />
              <span className={cn('h-px w-full bg-foreground transition-transform duration-200', menuOpen && '-translate-y-1 -rotate-45')} />
            </span>
          </button>
        </div>
      </div>

      {/* The panel drops inline from the bar rather than sliding in from the
          right. A slide-in sheet is a second surface with its own scroll and
          its own close affordance; this is the same bar, longer, and the
          résumé download the old mobile menu never offered at all. */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="page-gutter flex flex-col border-y border-border bg-background pb-4 pt-1.5 wide:hidden"
        >
          {isHomePage ? (
            sections.map((item, i) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={cn(
                  'flex h-12 items-center text-left text-[15px] transition-colors',
                  i < sections.length - 1 && 'border-b border-border',
                  activeSection === item.id ? 'text-primary' : 'text-foreground'
                )}
              >
                {item.name}
              </button>
            ))
          ) : (
            <Link to="/" className="flex h-12 items-center text-[15px] text-foreground">
              ← Back home
            </Link>
          )}

          <a
            href="/resume.pdf"
            download
            onClick={() => setMenuOpen(false)}
            className="mt-3.5 flex h-[46px] items-center justify-center rounded-md bg-primary text-[15px] font-semibold text-primary-foreground"
          >
            Download résumé
          </a>

          {user && (
            <div className="mt-3.5 flex flex-col gap-1 border-t border-border pt-3">
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-11 items-center text-[14px] text-muted-foreground"
                >
                  <Settings className="mr-2 h-4 w-4" /> Admin
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="flex h-11 items-center text-left text-[14px] text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
