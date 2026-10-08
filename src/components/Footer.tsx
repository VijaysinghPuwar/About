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

  /* The back-to-top button is fixed 20-24px from the right edge and is always
     showing by the time the footer is on screen. Below ~1240px the footer's
     column reaches under it, and it sat on the last link: at 854px "Contact"
     read as "Co". The right padding reserves the button's width there. */
  return (
    <footer className="relative z-[1] border-t border-border">
      <div className="page-gutter container mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-6 gap-y-4 py-6 max-[1239px]:!pr-[76px]">
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
          <Link to="/books" className="tap-44 text-muted-foreground transition-colors hover:text-primary">
            Books
          </Link>
        </nav>
      </div>
    </footer>
  );
}
