import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Terminal, Cloud, Mail, Github, Linkedin, CheckCircle2, Download, Briefcase, GraduationCap, Award } from 'lucide-react';
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

const skills = {
  "Security": ["IAM / Active Directory", "SIEM (Splunk)", "IDS/IPS", "Vulnerability Assessment", "Incident Response", "Endpoint Hardening"],
  "Automation": ["Python", "PowerShell", "Shell Scripting", "Ansible"],
  "Cloud & Network": ["AWS (EC2, VPC, IAM, CloudWatch)", "Cisco (Routing, Switching, VLANs)", "Firewalls", "TCP/IP"],
  "Tools": ["Wireshark", "Nmap", "Metasploit", "Burp Suite", "Git", "Docker", "Linux"],
};

const experience = [
  {
    company: "R.S. Infotech", role: "System Engineer", period: "Feb 2023 – Aug 2024",
    bullets: [
      "Secured 150+ enterprise endpoints with group policies, antivirus, and patch management",
      "Managed Active Directory identity hygiene and enforced MFA via PowerShell",
      "Automated log analysis and reporting with Python, reducing manual effort by 70%",
      "Maintained firewalls, IDS/IPS, contributing to 20% reduction in security breaches",
      "Provided Tier 1/2 incident response and escalation support",
    ],
  },
  {
    company: "L&T-Sargent & Lundy", role: "Systems Intern", period: "Jan 2023 – Apr 2023",
    bullets: ["Designed and optimized HVAC systems with 100% ASHRAE standards compliance"],
  },
  {
    company: "Elecon Engineering", role: "Design Intern", period: "Jan 2022 – Jun 2022",
    bullets: ["CAD modeling and engineering documentation for industrial systems"],
  },
];

const education = [
  {
    school: "Pace University", degree: "M.S. Cybersecurity", location: "New York, NY",
    gpa: "GPA: 4.00", status: "Expected Dec 2026",
    coursework: ["Computational Statistics", "Introduction to Cybersecurity", "Information Security Management", "Network Security & Defense", "Ethical Hacking & Penetration Testing", "Automating InfoSec with Python & Shell", "Cyber Intelligence Analysis & Modeling", "Operating Systems Theory & Administration"],
  },
  {
    school: "G.H. Patel College of Engineering & Technology", degree: "B.E. Mechanical Engineering",
    location: "Gujarat, India", gpa: "CGPA: 7.11", status: "Completed Aug 2023", coursework: [],
  },
];

const certifications = ["CompTIA Security+", "CompTIA CySA+", "Cisco CCNA", "ISC2 Candidate", "Google AI Essentials"];

export default function About() {
  return (
    <div className="min-h-screen py-20">
      <div className="container max-w-6xl mx-auto">
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
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="flex-shrink-0"
          >
            <div className="w-44 h-44 rounded-full border-2 border-primary/60 shadow-[0_0_30px_hsl(var(--primary)/0.25)] overflow-hidden">
              <img
                src={profilePhoto}
                alt="Vijaysingh Puwar"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-foreground mb-1">Vijaysingh Puwar</h2>
            <p className="text-primary font-medium mb-3">Cybersecurity Engineer</p>

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

            <p className="text-muted-foreground leading-relaxed mb-5 max-w-xl">
              Cybersecurity engineer specializing in identity security, security automation, and cloud defense.
              I focus on building practical security solutions using Python, PowerShell, and modern security tools.
            </p>

            <ul className="space-y-1.5 mb-5">
              {highlights.map((h) => (
                <li key={h} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  {h}
                </li>
              ))}
            </ul>

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
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
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

        {/* Skills */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16">
          <h2 className="text-xl font-bold text-foreground mb-6 text-center">Skills</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(skills).map(([category, items], i) => (
              <motion.div key={category} variants={fadeUp} custom={i}>
                <Card className="h-full border-border/40 bg-card">
                  <CardContent className="pt-5">
                    <h3 className="text-sm font-semibold text-primary mb-3">{category}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map(s => <Badge key={s} variant="secondary" className="text-xs bg-muted text-muted-foreground border-0">{s}</Badge>)}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Experience */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2 justify-center">
            <Briefcase className="w-5 h-5 text-primary" /> Experience
          </h2>
          <div className="max-w-5xl mx-auto space-y-6">
            {experience.map((job, i) => (
              <motion.div key={job.company} variants={fadeUp} custom={i} className="pl-6 border-l-2 border-border/60 relative">
                <div className="absolute -left-[7px] top-2 w-3 h-3 rounded-full bg-primary" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <h3 className="font-semibold text-foreground">{job.company}</h3>
                  <span className="text-sm text-muted-foreground">— {job.role}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{job.period}</p>
                <ul className="space-y-1.5">
                  {job.bullets.map((b, j) => (
                    <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-primary flex-shrink-0" />{b}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Education */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2 justify-center">
            <GraduationCap className="w-5 h-5 text-primary" /> Education
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {education.map((edu, i) => (
              <motion.div key={edu.school} variants={fadeUp} custom={i}>
                <Card className="h-full border-border/40 bg-card">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-foreground mb-1">{edu.degree}</h3>
                    <p className="text-sm text-muted-foreground">{edu.school}</p>
                    <p className="text-sm text-muted-foreground mb-2">{edu.location}</p>
                    <div className="flex gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">{edu.gpa}</Badge>
                      <Badge variant="outline" className="text-xs">{edu.status}</Badge>
                    </div>
                    {edu.coursework.length > 0 && (
                      <>
                        <p className="text-xs font-semibold text-foreground mb-2">Selected Coursework</p>
                        <div className="flex flex-wrap gap-1.5">
                          {edu.coursework.map(c => <Badge key={c} variant="secondary" className="text-xs bg-muted text-muted-foreground border-0">{c}</Badge>)}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Certifications */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2 justify-center">
            <Award className="w-5 h-5 text-primary" /> Certifications
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {certifications.map(cert => (
              <div key={cert} className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border/60 bg-card text-sm text-foreground">
                <Award className="w-4 h-4 text-primary flex-shrink-0" />{cert}
              </div>
            ))}
          </div>
        </motion.section>

        {/* Resume Download */}
        <div className="text-center mb-12">
          <Button variant="outline" asChild>
            <a href="/resume.pdf" download><Download className="w-4 h-4 mr-2" /> Download Resume PDF</a>
          </Button>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Interested in working together?</p>
          <div className="flex gap-3 justify-center">
            <Button asChild><Link to="/contact">Get in Touch</Link></Button>
            <Button variant="outline" asChild><Link to="/projects">View Projects</Link></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
