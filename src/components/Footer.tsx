import { Link } from 'react-router-dom';
import { Github, Linkedin, Youtube, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const quickLinks = [
  { name: 'Projects', path: '/projects' },
  { name: 'Writeups', path: '/writeups' },
  { name: 'Resume', path: '/resume' },
  { name: 'About', path: '/about' },
];

const socialLinks = [
  {
    name: 'GitHub',
    url: 'https://github.com/vijaysingh-puwar',
    icon: Github,
  },
  {
    name: 'LinkedIn', 
    url: 'https://linkedin.com/in/vijaysingh-puwar',
    icon: Linkedin,
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com/@vijaysingh-puwar',
    icon: Youtube,
  },
  {
    name: 'Email',
    url: 'mailto:vijaysingh.puwar@example.com',
    icon: Mail,
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative border-t border-border/40 bg-card/30 backdrop-blur-sm">
      {/* Subtle grid background */}
      <div className="absolute inset-0 cyber-grid opacity-30" />
      
      <div className="relative container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <div>
                <div className="font-bold text-foreground">Vijaysingh</div>
                <div className="text-sm text-muted-foreground font-mono">cybersec.engineer</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Building secure systems with code, detections, and hands-on labs. 
              Cybersecurity engineer specializing in cloud security and threat detection.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <div className="space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <div className="space-y-2">
              <a 
                href="/resume.pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Resume (PDF)
              </a>
              <Link
                to="/writeups"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                CTF Writeups
              </Link>
              <Link
                to="/projects"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Security Labs
              </Link>
              <a
                href="https://github.com/vijaysingh-puwar"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                GitHub Projects
              </a>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Connect</h3>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Button
                    key={social.name}
                    variant="ghost"
                    size="sm"
                    asChild
                    className="w-10 h-10 p-0 hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 mt-8 border-t border-border/40 gap-4">
          <div className="text-sm text-muted-foreground">
            © {currentYear} Vijaysingh Puwar. All rights reserved.
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Built with React + Vite</span>
            <span className="hidden md:inline">•</span>
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}