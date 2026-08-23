import { useState, useMemo, useCallback, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, ArrowRight, Shield, Lock } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import projectsData from '@/data/projects.json';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { TerminalHero } from '@/components/TerminalHero';
import { SectionReveal, RevealLabel } from '@/components/SectionReveal';
import { ProtectedEmail } from '@/components/ProtectedEmail';
import { loginHref } from '@/lib/auth-redirect';
import { onFilterSkill } from '@/lib/portfolio-events';

const SkillMatrix = lazy(() => import('@/components/SkillMatrix').then(m => ({ default: m.SkillMatrix })));
const ExperienceTimeline = lazy(() => import('@/components/ExperienceTimeline').then(m => ({ default: m.ExperienceTimeline })));
const ProjectShowcase = lazy(() => import('@/components/ProjectShowcase').then(m => ({ default: m.ProjectShowcase })));

/* ── animation helpers ── */
const spring = (i: number) => ({
  type: 'spring' as const, stiffness: 100, damping: 15, delay: i * 0.1,
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: spring(i) }),
};

const VP = { once: true, amount: 0.3 }; // viewport config

/* ── main component ── */
export default function Index() {
  const { user } = useAuth();
  const reducedMotion = useReducedMotion();

  /* projects */
  const { projects: dbProjects } = useProjects();
  const allProjects = useMemo(() => {
    const dbIds = new Set((dbProjects || []).map(p => p.id));
    const normalized = (dbProjects || []).map(p => ({
      id: p.id, title: p.title, description: p.description || '', category: p.category || '',
      tech: p.tech || [], year: p.year || '', status: p.status || 'completed',
      featured: p.featured || false, keyResults: p.key_results || [],
      links: { github: p.github_link, writeup: p.writeup_link, demo: p.demo_link },
      image: p.image || '', tags: p.tags || [],
    }));
    const jsonOnly = projectsData.filter(p => !dbIds.has(p.id));
    return [...normalized, ...jsonOnly];
  }, [dbProjects]);

  /* Selecting a skill filters the projects section to the work that uses it. */
  const [skillFilter, setSkillFilter] = useState<{ label: string; aliases: string[] } | null>(null);

  useEffect(() => onFilterSkill(({ label, aliases }) => {
    setSkillFilter({ label, aliases });
  }), []);

  const handleSelectSkill = useCallback((aliases: string[], label: string) => {
    setSkillFilter(prev => (prev?.label === label ? null : { label, aliases }));
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="min-h-[100dvh]">
      <Helmet>
        <title>Vijaysingh Puwar | Cybersecurity Engineer</title>
        <meta name="description" content="Cybersecurity engineer specializing in identity security, security automation, cloud defense, and detection engineering. M.S. Cybersecurity at Pace University, New York." />
        <link rel="canonical" href="https://vijaysinghpuwar.com/" />
      </Helmet>
      {/* sr-only h1 establishes the page heading for SEO and screen readers; the visual hero is the terminal card */}
      <h1 className="sr-only">Vijaysingh Puwar — Cybersecurity Engineer</h1>
      {/* ═══════ HERO ═══════ */}
      <section id="home" aria-labelledby="home-heading" className="relative flex flex-col overflow-hidden hero-grid-bg lg:min-h-[100dvh] lg:justify-center">
        <span id="home-heading" className="sr-only">Hero</span>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-background" />

        <div className="container relative max-w-6xl mx-auto pt-20 pb-10 sm:pt-36 sm:pb-24">
          <div className="max-w-3xl">
            {/* Left: Terminal */}
            <div>
              {/* Status indicators — in flow above the terminal so they track it
                  at every width instead of colliding with it on narrow desktops. */}
              <div className="flex flex-col gap-1.5 sm:gap-2 mb-4 sm:mb-5">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 sm:gap-2.5">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-success animate-pulse shrink-0" />
                  <span className="font-mono text-[10px] sm:text-xs lg:text-sm text-muted-foreground tracking-wider uppercase">Systems Online</span>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                  className="flex items-center gap-2 sm:gap-2.5">
                  <span className="text-muted-foreground/60 text-xs sm:text-sm lg:text-base leading-none">📍</span>
                  <span className="font-mono text-[10px] sm:text-xs lg:text-sm text-muted-foreground">New York, NY</span>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
                  className="flex items-center gap-2 sm:gap-2.5">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-success animate-cyber-pulse shrink-0" />
                  <span className="font-mono text-[10px] sm:text-xs lg:text-sm text-muted-foreground">Open to opportunities</span>
                </motion.div>
              </div>
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.3 }}>
                <TerminalHero projects={allProjects} />
              </motion.div>

              {/* Social icons */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
                className="flex gap-5 mt-4 sm:mt-6 items-center">
                {[
                  { href: 'https://github.com/vijaysinghpuwar', icon: Github, label: 'GitHub' },
                  { href: 'https://linkedin.com/in/vijaysinghpuwar', icon: Linkedin, label: 'LinkedIn' },
                ].map(({ href, icon: Icon, label }) => (
                  <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                    aria-label={label}
                    className="text-muted-foreground hover:text-primary transition-colors">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </a>
                ))}
                <ProtectedEmail variant="icon" className="text-muted-foreground hover:text-primary" iconClassName="w-5 h-5" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 z-10"
        >
          <span className="font-mono text-[10px] text-muted-foreground/50 tracking-wider uppercase">Scroll to explore</span>
          <motion.div
            animate={reducedMotion ? undefined : { y: [0, 6, 0] }}
            transition={reducedMotion ? undefined : { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowRight className="w-4 h-4 text-muted-foreground/40 rotate-90" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════ PROJECTS ═══════ */}
      <section id="projects" aria-label="Featured Projects" className="py-20 border-t border-border/40">
        <SectionReveal className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <RevealLabel text="Work" />
            <h2 className="section-title">Featured Projects</h2>
          </div>

          <Suspense fallback={<div className="h-64" />}>
            <ProjectShowcase
              projects={allProjects}
              skillFilter={skillFilter}
              onClearSkillFilter={() => setSkillFilter(null)}
            />
          </Suspense>

          {/* Project detail is public; repositories and the resume stay gated. */}
          {!user && (
            <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={fadeUp} custom={0}>
              <div className="glass-card rounded-lg max-w-2xl mx-auto mt-10 px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
                <Lock className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
                <p className="text-sm text-muted-foreground flex-1">
                  Sign in to open the source repositories and download my resume.
                </p>
                <Link
                  to={loginHref()}
                  className="inline-flex items-center justify-center h-10 px-5 rounded-md text-sm font-medium gradient-btn shrink-0"
                >
                  Sign in with Google
                </Link>
              </div>
            </motion.div>
          )}
        </SectionReveal>
      </section>

      {/* ═══════ EXPERIENCE & EDUCATION ═══════ */}
      <section id="experience" aria-label="Experience and Education" className="py-20 border-t border-border/40 relative overflow-hidden">
        
        <SectionReveal className="container max-w-5xl mx-auto relative z-10 px-4">
          <div className="text-center mb-4">
            <RevealLabel text="Journey" />
            <h2 className="section-title">Experience & Education</h2>
          </div>
          <Suspense fallback={<div className="h-64" />}>
            <ExperienceTimeline />
          </Suspense>
        </SectionReveal>
      </section>

      {/* ═══════ SKILLS & TECHNOLOGIES ═══════ */}
      <section id="skills" aria-label="Skills and Technologies" className="py-20 border-t border-border/40">
        <SectionReveal className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <RevealLabel text="Arsenal" />
            <h2 className="section-title">Skills & Technologies</h2>
          </div>

          <Suspense fallback={<div className="h-64" />}>
            <div className="mb-14">
              <SkillMatrix
                projects={allProjects}
                activeSkill={skillFilter?.label ?? null}
                onSelectSkill={handleSelectSkill}
              />
            </div>
          </Suspense>

          <div className="rounded-lg glass-card py-4 overflow-hidden">
            <div className="marquee-track">
              {[false, true].map(isClone => (
                <div key={String(isClone)} className="flex" aria-hidden={isClone || undefined}>
                  {['CompTIA Security+', 'CompTIA CySA+', 'Cisco CCNA', 'Google AI Essentials', 'Cisco CCNP Enterprise (in progress)'].map(cert => (
                    <span key={cert} className="flex items-center gap-2 font-mono text-sm text-muted-foreground px-6 whitespace-nowrap">
                      <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
                      {cert}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </SectionReveal>
      </section>

      {/* ═══════ CONTACT ═══════ */}
      <section id="contact" aria-label="Contact" className="py-16 sm:py-20 border-t border-border/40">
        <SectionReveal className="container max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <RevealLabel text="Connect" />
            <h2 className="section-title">Let's Work Together</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mt-3">
              Open to cybersecurity roles, security operations, cloud security, and consulting opportunities.
            </p>
          </div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={VP} variants={fadeUp} custom={0}
            className="mt-10 sm:mt-12 grid gap-5 sm:gap-6 md:grid-cols-2 md:items-stretch"
          >
            {/* Digital Business Card */}
            <div className="glass-card rounded-xl p-5 sm:p-6 space-y-5 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-4">
                <span className="gradient-text text-3xl font-bold shrink-0">VJ</span>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-foreground truncate">Vijaysingh Puwar</h3>
                  <p className="text-sm text-muted-foreground">Cybersecurity Engineer</p>
                </div>
              </div>
              <div className="space-y-1">
                <ProtectedEmail variant="row" compactHint />
                {[
                  { href: 'https://github.com/vijaysinghpuwar', icon: Github, label: 'github.com/vijaysinghpuwar' },
                  { href: 'https://linkedin.com/in/vijaysinghpuwar', icon: Linkedin, label: 'linkedin.com/in/vijaysinghpuwar' },
                ].map(({ href, icon: Icon, label }) => (
                  <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-primary/5 hover:shadow-[inset_0_0_20px_hsl(var(--primary)/0.05)] transition-all">
                    <Icon className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate">{label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="glass-card rounded-xl p-5 sm:p-6 space-y-4 hover:border-primary/30 transition-colors">
              <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Availability</h4>
              <div className="space-y-3">
                {['Cybersecurity Engineering roles', 'Security Operations positions', 'Cloud Security opportunities', 'Collaborations & Consulting'].map(item => (
                  <div key={item} className="flex items-start gap-2.5 text-sm text-foreground/80">
                    <span className="w-2 h-2 mt-1.5 rounded-full bg-success animate-cyber-pulse shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </SectionReveal>
      </section>
    </div>
  );
}
