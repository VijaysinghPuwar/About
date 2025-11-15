import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TechBadge } from '@/components/TechBadge';
import { Shield, GraduationCap, Target, Users, Award, MapPin, Calendar, ExternalLink } from 'lucide-react';

const timeline = [
  {
    year: "2024",
    title: "System Engineer at R. S. Infotech",
    description: "Managed and secured 150+ enterprise IT systems, implemented IDS/IPS reducing breaches by 20%, and automated security operations with Python and PowerShell.",
    type: "career"
  },
  {
    year: "2023",
    title: "Started Master's Program",
    description: "Began Master of Science in Cybersecurity at Pace University, focusing on cloud security, threat detection, and applied computational statistics.",
    type: "education"
  },
  {
    year: "2023",
    title: "Systems Intern at L&T-Sargent & Lundy",
    description: "Coordinated HVAC system design for power plants, performed heat load calculations, and streamlined operations reducing costs by 10%.",
    type: "career"
  }
];

const interests = [
  {
    icon: Shield,
    title: "Network Security",
    description: "Firewall configuration, IDS/IPS deployment, network segmentation, and defense-in-depth strategies."
  },
  {
    icon: Target,
    title: "Cloud Security",
    description: "AWS, Azure, and GCP security architecture, IAM policies, encryption, and monitoring with CloudWatch."
  },
  {
    icon: Users,
    title: "Security Automation",
    description: "Python and PowerShell scripting for log analysis, threat detection, and system hardening automation."
  },
  {
    icon: Award,
    title: "SOC Operations",
    description: "SIEM monitoring with Splunk, threat hunting, detection rule development, and incident response."
  }
];

const conferences = [
  { name: "BSides NYC", year: "2024", type: "attended" },
  { name: "SANS Community Event", year: "2024", type: "attended" },
  { name: "DEF CON", year: "2023", type: "virtual" },
  { name: "Black Hat USA", year: "2023", type: "virtual" }
];

export default function About() {
  return (
    <div className="container py-12 max-w-4xl space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 animate-fade-in">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            About Me
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            NYC-based cybersecurity engineer passionate about building secure systems, 
            detecting threats, and contributing to the security community through research and education.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>New York City</span>
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            <span>MS Cybersecurity @ Pace University</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Security+ | CySA+ | CCNA</span>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Professional Background
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed mb-4">
            I'm a Cybersecurity Engineer based in New York City, focused on shielding organizations from 
            digital threats. Currently pursuing my Master's in Cybersecurity at Pace University, I specialize 
            in network security, incident response, penetration testing, and cloud security.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Throughout my career, I've configured and hardened 50+ systems using firewalls, endpoint protection, 
            and secure baselines. I write Python and PowerShell scripts to automate log analysis, Splunk alert 
            enrichment, and account audits. My experience includes supporting SOC monitoring by building detection 
            rules and performing threat hunting on live data, as well as implementing IAM best practices including 
            MFA, GPO hardening, and access lifecycle reviews.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Beyond professional work, I attend cybersecurity conferences and participate in Capture the Flag (CTF) 
            events. I also contribute to open-source security tools and mentor new engineers on best practices. 
            My goal is to keep security clear, simple, and accessible so everyone can coordinate seamlessly.
          </p>
        </CardContent>
      </Card>

      {/* Interests */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Areas of Focus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {interests.map((interest, index) => {
              const Icon = interest.icon;
              return (
                <div key={index} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">{interest.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {interest.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Professional Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {timeline.map((event, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${
                    event.type === 'career' ? 'bg-primary' : 'bg-secondary'
                  }`} />
                  {index < timeline.length - 1 && (
                    <div className="w-px h-12 bg-border/50 mt-2" />
                  )}
                </div>
                <div className="space-y-2 pb-6">
                  <div className="flex items-center gap-3">
                    <TechBadge tech={event.year} variant="year" />
                    <h3 className="font-semibold text-foreground">{event.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conferences & Community */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Community Involvement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-foreground mb-4">Conferences & Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {conferences.map((conf, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                  <div>
                    <span className="font-medium text-foreground">{conf.name}</span>
                    <p className="text-sm text-muted-foreground">{conf.year}</p>
                  </div>
                  <TechBadge 
                    tech={conf.type === 'attended' ? 'Attended' : 'Virtual'} 
                    variant={conf.type === 'attended' ? 'status' : 'category'} 
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Open Source & Sharing</h3>
            <p className="text-muted-foreground mb-4">
              I believe in giving back to the cybersecurity community through open-source contributions, 
              educational content, and mentorship. All my security tools and research are shared publicly 
              to help others learn and improve their security posture.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" asChild className="border-primary/20 hover:border-primary/40">
                <a href="https://github.com/vijaysinghpuwar" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  GitHub Projects
                </a>
              </Button>
              <Button variant="outline" asChild className="border-primary/20 hover:border-primary/40">
                <a href="https://linkedin.com/in/vijaysingh-puwar" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Professional Network
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="text-center space-y-4 animate-fade-in">
        <h2 className="text-2xl font-bold text-foreground">Let's Connect</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Always interested in discussing cybersecurity, collaboration opportunities, 
          or sharing knowledge with fellow security professionals.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild className="bg-primary hover:bg-primary/90 shadow-glow-cyan">
            <a href="/contact">Get In Touch</a>
          </Button>
          <Button variant="outline" asChild className="border-primary/20 hover:border-primary/40">
            <a href="/resume">View Resume</a>
          </Button>
        </div>
      </div>
    </div>
  );
}