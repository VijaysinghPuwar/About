import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TechBadge } from '@/components/TechBadge';
import { Shield, GraduationCap, Target, Users, Award, MapPin, Calendar, ExternalLink } from 'lucide-react';

const timeline = [
  {
    year: "2025",
    title: "CompTIA CySA+ & Cisco CCNA Certified",
    description: "Earned industry certifications: CompTIA CySA+ (Nov 2025) and Cisco CCNA (Aug 2025), validating expertise in cybersecurity analysis and networking.",
    type: "certification"
  },
  {
    year: "2024",
    title: "Started Master's Program at Pace University",
    description: "Began Master of Science in Cybersecurity at Pace University Seidenberg School, focusing on IAM, cloud security, and security automation. GPA: 4.00",
    type: "education"
  },
  {
    year: "2023-2024",
    title: "Cybersecurity & Systems Engineer at R.S. Infotech",
    description: "Secured 150+ Windows/Linux endpoints, performed AD identity hygiene, supported IAM operations, and deployed AWS cloud security with CloudWatch alerts.",
    type: "career"
  }
];

const interests = [
  {
    icon: Shield,
    title: "Identity & Access Management",
    description: "Active Directory hygiene, MFA enforcement, least-privilege access, user lifecycle management, and privileged access reviews."
  },
  {
    icon: Target,
    title: "Cloud Security",
    description: "AWS IAM, VPC, Security Groups, NACLs, CloudWatch monitoring, and SNS alerting for security events."
  },
  {
    icon: Users,
    title: "Security Automation",
    description: "Python and PowerShell scripting for log parsing, account audits, configuration checks, and automated security workflows."
  },
  {
    icon: Award,
    title: "Network Security",
    description: "TCP/IP, VLANs, ACLs, firewalls, Wireshark analysis, IDS/IPS, and routing/switching protocols."
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
            NYC-based cybersecurity engineer with hands-on experience in identity & access management, 
            network security, and cloud security.
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
            <span>CySA+ | Security+ | CCNA</span>
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
            Mid-level Cybersecurity Engineer with hands-on experience across identity & access management (IAM), 
            network security, and cloud security in Windows, Active Directory, and AWS environments. I've hardened 
            150+ endpoints and servers, enforced MFA and least-privilege access, and used Python/PowerShell to 
            automate account hygiene and log-based audits.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Currently pursuing my Master's in Cybersecurity at Pace University with a 4.00 GPA, focusing on 
            automating information security, network security & defense, ethical hacking, and cyber intelligence. 
            My coursework emphasizes practical, auditable security controls that translate directly to real-world 
            security operations.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            My approach to cybersecurity centers on practical implementation: from performing Active Directory 
            identity hygiene using PowerShell to deploying AWS resources with proper IAM policies and CloudWatch 
            monitoring. I believe in building security that's auditable, automated, and aligned with compliance requirements.
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
                    event.type === 'career' ? 'bg-primary' : 
                    event.type === 'certification' ? 'bg-green-500' : 'bg-secondary'
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
            <h3 className="font-semibold text-foreground mb-4">Leadership & Mentorship</h3>
            <p className="text-muted-foreground mb-4">
              Informal Mentor & Study Group Lead for cybersecurity peers (2024 – Present). I guide classmates 
              and junior peers through labs in networking, security automation, and cloud security, helping them 
              interpret logs, design fixes, and structure incident-style reports. I share scripts, lab notes, and 
              troubleshooting guides to foster a collaborative learning environment.
            </p>
          </div>

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
              I believe in giving back to the cybersecurity community through open-source contributions 
              and educational content. All my security tools, lab configurations, and automation scripts 
              are shared publicly to help others learn and improve their security posture.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" asChild className="border-primary/20 hover:border-primary/40">
                <a href="https://github.com/VijaysinghPuwar" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  GitHub Projects
                </a>
              </Button>
              <Button variant="outline" asChild className="border-primary/20 hover:border-primary/40">
                <a href="https://linkedin.com/in/vijaysinghpuwar" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Professional Network
                </a>
              </Button>
              <Button variant="outline" asChild className="border-primary/20 hover:border-primary/40">
                <a href="https://tryhackme.com/p/VoidHex" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  TryHackMe
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
