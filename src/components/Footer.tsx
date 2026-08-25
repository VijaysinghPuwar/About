import { useCallback } from 'react';
import { LogoIcon } from '@/components/LogoIcon';

const navLinks = [
  { label: 'Work', id: 'projects' },
  { label: 'Journey', id: 'experience' },
  { label: 'Capabilities', id: 'skills' },
  { label: 'Contact', id: 'contact' },
];

/**
 * A rule, a mark, a year, four links. The previous footer carried a fading
 * gradient hairline, a duplicate set of social icons already present in the
 * contact section directly above it, and a ⌘K hint styled with hardcoded cyan
 * hex values that ignored the theme.
 */
export function Footer() {
  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  return (
    <footer className="relative z-[1] border-t border-border">
      <div className="container mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-6 gap-y-4 px-5 py-6">
        <LogoIcon size={22} />
        <span className="font-mono text-[11.5px] text-muted-dim">
          © {new Date().getFullYear()} Vijaysingh Puwar
        </span>

        <nav className="ml-auto flex flex-wrap gap-x-[18px] text-[13.5px]">
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="tap-44 text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>
    </footer>
  );
}
