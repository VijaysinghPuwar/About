import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface TerminalLine {
  type: 'command' | 'output';
  text: string;
  style?: 'default' | 'name' | 'role' | 'skills' | 'mission';
  speed?: number; // ms per char (commands only)
  pauseAfter?: number; // ms to wait after this line
}

const lines: TerminalLine[] = [
  { type: 'command', text: '$ whoami', speed: 40, pauseAfter: 300 },
  { type: 'output', text: 'Vijaysingh Puwar', style: 'name', pauseAfter: 400 },
  { type: 'output', text: '', pauseAfter: 100 },
  { type: 'command', text: '$ cat role.txt', speed: 40, pauseAfter: 300 },
  { type: 'output', text: 'Cybersecurity Engineer', style: 'role', pauseAfter: 400 },
  { type: 'output', text: '', pauseAfter: 100 },
  { type: 'command', text: '$ cat mission.txt', speed: 40, pauseAfter: 300 },
  { type: 'output', text: 'I secure enterprise infrastructure, automate security', style: 'mission', pauseAfter: 50 },
  { type: 'output', text: 'operations, and build detection pipelines that catch', style: 'mission', pauseAfter: 50 },
  { type: 'output', text: 'threats before they escalate.', style: 'mission', pauseAfter: 400 },
  { type: 'output', text: '', pauseAfter: 100 },
  { type: 'command', text: '$ ls skills/', speed: 40, pauseAfter: 300 },
  { type: 'output', text: 'Python  PowerShell  Active-Directory  Splunk  AWS  Docker  Linux  Nmap  Wireshark  SIEM  Ansible  IAM  Cisco  Firewalls', style: 'skills', pauseAfter: 400 },
  { type: 'output', text: '', pauseAfter: 100 },
  { type: 'command', text: '$ ./connect.sh', speed: 40, pauseAfter: 200 },
];

export function TerminalHero() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // visibleLines: array of { text, type, style } that are fully rendered
  const [visibleLines, setVisibleLines] = useState<{ text: string; type: string; style: string }[]>([]);
  const [currentTyping, setCurrentTyping] = useState('');
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'pause' | 'done'>('typing');
  const [showButtons, setShowButtons] = useState(false);

  const currentLine = lineIndex < lines.length ? lines[lineIndex] : null;

  // Advance to next line
  const advanceLine = useCallback(() => {
    if (!currentLine) return;
    // Push completed line
    setVisibleLines(prev => [...prev, {
      text: currentLine.text,
      type: currentLine.type,
      style: currentLine.style || 'default',
    }]);
    setCurrentTyping('');
    setCharIndex(0);

    if (lineIndex + 1 >= lines.length) {
      setPhase('done');
      setTimeout(() => setShowButtons(true), 300);
    } else {
      setPhase('pause');
    }
  }, [currentLine, lineIndex]);

  useEffect(() => {
    if (!currentLine) return;

    if (phase === 'pause') {
      const prev = lines[lineIndex];
      const timer = setTimeout(() => {
        setLineIndex(i => i + 1);
        setPhase('typing');
      }, prev?.pauseAfter || 200);
      return () => clearTimeout(timer);
    }

    if (phase !== 'typing') return;

    // Output lines appear instantly
    if (currentLine.type === 'output') {
      advanceLine();
      return;
    }

    // Typewriter for commands
    if (charIndex < currentLine.text.length) {
      const timer = setTimeout(() => {
        setCurrentTyping(currentLine.text.slice(0, charIndex + 1));
        setCharIndex(c => c + 1);
      }, currentLine.speed || 40);
      return () => clearTimeout(timer);
    } else {
      advanceLine();
    }
  }, [phase, charIndex, currentLine, lineIndex, advanceLine]);

  const renderLine = (line: { text: string; type: string; style: string }, i: number) => {
    if (!line.text) return <div key={i} className="h-3" />;

    let className = 'font-mono text-sm leading-relaxed ';
    switch (line.style) {
      case 'name':
        className += 'text-foreground text-xl sm:text-3xl font-bold break-words';
        break;
      case 'role':
        className += 'gradient-text text-lg sm:text-xl font-semibold';
        break;
      case 'skills':
        className += 'text-success text-xs sm:text-sm';
        break;
      case 'mission':
        className += 'text-foreground/80 text-sm';
        break;
      default:
        className += line.type === 'command' ? 'text-primary' : 'text-foreground';
    }

    return (
      <div key={i} className={className}>
        {line.text}
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Terminal window */}
      <div className="glass-card rounded-xl overflow-hidden border border-border/40">
        {/* Chrome bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30 bg-card/60">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/80" />
            <div className="w-3 h-3 rounded-full bg-warning/80" />
            <div className="w-3 h-3 rounded-full bg-success/80" />
          </div>
          <span className="font-mono text-xs text-muted-foreground ml-2 select-none">
            vijaysingh@security:~$
          </span>
        </div>

        {/* Terminal body */}
        <div className="px-4 sm:px-6 py-5 min-h-[320px] sm:min-h-[380px] flex flex-col justify-start">
          {visibleLines.map((line, i) => renderLine(line, i))}

          {/* Currently typing line */}
          {phase === 'typing' && currentLine?.type === 'command' && (
            <div className="font-mono text-sm text-primary">
              {currentTyping}
              <span className="animate-terminal-blink">▊</span>
            </div>
          )}

          {/* Blinking cursor after done */}
          {phase === 'done' && !showButtons && (
            <div className="font-mono text-sm text-primary">
              <span className="animate-terminal-blink">▊</span>
            </div>
          )}

          {/* CTA buttons */}
          <AnimatePresence>
            {showButtons && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-border/20"
              >
                <button
                  onClick={() => {
                    const el = document.getElementById('projects');
                    if (el) {
                      const top = el.getBoundingClientRect().top + window.scrollY - 64;
                      window.scrollTo({ top, behavior: 'smooth' });
                    }
                  }}
                  className="inline-flex items-center justify-center h-10 px-6 rounded-md text-sm font-medium gradient-btn"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />View My Work
                </button>
                {user ? (
                  <a
                    href="/resume.pdf"
                    download
                    className="inline-flex items-center justify-center h-10 px-6 rounded-md text-sm font-medium border border-border/60 text-foreground hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />Download Resume
                  </a>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="inline-flex items-center justify-center h-10 px-6 rounded-md text-sm font-medium border border-border/60 text-foreground hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    <Lock className="w-4 h-4 mr-2" />Download Resume
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
