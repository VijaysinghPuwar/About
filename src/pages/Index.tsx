// Update this page (the content is just a fallback if you fail to update the page)

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TechBadge } from '@/components/TechBadge';
import { ProjectCard } from '@/components/ProjectCard';
import { Shield, Terminal, Code, Database, ChevronRight, Star, ArrowRight, Github, ExternalLink, FileText, Briefcase, Award, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import projectsData from '@/data/projects.json';
import writeupsData from '@/data/writeups.json';
import heroImage from '@/assets/hero-bg.jpg';

const tools = [
  'Splunk', 'Sigma', 'Suricata', 'Zeek', 'Nmap', 'Wireshark', 
  'Burp Suite', 'Metasploit', 'Python', 'PowerShell', 'Git', 'Docker'
];

const certificationBadges = [
  { name: 'Security+', issuer: 'CompTIA' },
  { name: 'CySA+', issuer: 'CompTIA' },
  { name: 'CCNA', issuer: 'Cisco' },
  { name: 'AWS', issuer: 'Amazon' },
  { name: 'Azure', issuer: 'Microsoft' },
  { name: 'Python', issuer: 'Programming' }
];

const experience = [
  {
    title: "System Engineer",
    company: "R. S. Infotech",
    location: "India",
    period: "February 2023 - August 2024",
    highlights: [
      "Managed and secured 150+ enterprise IT systems, reducing breaches by 20%",
      "Implemented advanced security protocols, firewalls, and intrusion detection systems",
      "Automated Active Directory hygiene with PowerShell",
      "Engineered Python automation scripts for log analysis and uptime monitoring"
    ]
  },
  {
    title: "Systems Intern",
    company: "L&T-Sargent & Lundy Limited",
    location: "Vadodara, Gujarat, India",
    period: "January 2023 - April 2023",
    highlights: [
      "Coordinated HVAC system design for power plants achieving 100% ASHRAE standards",
      "Performed heat load calculations for critical infrastructure",
      "Streamlined airflow management reducing operational costs by 10%"
    ]
  }
];

const certifications = [
  { name: "CompTIA CySA+", issuer: "CompTIA", year: "2024", status: "active" },
  { name: "CompTIA Security+", issuer: "CompTIA", year: "2024", status: "active" },
  { name: "Cisco CCNA", issuer: "Cisco", year: "2024", status: "active" }
];

const Index = () => {
  const featuredProjects = projectsData.filter(p => p.featured).slice(0, 3);
  const latestWriteups = writeupsData.slice(0, 3);

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        
        {/* Animated grid overlay */}
        <div className="absolute inset-0 cyber-grid opacity-30" />
        
        {/* Content */}
        <div className="relative container text-center space-y-8 animate-fade-in">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-5xl md:text-7xl font-bold">
              <span className="text-foreground">Vijaysingh</span>{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Puwar
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-primary font-semibold">
              Cybersecurity Engineer
            </p>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Network Security • Cloud Security • Incident Response
            </p>
            
            <p className="text-base md:text-lg text-foreground/80 max-w-4xl mx-auto">
              Building secure systems with code, detections, and hands-on labs.
            </p>
          </motion.div>

          {/* Certification badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {certificationBadges.map((cert, index) => (
              <TechBadge
                key={cert.name}
                tech={cert.name}
                variant="status"
                className="animate-fade-in"
              />
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              size="lg"
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-cyan text-lg px-8"
            >
              <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
                View Resume (PDF)
              </a>
            </Button>
            <Button 
              size="lg"
              asChild
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-glow-violet text-lg px-8"
            >
              <Link to="/contact">
                Get In Touch
              </Link>
            </Button>
            <Button 
              variant="outline"
              size="lg"
              asChild
              className="border-primary/30 hover:border-primary/50 hover:bg-primary/5 text-lg px-8"
            >
              <a href="https://github.com/vijaysinghpuwar" target="_blank" rel="noopener noreferrer">
                <Github className="w-5 h-5 mr-2" />
                GitHub
              </a>
            </Button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronRight className="w-6 h-6 text-primary rotate-90" />
        </div>
      </section>

      {/* Tools Marquee */}
      <section className="py-12 bg-card/30 border-y border-border/30">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Security Toolbox</h2>
            <p className="text-muted-foreground">Technologies and tools I work with daily</p>
          </div>
          
          <div className="relative overflow-hidden">
            <div className="flex animate-marquee gap-8 py-4">
              {[...tools, ...tools].map((tool, index) => (
                <div
                  key={`${tool}-${index}`}
                  className="flex items-center gap-2 px-4 py-2 bg-muted/20 rounded-lg border border-border/30 whitespace-nowrap"
                >
                  <Terminal className="w-4 h-4 text-primary" />
                  <span className="text-foreground font-mono text-sm">{tool}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20">
        <div className="container space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Featured Security Projects
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Hands-on cybersecurity labs, automation scripts, and research projects 
              with real-world applications and measurable results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              asChild
              className="bg-primary hover:bg-primary/90 shadow-glow-cyan"
            >
              <Link to="/projects">
                View All Projects
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Writeups */}
      <section className="py-20 bg-card/20">
        <div className="container space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Latest Security Writeups
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              In-depth analysis of CTF challenges, detection engineering, 
              and cybersecurity research with practical insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestWriteups.map((writeup, index) => (
              <motion.div
                key={writeup.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card-elevated hover:shadow-cyber cyber-hover h-full">
                  <div className="aspect-video w-full bg-gradient-to-br from-secondary/10 via-primary/5 to-secondary/5 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileText className="w-12 h-12 text-primary/20" />
                    </div>
                    <div className="absolute top-4 left-4">
                      <TechBadge tech={writeup.category} variant="category" />
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {writeup.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground line-clamp-2">
                      {writeup.summary}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      {writeup.tags.slice(0, 3).map((tag) => (
                        <TechBadge key={tag} tech={tag} variant="tech" />
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                    >
                      <Link to={`/writeups/${writeup.slug}`}>
                        Read More
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-primary/30 hover:border-primary/50 hover:bg-primary/5"
            >
              <Link to="/writeups">
                View All Writeups
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-20 bg-background">
        <div className="container space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Professional Experience
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Building secure systems and protecting digital infrastructure across diverse environments
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {experience.map((job, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full hover:border-primary/30 hover:shadow-cyber transition-all duration-300">
                  <CardHeader>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-xl font-bold text-foreground">
                            {job.title}
                          </CardTitle>
                          <p className="text-primary font-medium mt-1">{job.company}</p>
                        </div>
                        <Briefcase className="w-5 h-5 text-primary flex-shrink-0" />
                      </div>
                      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {job.period}
                        </div>
                        <p>{job.location}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {job.highlights.map((highlight, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-1.5">•</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-20 bg-card/20">
        <div className="container space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Certifications
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Industry-recognized certifications validating expertise in cybersecurity and networking
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {certifications.map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full hover:border-primary/30 hover:shadow-cyber transition-all duration-300 text-center">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="p-4 rounded-full bg-primary/10">
                        <Award className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-lg font-bold text-foreground">
                      {cert.name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {cert.issuer} • {cert.year}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TechBadge 
                      tech={cert.status === 'active' ? 'Active' : 'Candidate'} 
                      variant="status" 
                    />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5">
        <div className="container text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Let's Build Secure Systems Together
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Whether you're looking to collaborate on security projects, discuss threat detection strategies, 
              or explore career opportunities, I'd love to connect.
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-primary hover:bg-primary/90 shadow-glow-cyan text-lg px-8"
            >
              <Link to="/contact">
                Start a Conversation
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-primary/30 hover:border-primary/50 hover:bg-primary/5 text-lg px-8"
            >
              <Link to="/about">
                Learn More About Me
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
