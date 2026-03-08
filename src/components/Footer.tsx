import { Github, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-8">
      <div className="container max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Vijaysingh Puwar · Cybersecurity Engineer
        </div>
        <div className="flex items-center gap-4">
          <a href="mailto:contact@vijaysinghpuwar.com" className="text-muted-foreground hover:text-foreground transition-colors">
            <Mail className="w-4 h-4" />
          </a>
          <a href="https://github.com/vijaysinghpuwar" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
            <Github className="w-4 h-4" />
          </a>
          <a href="https://linkedin.com/in/vijaysinghpuwar" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
            <Linkedin className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
