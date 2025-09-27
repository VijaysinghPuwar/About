import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TechBadge } from '@/components/TechBadge';
import { Download, ExternalLink, Calendar, MapPin, GraduationCap, Briefcase, Award, Code, Shield } from 'lucide-react';

const education = [
  {
    degree: "Master of Science in Cybersecurity",
    school: "Pace University",
    location: "New York, NY",
    period: "2023 - Present",
    details: ["Focus: Cloud Security & Threat Detection", "GPA: 3.8/4.0"]
  },
  {
    degree: "Bachelor of Science in Information Technology",
    school: "University Example",
    location: "City, State",
    period: "2019 - 2023",
    details: ["Concentration: Network Security", "Summa Cum Laude"]
  }
];

const experience = [
  {
    title: "Cybersecurity Engineering Intern",
    company: "SecureTech Solutions",
    location: "New York, NY",
    period: "Summer 2024",
    responsibilities: [
      "Developed automated threat detection rules using Splunk SPL and Python",
      "Conducted vulnerability assessments on cloud infrastructure (AWS, Azure)",
      "Implemented SIEM correlation rules reducing false positives by 40%",
      "Collaborated on incident response procedures and playbook development"
    ]
  },
  {
    title: "IT Security Analyst",
    company: "Regional Healthcare System",
    location: "Remote",
    period: "2023 - Present",
    responsibilities: [
      "Monitor security events using Splunk and Microsoft Sentinel",
      "Perform risk assessments for medical device integrations",
      "Maintain compliance with HIPAA and other healthcare regulations",
      "Train staff on security awareness and best practices"
    ]
  }
];

const certifications = [
  { name: "CompTIA Security+", issuer: "CompTIA", year: "2024", status: "active" },
  { name: "Cisco Certified Network Associate (CCNA)", issuer: "Cisco", year: "2024", status: "active" },
  { name: "ISC2 Candidate", issuer: "ISC2", year: "2024", status: "candidate" },
  { name: "Google AI Essentials", issuer: "Google", year: "2024", status: "active" }
];

const skills = {
  "SIEM & Detection": ["Splunk", "Microsoft Sentinel", "Sigma Rules", "SPL", "KQL"],
  "Cloud Security": ["AWS Security", "Azure Security", "GCP Security", "CloudTrail", "IAM"],
  "Programming": ["Python", "PowerShell", "Bash", "SQL", "JavaScript"],
  "Security Tools": ["Burp Suite", "Nmap", "Wireshark", "Metasploit", "Nessus"],
  "Frameworks": ["MITRE ATT&CK", "NIST CSF", "OWASP", "CIS Controls"],
  "Operating Systems": ["Windows Server", "Linux", "macOS", "VMware"]
};

export default function Resume() {
  return (
    <div className="container py-12 max-w-4xl space-y-12">
      {/* Header */}
      <div className="text-center space-y-6 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Vijaysingh Puwar
          </h1>
          <p className="text-xl text-primary font-medium">
            Cybersecurity Engineer
          </p>
          <p className="text-lg text-muted-foreground">
            Cloud Security • Application Security • Threat Detection
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>New York, NY</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Security+ Certified</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button 
            asChild
            className="bg-primary hover:bg-primary/90 shadow-glow-cyan"
          >
            <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </a>
          </Button>
          <Button variant="outline" asChild className="border-primary/20 hover:border-primary/40">
            <a href="https://linkedin.com/in/vijaysingh-puwar" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              LinkedIn
            </a>
          </Button>
          <Button variant="outline" asChild className="border-primary/20 hover:border-primary/40">
            <a href="https://github.com/vijaysingh-puwar" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              GitHub
            </a>
          </Button>
        </div>
      </div>

      {/* Professional Summary */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Professional Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            Cybersecurity professional with expertise in cloud security, threat detection, and SIEM engineering. 
            Currently pursuing Master's in Cybersecurity at Pace University while gaining hands-on experience 
            in security operations and incident response. Passionate about automation, detection engineering, 
            and building secure systems through code and configuration.
          </p>
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Education
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {education.map((edu, index) => (
            <div key={index} className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="font-semibold text-foreground">{edu.degree}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {edu.period}
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-medium">{edu.school}</span>
                <span>•</span>
                <span>{edu.location}</span>
              </div>
              <ul className="space-y-1">
                {edu.details.map((detail, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1.5">•</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Experience */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Professional Experience
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {experience.map((job, index) => (
            <div key={index} className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-foreground">{job.title}</h3>
                  <p className="text-primary font-medium">{job.company}</p>
                </div>
                <div className="flex flex-col sm:items-end gap-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {job.period}
                  </div>
                  <span>{job.location}</span>
                </div>
              </div>
              <ul className="space-y-2">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1.5">•</span>
                    {resp}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Certifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certifications.map((cert, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                <div>
                  <h4 className="font-medium text-foreground">{cert.name}</h4>
                  <p className="text-sm text-muted-foreground">{cert.issuer} • {cert.year}</p>
                </div>
                <TechBadge 
                  tech={cert.status === 'active' ? 'Active' : 'Candidate'} 
                  variant={cert.status === 'active' ? 'status' : 'category'} 
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Skills */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            Technical Skills
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(skills).map(([category, skillList]) => (
            <div key={category} className="space-y-3">
              <h4 className="font-semibold text-foreground">{category}</h4>
              <div className="flex flex-wrap gap-2">
                {skillList.map((skill) => (
                  <TechBadge key={skill} tech={skill} variant="tech" />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}