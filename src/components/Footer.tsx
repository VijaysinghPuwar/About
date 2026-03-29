import { Github, Linkedin, Mail } from 'lucide-react';

const navLinks = [
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
];

export function Footer() {
  return (
    <footer className="relative bg-transparent pt-0 pb-6">
      {/* Gradient separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mb-6" />

      <div className="container max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <span className="font-bold gradient-text text-lg">VP</span>
          <p className="text-sm text-muted-foreground font-mono">
            © {new Date().getFullYear()} · Built with intent
          </p>
        </div>

        {/* Center nav */}
        <nav className="flex items-center gap-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right social */}
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
        </div>
      </div>
    </footer>
  );
}
