import { useState, useMemo, useRef, useEffect, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Github, Linkedin, Mail, ArrowRight, Shield, Terminal, Cloud,
  Radar, Download, Lock,
  Loader2, CheckCircle2, User,
} from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import projectsData from '@/data/projects.json';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { TerminalHero } from '@/components/TerminalHero';
import { HeroShield } from '@/components/HeroShield';
import { SectionReveal, RevealLabel } from '@/components/SectionReveal';

import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

/* section entrance animation */
const sectionAnim = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' as const },
  viewport: { once: true, amount: 0.2 },
};




/* ── main component ── */
export default function Index() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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


  /* contact form */
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (profile?.full_name) setFormData(prev => ({ ...prev, name: profile.full_name || '' }));
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const body = user
        ? { name: formData.name, subject: formData.subject, message: formData.message }
        : { name: formData.name, email: formData.email, subject: formData.subject, message: formData.message };
      const { error } = await supabase.functions.invoke('send-contact-email', { body });
      if (error) throw error;
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      toast({ title: 'Message sent', description: "Thank you — I'll get back to you soon." });
    } catch {
      toast({ title: 'Failed to send', description: 'Please try again or email me directly.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProtectedAction = (e: React.MouseEvent, _target: string) => {
    if (!user) { e.preventDefault(); navigate('/login'); }
  };

  return (
    <div className="min-h-screen">
      {/* ═══════ HERO ═══════ */}
      <section id="home" className="relative flex flex-col overflow-hidden hero-grid-bg lg:min-h-screen lg:justify-center">
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
          <div className="grid lg:grid-cols-[3fr_2fr] gap-10 lg:gap-6 items-center">
            {/* Left: Terminal */}
            <div className="order-2 lg:order-1">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.3 }}>
                <TerminalHero />
              </motion.div>

              {/* Social icons */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
                className="flex gap-5 mt-4 sm:mt-6">
                {[
                  { href: 'https://github.com/vijaysinghpuwar', icon: Github },
                  { href: 'https://linkedin.com/in/vijaysinghpuwar', icon: Linkedin },
                  { href: 'mailto:contact@vijaysinghpuwar.com', icon: Mail },
                ].map(({ href, icon: Icon }) => (
                  <a key={href} href={href} target={href.startsWith('mailto') ? undefined : '_blank'} rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </motion.div>
            </div>

            {/* Right: Shield (desktop only) */}
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 80, damping: 15, delay: 0.5 }}
              className="order-1 lg:order-2 hidden lg:flex relative h-[460px] items-center justify-center">
              <HeroShield />
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
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowRight className="w-4 h-4 text-muted-foreground/40 rotate-90" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════ SKILLS & TECHNOLOGIES ═══════ */}
      <section id="skills" className="py-20 border-t border-border/40">
        <SectionReveal className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <RevealLabel text="Arsenal" />
            <h2 className="section-title">Skills & Technologies</h2>
          </div>

          <Suspense fallback={<div className="h-64" />}>
            <div className="grid lg:grid-cols-2 gap-10 items-start mb-14">
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
              {[...['CompTIA Security+', 'CompTIA CySA+', 'Cisco CCNA', 'ISC2 Candidate', 'Google AI Essentials'], ...['CompTIA Security+', 'CompTIA CySA+', 'Cisco CCNA', 'ISC2 Candidate', 'Google AI Essentials']].map((cert, i) => (
                <span key={`${cert}-${i}`} className="flex items-center gap-2 font-mono text-sm text-muted-foreground px-6 whitespace-nowrap">
                  <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </SectionReveal>
      </section>

      {/* ═══════ PROJECTS ═══════ */}
      <section id="projects" className="py-20 border-t border-border/40">
        <SectionReveal className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <RevealLabel text="Work" />
            <h2 className="section-title">Featured Projects</h2>
          </div>

          <Suspense fallback={<div className="h-64" />}>
            {user ? (
              <ProjectShowcase projects={allProjects} />
            ) : (
              <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={fadeUp} custom={0}>
                <div className="glass-card rounded-lg max-w-lg mx-auto p-8 text-center">
                  <Lock className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground text-lg mb-2">Portfolio Access Required</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Sign in with Google to view detailed projects, GitHub repositories, and download resume.
                  </p>
                  <Link to="/login" className="inline-flex items-center justify-center h-10 px-6 rounded-md text-sm font-medium gradient-btn">
                    Sign In with Google
                  </Link>
                </div>
              </motion.div>
            )}
          </Suspense>
        </SectionReveal>
      </section>

      {/* ═══════ EXPERIENCE & EDUCATION ═══════ */}
      <section id="experience" className="py-20 border-t border-border/40 relative overflow-hidden">
        
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
      <section id="contact" className="py-20 border-t border-border/40">
        <SectionReveal className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-4">
            <RevealLabel text="Connect" />
            <h2 className="section-title">Let's Work Together</h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto mt-3">
              Open to cybersecurity roles, security operations, cloud security, and consulting opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            {/* Left — Digital Business Card */}
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
                  {[
                    { href: 'mailto:contact@vijaysinghpuwar.com', icon: Mail, label: 'contact@vijaysinghpuwar.com' },
                    { href: 'https://github.com/vijaysinghpuwar', icon: Github, label: 'github.com/vijaysinghpuwar', external: true },
                    { href: 'https://linkedin.com/in/vijaysinghpuwar', icon: Linkedin, label: 'linkedin.com/in/vijaysinghpuwar', external: true },
                  ].map(({ href, icon: Icon, label, external }) => (
                    <a key={href} href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}
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

            {/* Right — Contact Form */}
            <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={fadeUp} custom={1}>
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="glass-card rounded-xl text-center py-16 px-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}>
                      <CheckCircle2 className="w-14 h-14 text-success mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground mb-6">Thanks for reaching out. I'll respond within 24–48 hours.</p>
                    <Button variant="outline" onClick={() => setSubmitted(false)} className="border-border/60">Send Another</Button>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="glass-card rounded-xl p-6">
                    {user && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 pb-4 border-b border-border/40">
                        <User className="w-4 h-4 text-primary" />
                        <span>Signed in as <span className="text-foreground font-medium">{user.email}</span></span>
                      </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className={user ? '' : 'grid sm:grid-cols-2 gap-4'}>
                        <div>
                          <Label htmlFor="name" className="text-sm">Name</Label>
                          <Input id="name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="bg-background/50 border-border/40 mt-1 focus:border-primary/60 focus:shadow-[0_0_12px_hsl(var(--primary)/0.15)] transition-shadow" />
                        </div>
                        {!user && (
                          <div>
                            <Label htmlFor="email" className="text-sm">Email</Label>
                            <Input id="email" type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                              className="bg-background/50 border-border/40 mt-1 focus:border-primary/60 focus:shadow-[0_0_12px_hsl(var(--primary)/0.15)] transition-shadow" />
                          </div>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="subject" className="text-sm">Subject</Label>
                        <Input id="subject" required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })}
                          className="bg-background/50 border-border/40 mt-1 focus:border-primary/60 focus:shadow-[0_0_12px_hsl(var(--primary)/0.15)] transition-shadow" />
                      </div>
                      <div>
                        <Label htmlFor="message" className="text-sm">Message</Label>
                        <Textarea id="message" required rows={5} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}
                          className="bg-background/50 border-border/40 mt-1 focus:border-primary/60 focus:shadow-[0_0_12px_hsl(var(--primary)/0.15)] transition-shadow" />
                      </div>
                      <button type="submit" disabled={isSubmitting}
                        className="w-full h-11 rounded-md text-sm font-medium gradient-btn inline-flex items-center justify-center disabled:opacity-50">
                        {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : 'Send Message'}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </SectionReveal>
      </section>
    </div>
  );
}
