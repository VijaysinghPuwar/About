import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Target, BookOpen, Mail, Github, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';
import profilePhoto from '@/assets/profile-photo.jpg';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } })
};

export default function About() {
  return (
    <div className="min-h-screen py-20">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="section-heading">About</p>
          <h1 className="section-title">Vijaysingh Puwar</h1>
        </div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
          className="flex flex-col md:flex-row gap-8 items-start mb-16"
        >
          <img src={profilePhoto} alt="Vijaysingh Puwar" className="w-32 h-32 rounded-xl object-cover border border-border/40 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">Cybersecurity Engineer</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              I'm a cybersecurity professional pursuing my M.S. in Cybersecurity at Pace University (GPA: 4.0).
              With experience securing 150+ enterprise systems at R.S. Infotech, I focus on identity and access management,
              security automation with Python and PowerShell, and cloud/network defense.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              My work centers on building practical security solutions — from automated hardening scripts to
              cloud security configurations — that make infrastructure measurably more resilient.
            </p>
            <div className="flex gap-3">
              <a href="https://github.com/vijaysinghpuwar" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors"><Github className="w-5 h-5" /></a>
              <a href="https://linkedin.com/in/vijaysinghpuwar" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="mailto:contact@vijaysinghpuwar.com" className="text-muted-foreground hover:text-foreground transition-colors"><Mail className="w-5 h-5" /></a>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: Shield, title: "Security Operations", desc: "IAM, endpoint hardening, incident response, SIEM monitoring, and vulnerability management." },
            { icon: Target, title: "Automation & Tooling", desc: "Python and PowerShell scripts for log analysis, system hardening, and security workflows." },
            { icon: BookOpen, title: "Continuous Learning", desc: "Currently pursuing M.S. Cybersecurity with certifications in Security+, CySA+, and CCNA." },
          ].map((item, i) => (
            <motion.div key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <Card className="h-full border-border/40 bg-card">
                <CardContent className="pt-6">
                  <item.icon className="w-7 h-7 text-primary mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

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
