import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Terminal, Cloud, Mail, Github, Linkedin, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import profilePhoto from '@/assets/profile-photo.jpg';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } })
};

const roleTags = ['IAM Security', 'Security Automation', 'Cloud Security', 'Network Defense'];

const highlights = [
  'Secured 150+ enterprise endpoints',
  'Identity & Access Management (AD, MFA, GPO)',
  'Python & PowerShell security automation',
  'Cloud and network security defense',
];

const stats = [
  { value: '150+', label: 'Systems Secured' },
  { value: '10+', label: 'Security Projects' },
  { value: '5+', label: 'Certifications' },
];

const capabilities = [
  {
    icon: Shield,
    title: 'Security Operations',
    desc: 'IAM, endpoint hardening, incident response, SIEM monitoring, and vulnerability management.',
  },
  {
    icon: Terminal,
    title: 'Security Automation',
    desc: 'Python and PowerShell scripts for log analysis, system hardening, and security workflows.',
  },
  {
    icon: Cloud,
    title: 'Cloud & Network Security',
    desc: 'AWS security configuration, firewall policies, network monitoring, and threat detection.',
  },
];

export default function About() {
  return (
    <div className="min-h-screen py-20">
      <div className="container max-w-4xl mx-auto">
        {/* Page header */}
        <div className="text-center mb-14">
          <p className="section-heading">About</p>
          <h1 className="section-title">Vijaysingh Puwar</h1>
        </div>

        {/* Profile section — split layout */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="flex flex-col md:flex-row gap-10 items-center md:items-start mb-16"
        >
          {/* Left: Profile image */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="flex-shrink-0"
          >
            <div className="w-40 h-40 rounded-full border-2 border-primary/60 shadow-[0_0_30px_hsl(var(--primary)/0.25)] overflow-hidden">
              <img
                src={profilePhoto}
                alt="Vijaysingh Puwar"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Right: Info */}
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-foreground mb-1">Vijaysingh Puwar</h2>
            <p className="text-primary font-medium mb-3">Cybersecurity Engineer</p>

            {/* Role tags */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
              {roleTags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium px-2.5 py-1 rounded-md border border-primary/20 bg-primary/10 text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Summary */}
            <p className="text-muted-foreground leading-relaxed mb-5 max-w-lg">
              Cybersecurity engineer specializing in identity security, security automation, and cloud defense.
              I focus on building practical security solutions using Python, PowerShell, and modern security tools.
            </p>

            {/* Key highlights */}
            <ul className="space-y-1.5 mb-5">
              {highlights.map((h) => (
                <li key={h} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  {h}
                </li>
              ))}
            </ul>

            {/* Social icons */}
            <div className="flex justify-center md:justify-start gap-3">
              {[
                { href: 'https://github.com/vijaysinghpuwar', icon: Github, label: 'GitHub' },
                { href: 'https://linkedin.com/in/vijaysinghpuwar', icon: Linkedin, label: 'LinkedIn' },
                { href: 'mailto:contact@vijaysinghpuwar.com', icon: Mail, label: 'Email' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.label !== 'Email' ? '_blank' : undefined}
                  rel={s.label !== 'Email' ? 'noopener noreferrer' : undefined}
                  className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  aria-label={s.label}
                >
                  <s.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={1}
          className="grid grid-cols-3 gap-4 mb-16"
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center py-5 rounded-lg border border-border/40 bg-card">
              <p className="text-2xl font-bold text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Capability cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {capabilities.map((item, i) => (
            <motion.div key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 2}>
              <Card className="h-full border-border/40 bg-card">
                <CardContent className="pt-6">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Interested in working together?</p>
          <div className="flex gap-3 justify-center">
            <Button asChild><Link to="/contact">Get in Touch</Link></Button>
            <Button variant="outline" asChild><Link to="/resume">View Resume</Link></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
