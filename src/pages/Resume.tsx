import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TechBadge } from '@/components/TechBadge';
import { Download, ExternalLink, Calendar, MapPin, GraduationCap, Briefcase, Award, Code, Shield, Mail, Phone } from 'lucide-react';
import ccnaCert from '@/assets/certifications/ccna.jpeg';
import cysaCert from '@/assets/certifications/cysa.jpeg';

const education = [
  {
    degree: "Master of Science in Cybersecurity",
    school: "Pace University - Seidenberg School of CSIS",
    location: "New York City, NY",
    period: "2024 - 2026 (Expected)",
    gpa: "4.00",
    details: [
      "Automating Information Security (Python & Shell)",
      "Network Security & Defense",
      "Ethical Hacking & Penetration Testing",
      "Cyber Intelligence Analysis & Modeling",
      "Operating Systems Theory & Administration"
    ]
  }
];

const experience = [
  {
    title: "Cybersecurity & Systems Engineer",
    company: "R.S. Infotech",
    location: "India",
    period: "February 2023 - August 2024",
    responsibilities: [
      "Secured and maintained 150+ Windows and Linux endpoints and servers by enforcing baseline controls (patches, AV, BitLocker, host firewalls) to reduce exploitable attack surface",
      "Performed Active Directory identity hygiene using ADUC, GPMC, Event Viewer, and PowerShell (Get-ADUser, Search-ADAccount, lastLogon attributes) to identify inactive, orphaned, and high-risk accounts",
      "Supported IAM operations by assisting user onboarding/offboarding, adjusting group memberships and access rights based on role changes, and validating privileged groups against least-privilege expectations",
      "Assisted with MFA and password policy enforcement through Group Policy and identity controls, reducing account takeover risk for remote-access and admin accounts",
      "Used Python/PowerShell to automate log parsing, account and permission audits, and configuration checks, cutting triage time for recurring identity-related alerts",
      "Deployed and secured AWS resources (IAM, VPC, EC2, S3, Security Groups, NACLs) and integrated CloudWatch + SNS alerts to surface suspicious activity and misconfigurations"
    ]
  }
];

const certifications = [
  { 
    name: "CompTIA CySA+", 
    issuer: "CompTIA", 
    date: "November 7, 2025",
    expires: "November 7, 2028",
    code: "4d190052eac6477196e2a5e0f4e6bf4a",
    image: cysaCert,
    status: "active" 
  },
  { 
    name: "CompTIA Security+", 
    issuer: "CompTIA", 
    date: "2024",
    status: "active" 
  },
  { 
    name: "Cisco CCNA", 
    issuer: "Cisco", 
    date: "August 18, 2025",
    expires: "August 18, 2028",
    credentialId: "CSCO14790731",
    image: ccnaCert,
    status: "active" 
  }
];

const skills = {
  "Programming & Scripting": ["Python", "PowerShell", "Bash"],
  "Ethical Hacking & Penetration Testing": ["Nmap", "Burp Suite", "Metasploit", "Password/Brute-force Testing", "Web App Assessments"],
  "Application Security": ["Authentication/Authorization", "Secure Credential Handling", "OWASP", "Logging & Monitoring"],
  "Network Security": ["TCP/IP", "VLANs", "ACLs", "VPN", "DNS/DHCP", "Firewalls", "Wireshark", "IDS/IPS"],
  "Routing & Switching": ["Inter-VLAN Routing (ROAS)", "Rapid-PVST", "RIPv2", "Trunking", "STP Protections (PortFast, BPDU Guard, Root Guard)"],
  "Cloud & IAM": ["AWS IAM", "VPC", "EC2", "S3", "Security Groups", "NACLs", "CloudWatch", "SNS", "MFA", "Least-Privilege Design"],
  "Tools & Platforms": ["Windows 10/11", "Linux CLI", "Active Directory", "Group Policy", "Docker", "VirtualBox/VMware", "Git/GitHub", "ServiceNow/Jira"]
};

