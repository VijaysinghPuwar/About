import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, Shield, Terminal, FileText, User, Mail, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

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

        {/* CTA Buttons - Desktop */}
        <div className="hidden md:flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            asChild
            className="border-primary/20 hover:border-primary/40 hover:bg-primary/5"
          >
            <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
              View Resume
            </a>
          </Button>
          <Button 
            size="sm"
            asChild
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-cyan"
          >
            <Link to="/contact">
              Get In Touch
            </Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 px-0">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-card border-border">
              <div className="flex flex-col gap-6 mt-6">
                {/* Mobile Logo */}
                <div className="flex items-center gap-2 pb-4 border-b border-border">
                  <Shield className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-bold text-foreground">Vijaysingh Puwar</div>
                    <div className="text-sm text-muted-foreground">Cybersecurity Engineer</div>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <NavLink key={item.path} item={item} mobile />
                  ))}
                </div>

                {/* Mobile CTA Buttons */}
                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  <Button 
                    variant="outline" 
                    className="w-full border-primary/20 hover:border-primary/40"
                    asChild
                  >
                    <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
                      View Resume (PDF)
                    </a>
                  </Button>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90"
                    asChild
                    onClick={() => setIsOpen(false)}
                  >
                    <Link to="/contact">
                      Get In Touch
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}