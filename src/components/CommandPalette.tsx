import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, Zap, Code, Folder, FileQuestion } from 'lucide-react';
import projects from '@/data/projects.json';

interface Command {
  category: 'Navigation' | 'Actions' | 'Skills' | 'Projects';
  label: string;
  hint?: string;
  keywords?: string;
  action: () => void;
}

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

const CATEGORY_ICONS: Record<string, typeof Compass> = {
  Navigation: Compass,
  Actions: Zap,
  Skills: Code,
  Projects: Folder,
};

function buildCommands(): Command[] {
  const nav: Command[] = [
    { category: 'Navigation', label: 'Go to Home', keywords: 'hero top', action: () => scrollTo('home') },
    { category: 'Navigation', label: 'Go to Skills', keywords: 'tech stack', action: () => scrollTo('skills') },
    { category: 'Navigation', label: 'Go to Projects', keywords: 'work portfolio', action: () => scrollTo('projects') },
    { category: 'Navigation', label: 'Go to Experience', keywords: 'timeline education', action: () => scrollTo('experience') },
    { category: 'Navigation', label: 'Go to Contact', keywords: 'email message', action: () => scrollTo('contact') },
  ];

  const actions: Command[] = [
    { category: 'Actions', label: 'Download Resume', keywords: 'cv pdf', action: () => alert('Resume download coming soon.') },
    { category: 'Actions', label: 'Open GitHub', keywords: 'code repo', action: () => window.open('https://github.com/vijaysinghpuwar', '_blank') },
    { category: 'Actions', label: 'Open LinkedIn', keywords: 'social profile', action: () => window.open('https://linkedin.com/in/vijaysinghpuwar', '_blank') },
    { category: 'Actions', label: 'Send Email', keywords: 'contact mail', action: () => { window.location.href = 'mailto:contact@vijaysinghpuwar.com'; } },
  ];

  const skillCounts: Record<string, number> = {};
  const TRACKED_SKILLS = ['Python', 'PowerShell', 'AWS', 'Docker', 'Linux', 'Nmap'];
  for (const p of projects) {
    for (const t of p.tech) {
      const match = TRACKED_SKILLS.find(s => t.toLowerCase().includes(s.toLowerCase()));
      if (match) skillCounts[match] = (skillCounts[match] || 0) + 1;
    }
  }

  const skills: Command[] = TRACKED_SKILLS.map(s => ({
    category: 'Skills' as const,
    label: s,
    hint: `Used in ${skillCounts[s] || 0} projects`,
    keywords: 'skill tech',
    action: () => scrollTo('projects'),
  }));

  const projectCmds: Command[] = projects.map(p => ({
    category: 'Projects' as const,
    label: p.title,
    hint: p.category,
    keywords: [...p.tech, ...p.tags].join(' '),
    action: () => scrollTo('projects'),
  }));

  return [...nav, ...actions, ...skills, ...projectCmds];
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  const commands = useMemo(buildCommands, []);

  const filtered = useMemo(() => {
    if (!query) return commands;
    const q = query.toLowerCase();
    return commands.filter(c =>
      c.label.toLowerCase().includes(q) ||
      (c.keywords && c.keywords.toLowerCase().includes(q)) ||
      (c.hint && c.hint.toLowerCase().includes(q))
    );
  }, [query, commands]);

  const grouped = useMemo(() => {
    const cats: Array<{ category: string; items: Array<Command & { globalIdx: number }> }> = [];
    const order = ['Navigation', 'Actions', 'Skills', 'Projects'];
    let idx = 0;
    for (const cat of order) {
      const items = filtered
        .filter(c => c.category === cat)
        .map(c => ({ ...c, globalIdx: idx++ }));
      if (items.length) cats.push({ category: cat, items });
    }
    return { groups: cats, total: idx };
  }, [filtered]);

  const execute = useCallback((cmd: Command) => {
    setIsOpen(false);
    setTimeout(() => cmd.action(), 50);
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      prevFocusRef.current = document.activeElement as HTMLElement;
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else if (prevFocusRef.current) {
      prevFocusRef.current.focus();
    }
  }, [isOpen]);

  // Internal keyboard nav
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsOpen(false); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, grouped.total - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = filtered[selectedIndex];
        if (cmd) execute(cmd);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, selectedIndex, filtered, grouped.total, execute]);

  // Reset selection when query changes
  useEffect(() => { setSelectedIndex(0); }, [query]);

  // Scroll selected into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex justify-center"
          style={{ paddingTop: '20vh' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: 'rgba(5,8,22,0.7)' }}
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <motion.div
            className="relative w-[90vw] max-w-[560px] h-fit rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(15,23,42,0.95)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(100,220,255,0.12)',
              boxShadow: '0 0 40px rgba(0,229,255,0.06)',
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {/* Search input */}
            <div className="flex items-center px-5 py-4" style={{ borderBottom: '1px solid rgba(100,220,255,0.08)' }}>
              <Search className="w-[18px] h-[18px] mr-3 shrink-0" style={{ color: '#64748b' }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground outline-none"
              />
              <span
                className="ml-3 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px]"
                style={{ background: 'rgba(100,220,255,0.1)', color: '#64748b' }}
              >
                ESC
              </span>
            </div>

            {/* Results */}
            <div ref={listRef} className="overflow-y-auto" style={{ maxHeight: '360px' }}>
              {grouped.groups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <FileQuestion className="w-8 h-8 mb-2 opacity-40" />
                  <span className="text-sm">No results found</span>
                </div>
              ) : (
                grouped.groups.map(group => {
                  const Icon = CATEGORY_ICONS[group.category] || Folder;
                  return (
                    <div key={group.category}>
                      <div className="px-5 pt-3 pb-1 text-[10px] font-mono uppercase tracking-[1.5px] text-muted-foreground">
                        {group.category}
                      </div>
                      {group.items.map(item => {
                        const isSelected = item.globalIdx === selectedIndex;
                        return (
                          <button
                            key={item.label}
                            data-idx={item.globalIdx}
                            onClick={() => execute(item)}
                            onMouseEnter={() => setSelectedIndex(item.globalIdx)}
                            className="w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors"
                            style={{
                              background: isSelected ? 'rgba(0,229,255,0.06)' : 'transparent',
                              borderLeft: isSelected ? '2px solid #00e5ff' : '2px solid transparent',
                            }}
                          >
                            <Icon className="w-[18px] h-[18px] shrink-0" style={{ color: isSelected ? '#00e5ff' : '#64748b' }} />
                            <span className="flex-1 text-sm text-foreground truncate">{item.label}</span>
                            {item.hint && (
                              <span className="text-[11px] text-muted-foreground shrink-0">{item.hint}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div
              className="flex items-center gap-3 px-5 py-2.5 font-mono text-[11px]"
              style={{ borderTop: '1px solid rgba(100,220,255,0.08)', color: '#475569' }}
            >
              <span>↑↓ Navigate</span>
              <span>·</span>
              <span>↵ Select</span>
              <span>·</span>
              <span>esc Close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
