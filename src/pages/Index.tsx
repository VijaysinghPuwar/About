import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Github, Linkedin, Mail, ArrowRight, Shield, Terminal, Cloud, GraduationCap, Award, Radar, Download, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import profilePhoto from '@/assets/profile-portrait.png';
import projectsData from '@/data/projects.json';
import writeupsData from '@/data/writeups.json';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 }
  })
};

const securityStack = [
  'Python', 'PowerShell', 'AWS', 'Active Directory', 'Splunk',
  'Docker', 'Linux', 'Ansible', 'IAM', 'SIEM', 'Nmap', 'Wireshark'
];

const highlights = [
  {
    icon: Shield,
    title: "Security Operations & IAM",
    description: "Active Directory hygiene, MFA enforcement, endpoint hardening, and incident response across enterprise environments."
  },
  {
    icon: Terminal,
    title: "Security Automation",
    description: "Python and PowerShell tooling for log analysis, security assessments, system hardening, and operational workflows."
  },
  {
    icon: Cloud,
    title: "Cloud & Network Security",
    description: "AWS security configurations, VPC architecture, firewall management, IDS/IPS, and Cisco network defense."
  },
  {
    icon: Radar,
    title: "Detection & Monitoring",
    description: "SIEM monitoring with Splunk, log analysis, threat detection rules, and security alerting pipelines."
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
      "Computational Statistics",
      "Introduction to Cybersecurity",
      "Information Security Management",
      "Network Security & Defense",
      "Ethical Hacking & Penetration Testing",
      "Automating InfoSec with Python & Shell",
      "Cyber Intelligence Analysis & Modeling",
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
      "Engineering Design & Analysis",
      "Manufacturing Systems",
      "Thermodynamics & Fluid Mechanics",
      "Technical Documentation",
    ],
  },
];

const certifications = [
  "CompTIA Security+",
  "CompTIA CySA+",
  "Cisco CCNA",
  "ISC2 Candidate",
  "Google AI Essentials",
];

const openToRoles = [
  "Cybersecurity Engineering",
  "Security Operations",
  "Cloud Security",
  "Security Automation",
  "IAM / Identity Security",
];

const featuredProjects = projectsData.filter(p => p.featured).slice(0, 3);
const recentWriteups = writeupsData.slice(0, 3);

