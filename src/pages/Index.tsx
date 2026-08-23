import { useState, useMemo, lazy, Suspense } from 'react';
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

const HeroShield = lazy(() => import('@/components/HeroShield').then(m => ({ default: m.HeroShield })));
const SkillsRadar = lazy(() => import('@/components/SkillsRadar').then(m => ({ default: m.SkillsRadar })));
const SkillCategories = lazy(() => import('@/components/SkillCategories').then(m => ({ default: m.SkillCategories })));
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

  /* shared skill tab state */
  const [skillTab, setSkillTab] = useState('security');

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

        {/* Status indicators */}
        <div className="relative mb-3 md:mb-0 md:absolute md:top-20 md:left-4 sm:md:left-8 flex flex-col gap-2 z-10 px-4 md:px-0 pt-20 md:pt-0">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase">Systems Online</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
            className="flex items-center gap-2">
            <span className="text-muted-foreground/60 text-xs">📍</span>
            <span className="font-mono text-[10px] text-muted-foreground">New York, NY</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
            className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-cyber-pulse" />
            <span className="font-mono text-[10px] text-muted-foreground">Open to opportunities</span>
          </motion.div>
        </div>

        <div className="container relative max-w-6xl mx-auto pt-6 pb-10 sm:pt-36 sm:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 lg:gap-6 items-center">
            {/* Left: Terminal */}
            <div className="order-2 lg:order-1">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.3 }}>
                <TerminalHero />
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
                <ProtectedEmail variant="icon" className="text-muted-foreground hover:text-primary [&_svg]:w-5 [&_svg]:h-5" />
              </motion.div>
            </div>

            {/* Right: Shield (desktop only) */}
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 80, damping: 15, delay: 0.5 }}
              className="order-1 lg:order-2 hidden lg:flex relative h-[460px] items-center justify-center">
              <Suspense fallback={<div className="w-full h-full" aria-hidden="true" />}>
                <HeroShield />
              </Suspense>
            </motion.div>
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

      {/* ═══════ SKILLS & TECHNOLOGIES ═══════ */}
      <section id="skills" aria-label="Skills and Technologies" className="py-20 border-t border-border/40">
        <SectionReveal className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <RevealLabel text="Arsenal" />
            <h2 className="section-title">Skills & Technologies</h2>
          </div>

          <Suspense fallback={<div className="h-64" />}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start mb-14">
              <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={fadeUp} custom={0}>
                <SkillsRadar activeTab={skillTab} onAxisClick={setSkillTab} />
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={fadeUp} custom={1}>
                <SkillCategories activeTab={skillTab} onTabChange={setSkillTab} />
              </motion.div>
            </div>
          </Suspense>

          <div className="rounded-lg glass-card py-4 overflow-hidden">
            <div className="marquee-track">
              {[false, true].map(isClone => (
                <div key={String(isClone)} className="flex" aria-hidden={isClone || undefined}>
                  {['CompTIA Security+', 'CompTIA CySA+', 'Cisco CCNA', 'ISC2 Candidate', 'Google AI Essentials'].map(cert => (
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

      {/* ═══════ PROJECTS ═══════ */}
      <section id="projects" aria-label="Featured Projects" className="py-20 border-t border-border/40">
        <SectionReveal className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <RevealLabel text="Work" />
            <h2 className="section-title">Featured Projects</h2>
          </div>

          <Suspense fallback={<div className="h-64" />}>
            <ProjectShowcase projects={allProjects} />
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

      {/* ═══════ CONTACT ═══════ */}
      <section id="contact" aria-label="Contact" className="py-20 border-t border-border/40">
        <SectionReveal className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-4">
            <RevealLabel text="Connect" />
            <h2 className="section-title">Let's Work Together</h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto mt-3">
              Open to cybersecurity roles, security operations, cloud security, and consulting opportunities.
            </p>
          </div>

          <div className="max-w-xl mx-auto mt-12">
            {/* Digital Business Card */}
            <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={fadeUp} custom={0} className="space-y-6">
              <div className="glass-card rounded-xl p-6 space-y-5 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="gradient-text text-3xl font-bold">VJ</span>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Vijaysingh Puwar</h3>
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
                      <Icon className="w-4 h-4 text-primary" />
                      {label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Availability</h4>
                {['Cybersecurity Engineering roles', 'Security Operations positions', 'Cloud Security opportunities', 'Collaborations & Consulting'].map(item => (
                  <div key={item} className="flex items-center gap-2.5 text-sm text-foreground/80">
                    <span className="w-2 h-2 rounded-full bg-success animate-cyber-pulse flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

        </SectionReveal>
      </section>
    </div>
  );
}
