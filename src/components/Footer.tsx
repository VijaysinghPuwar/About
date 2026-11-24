import { useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogoIcon } from '@/components/LogoIcon';
import { isReaderPath } from '@/lib/routes';

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
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: 'smooth' });
    } else {
      // Off the home page the sections are not in the document; go there first.
      navigate(`/#${id}`);
    }
  }, [navigate]);

  if (isReaderPath(pathname)) return null;

  /* Each link is its own 40px row of the wrap.

     They used to be bare 22px text with the `.tap-44` helper growing an
     invisible 44px hit area around each. On a phone the six links wrap onto
     two lines 22px apart, so the hit areas of the second line covered the
     lower half of the first and, painting later, won: a tap on "Work" opened
     Books, and "Journey" opened Videos. A link that is as tall as its target
     cannot be overlapped by the one beneath it. */
  const link = 'inline-flex h-10 items-center text-muted-foreground transition-colors hover:text-primary';

  return (
    <footer className="relative z-[1] border-t border-border">
      <div className="page-gutter container mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-6 gap-y-2 py-4">
        <LogoIcon size={22} />
        <span className="font-mono text-[11.5px] text-muted-dim">
          © {new Date().getFullYear()} Vijaysingh Puwar
        </span>

        <nav aria-label="Footer" className="flex w-full flex-wrap gap-x-[18px] text-[13.5px] sm:ml-auto sm:w-auto">
          {navLinks.map(l => (
            <button key={l.id} type="button" onClick={() => scrollTo(l.id)} className={link}>
              {l.label}
            </button>
          ))}
          <Link to="/books" className={link}>Books</Link>
          <Link to="/videos" className={link}>Videos</Link>
        </nav>
      </div>
    </footer>
  );
}