export default function Index() {
  return (
    <div className="min-h-screen">
      {/* ===== HERO ===== */}
      <section className="relative pt-20 md:pt-28 lg:pt-32 pb-0 overflow-hidden hero-grid-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent" />
        <div className="container relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-8 items-center">
            {/* Left — Text */}
            <div className="order-2 lg:order-1">
              <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={0}
                className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-3 leading-[1.1] tracking-tight"
              >
                Vijaysingh Puwar
              </motion.h1>
              <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={1}
                className="font-mono text-sm tracking-[0.2em] uppercase text-primary mb-6"
              >
                Cybersecurity Engineer
              </motion.p>
              <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
                className="text-lg md:text-xl text-muted-foreground max-w-xl mb-8 leading-relaxed"
              >
                Specializing in identity security, security automation, and cloud infrastructure defense. Building practical detection pipelines, endpoint hardening systems, and scalable security tooling.
              </motion.p>
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}
                className="flex flex-col sm:flex-row items-start gap-3 mb-4"
              >
                <Button size="lg" asChild className="shadow-[0_0_15px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)] transition-shadow">
                  <a href="/resume.pdf" download><Download className="w-4 h-4 mr-2" />Download Resume</a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/projects"><ArrowRight className="w-4 h-4 mr-2" />View Projects</Link>
                </Button>
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
                <a href="https://github.com/vijaysinghpuwar" target="_blank" rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="https://linkedin.com/in/vijaysinghpuwar" target="_blank" rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="mailto:contact@vijaysinghpuwar.com"
                  className="text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
              </motion.div>
            </div>

            {/* Right — Portrait */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="order-1 lg:order-2 relative flex justify-center lg:justify-end"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-[500px] h-[500px] rounded-full bg-primary/[0.07] blur-[120px] pointer-events-none" />
              <div className="relative w-full h-80 sm:h-[420px] lg:h-[600px]">
                <img
                  src={profilePhoto}
                  alt="Vijaysingh Puwar"
                  className="relative w-full h-full object-contain object-bottom drop-shadow-[0_0_40px_hsl(var(--primary)/0.15)] brightness-110"
                  style={{ maskImage: 'radial-gradient(ellipse 70% 80% at 50% 40%, black 50%, transparent 90%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 80% at 50% 40%, black 50%, transparent 90%)' }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== SECURITY STACK ===== */}
      <section className="py-8 border-t border-border/40">
        <div className="container max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-2"
          >
            {securityStack.map((tool) => (
              <span key={tool} className="font-mono text-xs px-3 py-1.5 rounded border border-border/60 bg-card text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
                {tool}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== CORE COMPETENCIES ===== */}
      <section className="py-16 border-t border-border/40">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-heading">What I Do</p>
            <h2 className="section-title">Core Competencies</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item, i) => (
              <motion.div key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className="h-full border-border/40 bg-card hover:border-primary/20 transition-colors">
                  <CardContent className="p-6">
                    <item.icon className="w-9 h-9 text-primary mb-4" />
                    <h3 className="font-semibold text-foreground mb-2 text-base">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
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
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {featuredProjects.map((project, i) => (
              <motion.div key={project.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className="h-full border-border/40 bg-card hover:border-primary/20 transition-colors group">
                  <CardContent className="p-6 flex flex-col h-full">
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
                        <Badge key={t} variant="secondary" className="text-xs bg-muted text-muted-foreground border-0">{t}</Badge>
                      ))}
                    </div>
                    {project.links.github && (
                      <a href={project.links.github} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-primary hover:underline">
                        <Github className="w-4 h-4 mr-1.5" /> View on GitHub
                      </a>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <Button variant="outline" asChild>
              <Link to="/projects">View All Projects <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ===== TECHNICAL WRITEUPS ===== */}
      {recentWriteups.length > 0 && (
        <section className="py-16 border-t border-border/40">
          <div className="container max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="section-heading">Security Analysis</p>
              <h2 className="section-title">Technical Writeups</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {recentWriteups.map((writeup: any, i: number) => (
                <motion.div key={writeup.id || i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                  <Card className="h-full border-border/40 bg-card hover:border-primary/20 transition-colors">
                    <CardContent className="p-6">
                      <Badge variant="outline" className="text-xs mb-3 text-primary border-primary/20">{writeup.category}</Badge>
                      <h3 className="font-semibold text-foreground mb-2">{writeup.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{writeup.summary || writeup.description}</p>
                      <Link to="/writeups" className="text-sm text-primary hover:underline">View Analysis →</Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className="text-center">
              <Button variant="outline" asChild>
                <Link to="/writeups">View All Writeups <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ===== EXPERIENCE ===== */}
      <section className="py-16 border-t border-border/40">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-heading">Career</p>
            <h2 className="section-title">Experience</h2>
          </div>
          <div className="space-y-10">
            {experience.map((job, i) => (
              <motion.div key={job.company} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="relative pl-6 border-l-2 border-border/60"
              >
                <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-primary" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                  <h3 className="font-bold text-foreground text-lg">{job.company}</h3>
                  <span className="text-sm text-primary font-medium">— {job.role}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3 font-mono">{job.period}</p>
                <ul className="space-y-2">
                  {job.bullets.map((b, j) => (
                    <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                      <span>
                        {b.text}
                        {b.bold && <strong className="text-foreground">{b.bold}</strong>}
                        {b.after}
                      </span>
                    </li>
                  ))}
                </ul>
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
                <Card className="h-full border-border/40 bg-card">
                  <CardContent className="p-6">
                    <GraduationCap className="w-7 h-7 text-primary mb-3" />
                    <h3 className="font-bold text-foreground mb-1 text-lg">{edu.degree}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{edu.school}</p>
                    <p className="text-sm text-muted-foreground">{edu.location}</p>
                    <div className="flex gap-3 mt-3 mb-4">
                      <Badge variant="outline" className="text-xs">{edu.gpa}</Badge>
                      <Badge variant="outline" className="text-xs">{edu.status}</Badge>
                    </div>
                    {edu.coursework.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">Selected Coursework</p>
                        <div className="flex flex-wrap gap-1.5">
                          {edu.coursework.map(c => (
                            <Badge key={c} variant="secondary" className="text-xs bg-muted text-muted-foreground border-0">{c}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
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
              <div key={cert} className="flex items-center justify-center gap-2.5 px-5 py-4 rounded-lg border border-border/60 bg-card text-sm text-foreground hover:border-primary/30 hover:bg-card-elevated transition-colors">
                <Award className="w-4 h-4 text-primary flex-shrink-0" />{cert}
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
              <div key={role} className="flex items-center gap-2 px-5 py-3 rounded-lg border border-primary/20 bg-primary/[0.05] text-sm text-foreground font-medium">
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
            <Button size="lg" asChild>
              <Link to="/contact">Contact Me</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
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
