import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Github, Linkedin, Mail, ArrowRight, Shield, Terminal, Cloud, GraduationCap, Award, Radar, Download, Briefcase, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import projectsData from '@/data/projects.json';
import { useAuth } from '@/hooks/useAuth';
import { CyberVisual } from '@/components/CyberVisual';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 }
  })
};

const securityStack = [
  'Python', 'PowerShell', 'AWS', 'Active Directory', 'Splunk',
  'Docker', 'Linux', 'Ansible', 'IAM', 'SIEM', 'Nmap', 'Wireshark',
  'Cisco', 'Firewalls',
];

const highlights = [
  {
    icon: Shield,
    title: "Security Operations & IAM",
    description: "Active Directory hygiene, MFA enforcement, endpoint hardening, and incident response across enterprise environments.",
    featured: true,
  },
  {
    icon: Terminal,
    title: "Security Automation",
    description: "Python and PowerShell tooling for log analysis, security assessments, system hardening, and operational workflows.",
  },
  {
    icon: Cloud,
    title: "Cloud & Network Security",
    description: "AWS security configurations, VPC architecture, firewall management, IDS/IPS, and Cisco network defense.",
  },
  {
    icon: Radar,
    title: "Detection & Monitoring",
    description: "SIEM monitoring with Splunk, log analysis, threat detection rules, and security alerting pipelines.",
  },
];

const experience = [
  {
    company: "R.S. Infotech",
    role: "System Engineer",
    period: "Feb 2023 – Aug 2024",
    bullets: [
      { text: "Secured ", bold: "150+", after: " enterprise endpoints with group policies, antivirus, and patch management" },
      { text: "Managed Active Directory identity hygiene and enforced MFA via PowerShell automation", bold: "", after: "" },
      { text: "Automated log analysis and reporting with Python, reducing manual effort by ", bold: "70%", after: "" },
      { text: "Maintained firewalls, IDS/IPS, reducing security breaches by ", bold: "20%", after: "" },
    ],
  },
  {
    company: "L&T-Sargent & Lundy",
    role: "Systems Intern",
    period: "Jan 2023 – Apr 2023",
    bullets: [
      { text: "Designed and optimized HVAC systems with ", bold: "100%", after: " adherence to ASHRAE standards" },
    ],
  },
  {
    company: "Elecon Engineering",
    role: "Design Intern",
    period: "Jan 2022 – Jun 2022",
    bullets: [
      { text: "CAD modeling and engineering documentation for industrial systems", bold: "", after: "" },
    ],
  },
];

const education = [
  {
    school: "Pace University",
    degree: "M.S. Cybersecurity",
    location: "New York, NY",
    gpa: "GPA: 4.00",
    status: "Expected Dec 2026",
    coursework: [
      "Computational Statistics", "Introduction to Cybersecurity", "Information Security Management",
      "Network Security & Defense", "Ethical Hacking & Penetration Testing",
      "Automating InfoSec with Python & Shell", "Cyber Intelligence Analysis & Modeling",
      "Operating Systems Theory & Administration",
    ],
  },
  {
    school: "G.H. Patel College of Engineering & Technology",
    degree: "B.E. Mechanical Engineering",
    location: "Gujarat, India",
    gpa: "CGPA: 7.11",
    status: "Completed Aug 2023",
    coursework: [
      "Engineering Design & Analysis", "Manufacturing Systems",
      "Thermodynamics & Fluid Mechanics", "Technical Documentation",
    ],
  },
];

const certifications = [
  "CompTIA Security+", "CompTIA CySA+", "Cisco CCNA", "ISC2 Candidate", "Google AI Essentials",
];

const openToRoles = [
  "Cybersecurity Engineering", "Security Operations", "Cloud Security",
  "Security Automation", "IAM / Identity Security",
];

const featuredProjects = projectsData.filter(p => p.featured).slice(0, 3);

