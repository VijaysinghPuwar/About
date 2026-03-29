import { Github, Linkedin, Mail } from 'lucide-react';
import { useCallback } from 'react';
import { LogoIcon } from '@/components/LogoIcon';

const navLinks = [
  { label: 'Skills', id: 'skills' },
  { label: 'Projects', id: 'projects' },
  { label: 'Experience', id: 'experience' },
  { label: 'Contact', id: 'contact' },
];

export function Footer() {
  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  return (
    <footer className="relative bg-transparent pt-0 pb-6">
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mb-6" />

      <div className="container max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LogoIcon size={24} />
          <p className="text-sm text-muted-foreground font-mono">
            © {new Date().getFullYear()} · Built with intent
          </p>
        </div>

        <nav className="flex items-center gap-4">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <a href="mailto:contact@vijaysinghpuwar.com" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Email">
            <Mail className="w-4 h-4" />
          </a>
          <a href="https://github.com/vijaysinghpuwar" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="GitHub">
            <Github className="w-4 h-4" />
          </a>
          <a href="https://linkedin.com/in/vijaysinghpuwar" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn">
            <Linkedin className="w-4 h-4" />
          </a>
          <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px]" style={{ color: '#475569' }}>
            Press{' '}
            <kbd className="inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px]" style={{ background: 'rgba(100,220,255,0.1)', border: '1px solid rgba(100,220,255,0.15)' }}>
              {typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl+'}K
            </kbd>
            {' '}to navigate
          </span>
        </div>
      </div>
    </footer>
  );
}
