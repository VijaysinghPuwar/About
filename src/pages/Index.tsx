import { useState, useMemo, useRef, useEffect } from 'react';
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
import { ProjectShowcase } from '@/components/ProjectShowcase';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { TerminalHero } from '@/components/TerminalHero';
import { SecurityShield } from '@/components/SecurityShield';
import { SkillsRadar } from '@/components/SkillsRadar';
import { SkillCategories } from '@/components/SkillCategories';
import { ExperienceTimeline } from '@/components/ExperienceTimeline';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

/* ── animation helpers ── */
const spring = (i: number) => ({
  type: 'spring' as const, stiffness: 100, damping: 15, delay: i * 0.1,
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: spring(i) }),
};

const VP = { once: true, amount: 0.3 }; // viewport config


const openToRoles = [
  'Cybersecurity Engineering', 'Security Operations', 'Cloud Security',
  'Security Automation', 'IAM / Identity Security',
];


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

  /* experience tabs */
  const [expTab, setExpTab] = useState<'experience' | 'education' | 'certifications'>('experience');

  /* competency hover expand */
  

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
      <section id="home" className="relative min-h-screen flex flex-col justify-center overflow-hidden hero-grid-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-background" />

        {/* Status indicators */}
        <div className="absolute top-20 left-4 sm:left-8 flex flex-col gap-2 z-10">
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

        <div className="container relative max-w-6xl mx-auto pt-32 pb-20 sm:pt-36 sm:pb-24">
          <div className="grid lg:grid-cols-[3fr_2fr] gap-10 lg:gap-6 items-center">
            {/* Left: Terminal */}
            <div className="order-2 lg:order-1">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.3 }}>
                <TerminalHero />
              </motion.div>

              {/* Social icons */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
                className="flex gap-5 mt-6">
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
              <SecurityShield />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
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
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-heading">Arsenal</p>
            <h2 className="section-title">Skills & Technologies</h2>
          </div>

          {/* Two-column layout */}
          <div className="grid lg:grid-cols-2 gap-10 items-start mb-14">
            {/* Radar Chart */}
            <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={fadeUp} custom={0}>
              <SkillsRadar />
            </motion.div>

            {/* Category Tabs */}
            <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={fadeUp} custom={1}>
              <SkillCategories />
            </motion.div>
          </div>

          {/* Certification Ticker */}
          <div className="rounded-lg glass-card py-4 overflow-hidden">
            <div className="marquee-track">
              {[...certifications, ...certifications].map((cert, i) => (
                <span key={`${cert}-${i}`} className="flex items-center gap-2 font-mono text-sm text-muted-foreground px-6 whitespace-nowrap">
                  <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ PROJECTS ═══════ */}
      <section id="projects" className="py-20 border-t border-border/40">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-heading">Work</p>
            <h2 className="section-title">Featured Projects</h2>
          </div>

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
        </div>
      </section>

      {/* ═══════ EXPERIENCE (Tabbed) ═══════ */}
      <section id="experience" className="py-20 border-t border-border/40">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="section-heading">Background</p>
            <h2 className="section-title mb-8">Experience & Education</h2>

            {/* Tabs */}
            <div className="inline-flex gap-1 p-1 rounded-lg glass-card">
              {(['experience', 'education', 'certifications'] as const).map(tab => (
                <button key={tab} onClick={() => setExpTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${expTab === tab ? 'gradient-btn' : 'text-muted-foreground hover:text-foreground'}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {expTab === 'experience' && (
              <motion.div key="exp" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}>
                <div className="space-y-10">
                  {experience.map((job, i) => (
                    <motion.div key={job.company} initial="hidden" whileInView="visible" viewport={VP} variants={fadeUp} custom={i}
                      className="relative pl-8">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary to-secondary" />
                      <div className="absolute -left-[5px] top-2 w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.6)]" />
                      <div className="glass-card rounded-lg p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                          <h3 className="font-bold text-foreground text-lg">{job.company}</h3>
                          <span className="text-sm font-medium gradient-text">— {job.role}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3 font-mono">{job.period}</p>
                        <ul className="space-y-2">
                          {job.bullets.map((b, j) => (
                            <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                              <span>{b.text}{b.bold && <strong className="text-primary font-semibold">{b.bold}</strong>}{b.after}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {expTab === 'education' && (
              <motion.div key="edu" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}>
                <div className="grid md:grid-cols-2 gap-6">
                  {education.map((edu, i) => (
                    <motion.div key={edu.school} initial="hidden" whileInView="visible" viewport={VP} variants={fadeUp} custom={i}>
                      <div className="h-full glass-card rounded-lg p-6">
                        <GraduationCap className="w-7 h-7 text-primary mb-3" />
                        <h3 className="font-bold text-foreground mb-1 text-lg">{edu.degree}</h3>
                        <p className="text-sm text-muted-foreground mb-1">{edu.school}</p>
                        <p className="text-sm text-muted-foreground">{edu.location}</p>
                        <div className="flex gap-3 mt-3 mb-4">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-md gradient-btn">{edu.gpa}</span>
                          <Badge variant="outline" className="text-xs">{edu.status}</Badge>
                        </div>
                        {edu.coursework.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">Selected Coursework</p>
                            <div className="flex flex-wrap gap-1.5">
                              {edu.coursework.map(c => (
                                <span key={c} className="text-xs px-2 py-0.5 rounded-full glass-card text-muted-foreground">{c}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {expTab === 'certifications' && (
              <motion.div key="cert" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {certifications.map(cert => (
                    <div key={cert} className="flex items-center justify-center gap-2.5 px-5 py-4 rounded-lg glass-card text-sm text-foreground hover:border-primary/30 hover:shadow-[0_0_20px_hsl(var(--primary)/0.1)] transition-all group">
                      <Award className="w-4 h-4 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />{cert}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ═══════ CONTACT ═══════ */}
      <section id="contact" className="py-20 border-t border-border/40">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-heading">Get in Touch</p>
            <h2 className="section-title">Let's Connect</h2>
          </div>

          {/* Open to roles */}
          <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={fadeUp} custom={0}
            className="flex flex-wrap justify-center gap-3 mb-12">
            {openToRoles.map(role => (
              <div key={role} className="flex items-center gap-2 px-4 py-2.5 rounded-lg glass-card text-sm text-foreground font-medium hover:border-primary/30 transition-colors">
                <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 shadow-[0_0_6px_hsl(var(--primary)/0.5)]" />
                {role}
              </div>
            ))}
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left info */}
            <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={fadeUp} custom={0} className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Let's Connect</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Whether you're looking for a cybersecurity engineer, need help with a security project, or want to discuss opportunities — I'd love to hear from you.
                </p>
              </div>
              <div className="glass-card rounded-lg p-6 space-y-4">
                <a href="mailto:contact@vijaysinghpuwar.com" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Mail className="w-4 h-4 text-primary" /> contact@vijaysinghpuwar.com
                </a>
                <a href="https://github.com/vijaysinghpuwar" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Github className="w-4 h-4 text-primary" /> github.com/vijaysinghpuwar
                </a>
                <a href="https://linkedin.com/in/vijaysinghpuwar" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Linkedin className="w-4 h-4 text-primary" /> linkedin.com/in/vijaysinghpuwar
                </a>
              </div>
            </motion.div>

            {/* Right form */}
            <motion.div initial="hidden" whileInView="visible" viewport={VP} variants={fadeUp} custom={1}>
              {submitted ? (
                <div className="text-center py-16">
                  <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Message Sent</h3>
                  <p className="text-muted-foreground mb-4">Thanks for reaching out. I'll respond within 24–48 hours.</p>
                  <Button variant="outline" onClick={() => setSubmitted(false)} className="border-border/60">Send Another</Button>
                </div>
              ) : (
                <div className="glass-card rounded-lg p-6">
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
                          className="bg-background/50 border-border/40 mt-1 focus:border-primary/60" />
                      </div>
                      {!user && (
                        <div>
                          <Label htmlFor="email" className="text-sm">Email</Label>
                          <Input id="email" type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="bg-background/50 border-border/40 mt-1 focus:border-primary/60" />
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="subject" className="text-sm">Subject</Label>
                      <Input id="subject" required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })}
                        className="bg-background/50 border-border/40 mt-1 focus:border-primary/60" />
                    </div>
                    <div>
                      <Label htmlFor="message" className="text-sm">Message</Label>
                      <Textarea id="message" required rows={5} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}
                        className="bg-background/50 border-border/40 mt-1 focus:border-primary/60" />
                    </div>
                    <button type="submit" disabled={isSubmitting}
                      className="w-full h-11 rounded-md text-sm font-medium gradient-btn inline-flex items-center justify-center disabled:opacity-50">
                      {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : 'Send Message'}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