const projectColors = [
  'from-primary/20 to-secondary/10',
  'from-secondary/20 to-primary/10',
  'from-primary/15 via-secondary/10 to-primary/5',
];

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleProtectedAction = (e: React.MouseEvent, target: string) => {
    if (!user) {
      e.preventDefault();
      navigate('/login');
    } else if (target === 'resume') {
      // Allow default download behavior
    }
  };

  return (
    <div className="min-h-screen">
      {/* ===== HERO ===== */}
      <section className="relative pt-20 md:pt-28 lg:pt-32 pb-16 overflow-hidden hero-grid-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-background" />
        <div className="container relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-8 items-center">
            {/* Left — Text */}
            <div className="order-2 lg:order-1">
              <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={0}
                className="font-mono text-sm tracking-[0.2em] uppercase gradient-text mb-4 font-semibold"
              >
                Cybersecurity Engineer
              </motion.p>
              <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
                className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight"
              >
                Vijaysingh Puwar
              </motion.h1>
              <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
                className="text-lg md:text-xl text-muted-foreground max-w-xl mb-8 leading-relaxed"
              >
                I secure enterprise infrastructure, automate security operations, and build detection pipelines that catch threats before they escalate.
              </motion.p>
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}
                className="flex flex-col sm:flex-row items-start gap-3 mb-4"
              >
                {user ? (
                  <a href="/resume.pdf" download
                    className="inline-flex items-center justify-center h-11 px-8 rounded-md text-sm font-medium gradient-btn">
                    <Download className="w-4 h-4 mr-2" />Download Resume
                  </a>
                ) : (
                  <button onClick={(e) => handleProtectedAction(e, 'resume')}
                    className="inline-flex items-center justify-center h-11 px-8 rounded-md text-sm font-medium gradient-btn">
                    <Lock className="w-4 h-4 mr-2" />Download Resume
                  </button>
                )}
                {user ? (
                  <Button size="lg" variant="outline" asChild className="border-border/60 hover:border-primary/40">
                    <Link to="/projects"><ArrowRight className="w-4 h-4 mr-2" />View Projects</Link>
                  </Button>
                ) : (
                  <Button size="lg" variant="outline" className="border-border/60 hover:border-primary/40" onClick={(e) => handleProtectedAction(e, 'projects')}>
                    <Lock className="w-4 h-4 mr-2" />View Projects
                  </Button>
                )}
              </motion.div>
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3.5}
                className="mb-8"
              >
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Contact Me
                </Link>
              </motion.div>
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}
                className="flex gap-5"
              >
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

            {/* Right — Animated Cyber Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="order-1 lg:order-2 relative h-72 sm:h-80 lg:h-[500px]"
            >
              <CyberVisual />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== SKILLS MARQUEE ===== */}
      <section className="py-6 border-t border-border/40 overflow-hidden">
        <div className="marquee-track">
          {[...securityStack, ...securityStack].map((tool, i) => (
            <span key={`${tool}-${i}`} className="font-mono text-xs px-4 py-2 mx-1.5 rounded-full glass-card text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
              {tool}
            </span>
          ))}
        </div>
      </section>

      {/* ===== CORE COMPETENCIES — BENTO GRID ===== */}
      <section className="py-16 border-t border-border/40">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-heading">What I Do</p>
            <h2 className="section-title">Core Competencies</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className={item.featured ? 'lg:col-span-2' : ''}
              >
                <div className={`h-full rounded-lg p-6 glass-card hover:border-primary/20 transition-all group ${item.featured ? 'gradient-border' : ''}`}>
                  <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-base group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PROJECTS ===== */}
      <section className="py-16 border-t border-border/40">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-heading">Portfolio</p>
            <h2 className="section-title">Featured Projects</h2>
          </div>
          {user ? (
            <>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {featuredProjects.map((project, i) => (
                  <motion.div key={project.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                    <div className="h-full rounded-lg glass-card hover:border-primary/20 transition-all group flex flex-col overflow-hidden">
                      {/* Gradient mesh header */}
                      <div className={`h-24 bg-gradient-to-br ${projectColors[i % projectColors.length]} flex items-center justify-center`}>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-primary/60" />
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="text-xs text-primary border-primary/20">{project.category}</Badge>
                          <span className="text-xs text-muted-foreground">{project.year}</span>
                        </div>
                        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          <Link to={`/projects/${project.id}`}>{project.title}</Link>
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{project.description}</p>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {project.tech.slice(0, 3).map(t => (
                            <span key={t} className="text-xs px-2 py-0.5 rounded-full glass-card text-muted-foreground">{t}</span>
                          ))}
                        </div>
                        {project.links.github && (
                          <a href={project.links.github} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-primary hover:underline">
                            <Github className="w-4 h-4 mr-1.5" /> View on GitHub
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* GitHub Credibility Strip */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
                className="flex items-center justify-center gap-3 py-4 mb-8 rounded-lg glass-card"
              >
                <Github className="w-5 h-5 text-primary" />
                <a href="https://github.com/vijaysinghpuwar" target="_blank" rel="noopener noreferrer"
                  className="font-mono text-sm text-muted-foreground hover:text-primary transition-colors">
                  18+ public repositories · Security Automation · Python · PowerShell · Bash
                </a>
              </motion.div>

              <div className="text-center">
                <Link to="/projects"
                  className="inline-flex items-center justify-center h-11 px-8 rounded-md text-sm font-medium gradient-btn">
                  View All Projects <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </>
          ) : (
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
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

      {/* ===== EXPERIENCE TIMELINE ===== */}
      <section className="py-16 border-t border-border/40">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-heading">Career</p>
            <h2 className="section-title">Experience</h2>
          </div>
          <div className="space-y-10">
            {experience.map((job, i) => (
              <motion.div key={job.company} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="relative pl-8"
              >
                {/* Gradient timeline line */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary to-secondary" />
                {/* Glowing dot */}
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
                        <span>
                          {b.text}
                          {b.bold && <strong className="text-primary font-semibold">{b.bold}</strong>}
                          {b.after}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== EDUCATION ===== */}
      <section className="py-16 border-t border-border/40">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-heading">Education</p>
            <h2 className="section-title">Academic Background</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {education.map((edu, i) => (
              <motion.div key={edu.school} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
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
        </div>
      </section>

      {/* ===== CERTIFICATIONS ===== */}
      <section className="py-16 border-t border-border/40">
        <div className="container max-w-6xl mx-auto text-center">
          <p className="section-heading">Credentials</p>
          <h2 className="section-title mb-10">Certifications</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {certifications.map(cert => (
              <div key={cert} className="flex items-center justify-center gap-2.5 px-5 py-4 rounded-lg glass-card text-sm text-foreground hover:border-primary/30 transition-colors group">
                <Award className="w-4 h-4 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />{cert}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== OPEN TO ===== */}
      <section className="py-16 border-t border-border/40">
        <div className="container max-w-4xl mx-auto text-center">
          <p className="section-heading">Opportunities</p>
          <h2 className="section-title mb-4">Open To</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Actively seeking roles where I can contribute to building and defending secure infrastructure.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {openToRoles.map(role => (
              <div key={role} className="flex items-center gap-2 px-5 py-3 rounded-lg glass-card text-sm text-foreground font-medium hover:border-primary/30 transition-colors">
                <Briefcase className="w-4 h-4 text-primary flex-shrink-0" />{role}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONTACT CTA ===== */}
      <section className="py-16 border-t border-border/40">
        <div className="container max-w-4xl mx-auto text-center">
          <p className="section-heading">Get in Touch</p>
          <h2 className="section-title mb-4">Let's Connect</h2>
          <p className="text-muted-foreground mb-8">
            Open to opportunities in cybersecurity engineering, security operations, and cloud security roles.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/contact" className="inline-flex items-center justify-center h-11 px-8 rounded-md text-sm font-medium gradient-btn">
              Contact Me
            </Link>
            <Button size="lg" variant="outline" asChild className="border-border/60 hover:border-primary/40">
              <a href="mailto:contact@vijaysinghpuwar.com">
                <Mail className="w-4 h-4 mr-2" /> contact@vijaysinghpuwar.com
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