const academicProjects = [
  {
    name: "Automating-InfoSec",
    description: "Security Automation Labs (CYB 631)",
    year: "2024",
    details: [
      "Developed Python/PowerShell scripts to parse logs, summarize events, and automate common security checks",
      "Turned manual SOC/IAM tasks into repeatable, auditable workflows for incident triage and compliance"
    ]
  },
  {
    name: "Configuring Cloud Security in AWS",
    description: "IAM & Network Hardening",
    year: "2024",
    details: [
      "Designed secure EC2 environment with IAM users/roles, least-privilege policies, and tightly scoped Security Groups/NACLs",
      "Integrated CloudWatch metrics and SNS alerts for identity- and configuration-related event monitoring"
    ]
  },
  {
    name: "Network Security & Campus Labs",
    description: "Routing & Switching Labs",
    year: "2024",
    details: [
      "Built Rapid-PVST and ROAS labs for inter-VLAN routing and Layer 2 best practices",
      "Implemented spanning-tree protections and ACL filtering in simulated enterprise environments"
    ]
  }
];

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
            Cybersecurity Engineer | Identity & Access Management | Network & Cloud Security
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>NYC</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>vpuwar77@gmail.com</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>+1-929-400-2052</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>CompTIA CySA+ | CompTIA Security+ | Cisco CCNA</span>
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
            <a href="https://linkedin.com/in/vijaysinghpuwar" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              LinkedIn
            </a>
          </Button>
          <Button variant="outline" asChild className="border-primary/20 hover:border-primary/40">
            <a href="https://github.com/VijaysinghPuwar" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              GitHub
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

      {/* Professional Summary */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            Mid-level Cybersecurity Engineer with hands-on experience across identity & access management (IAM), 
            network security, and cloud security in Windows, Active Directory, and AWS environments. Hardened 150+ 
            endpoints and servers, enforced MFA and least-privilege access, and used Python/PowerShell to automate 
            account hygiene and log-based audits. Graduate-level training in automating information security, network 
            security & defense, ethical hacking, and cyber intelligence, with a strong focus on practical, auditable 
            security controls.
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
            <div key={index} className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="font-semibold text-foreground">{edu.degree}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {edu.period}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-muted-foreground">
                <span className="font-medium">{edu.school}</span>
                <span className="hidden sm:block">•</span>
                <span>{edu.location}</span>
                {edu.gpa && (
                  <>
                    <span className="hidden sm:block">•</span>
                    <span className="text-primary font-medium">GPA: {edu.gpa}</span>
                  </>
                )}
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
            Relevant Experience
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
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {certifications.map((cert, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/20 border border-border/30 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{cert.name}</h4>
                    <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                  </div>
                  <TechBadge 
                    tech="Active" 
                    variant="status" 
                  />
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Issued: {cert.date}</p>
                  {cert.expires && <p>Expires: {cert.expires}</p>}
                  {cert.credentialId && <p>ID: {cert.credentialId}</p>}
                </div>
              </div>
            ))}
          </div>
          
          {/* Certificate Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-2">
              <h4 className="font-medium text-foreground text-center">Cisco CCNA</h4>
              <img 
                src={ccnaCert} 
                alt="Cisco CCNA Certificate - Vijaysingh Puwar" 
                className="w-full rounded-lg border border-border/30"
              />
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground text-center">CompTIA CySA+</h4>
              <img 
                src={cysaCert} 
                alt="CompTIA CySA+ Certificate - Vijaysingh Puwar" 
                className="w-full rounded-lg border border-border/30"
              />
            </div>
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

      {/* Academic Projects */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            Academic Projects & Labs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {academicProjects.map((project, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">{project.name}</h4>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </div>
                <TechBadge tech={project.year} variant="year" />
              </div>
              <ul className="space-y-1">
                {project.details.map((detail, idx) => (
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
    </div>
  );
}
