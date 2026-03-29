import { Github, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/80 backdrop-blur-xl py-6">
      <div className="container max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-bold gradient-text">VP</span>
          <p className="text-sm text-muted-foreground font-mono">
            © {new Date().getFullYear()} · Built with intent
          </p>
        </div>
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
