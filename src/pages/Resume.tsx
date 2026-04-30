import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Mail, Github, Linkedin, GraduationCap, Award, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } })
};

export default function Resume() {
  return (
    <div className="min-h-[100dvh] py-20">
      <Helmet>
        <title>Resume | Vijaysingh Puwar</title>
        <meta name="description" content="Resume of Vijaysingh Puwar, Cybersecurity Engineer — experience, education, certifications, and core skills." />
        <link rel="canonical" href="https://vijaysinghpuwar.com/resume" />
      </Helmet>
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="section-title mb-2">Vijaysingh Puwar</h1>
          <p className="text-xl text-primary font-medium mb-4">Cybersecurity Engineer</p>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground mb-6">
            <a href="mailto:contact@vijaysinghpuwar.com" className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Mail className="w-4 h-4" /> contact@vijaysinghpuwar.com
            </a>
            <a href="https://github.com/vijaysinghpuwar" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Github className="w-4 h-4" /> GitHub
            </a>
            <a href="https://linkedin.com/in/vijaysinghpuwar" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Linkedin className="w-4 h-4" /> LinkedIn
            </a>
          </div>
          <Button asChild>
            <a href="/resume.pdf" download><Download className="w-4 h-4 mr-2" /> Download Resume</a>
          </Button>
        </div>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-4">Skills</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {Object.entries(skills).map(([category, items], i) => (
              <motion.div key={category} variants={fadeUp} custom={i}>
                <Card className="border-border/40 bg-card">
                  <CardContent className="pt-4">
                    <h3 className="text-sm font-semibold text-primary mb-2">{category}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map(s => <Badge key={s} variant="secondary" className="text-xs bg-muted text-muted-foreground border-0">{s}</Badge>)}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" /> Experience</h2>
          <div className="space-y-6">
            {experience.map((job, i) => (
              <motion.div key={job.company} variants={fadeUp} custom={i} className="pl-5 border-l-2 border-border/60 relative">
                <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-primary" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <h3 className="font-semibold text-foreground">{job.company}</h3>
                  <span className="text-sm text-muted-foreground">— {job.role}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{job.period}</p>
                <ul className="space-y-1">
                  {job.bullets.map((b, j) => (
                    <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="mt-2 w-1 h-1 rounded-full bg-muted-foreground flex-shrink-0" />{b}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-primary" /> Education</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {education.map((edu, i) => (
              <motion.div key={edu.school} variants={fadeUp} custom={i}>
                <Card className="h-full border-border/40 bg-card">
                  <CardContent className="pt-4">
                    <h3 className="font-semibold text-foreground mb-1">{edu.degree}</h3>
                    <p className="text-sm text-muted-foreground">{edu.school}</p>
                    <p className="text-sm text-muted-foreground mb-2">{edu.location}</p>
                    <div className="flex gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">{edu.gpa}</Badge>
                      <Badge variant="outline" className="text-xs">{edu.status}</Badge>
                    </div>
                    {edu.coursework.length > 0 && (
                      <>
                        <p className="text-xs font-semibold text-foreground mb-1.5">Selected Coursework</p>
                        <div className="flex flex-wrap gap-1">
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

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-primary" /> Certifications</h2>
          <div className="flex flex-wrap gap-2">
            {certifications.map(cert => <Badge key={cert} variant="outline" className="px-3 py-1.5 text-sm text-foreground border-border/60">{cert}</Badge>)}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
