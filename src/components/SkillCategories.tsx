import { Shield, Terminal, Cloud, Radar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  {
    key: 'security',
    label: 'Security',
    icon: Shield,
    description: 'Enterprise identity security, threat detection, and incident response.',
    skills: ['IAM / Active Directory', 'SIEM (Splunk)', 'IDS/IPS', 'Vulnerability Assessment', 'Incident Response', 'Endpoint Hardening'],
  },
  {
    key: 'automation',
    label: 'Automation',
    icon: Terminal,
    description: 'Scripting and tooling to eliminate manual security workflows.',
    skills: ['Python', 'PowerShell', 'Shell Scripting', 'Ansible', 'Bash'],
  },
  {
    key: 'cloud',
    label: 'Cloud & Network',
    icon: Cloud,
    description: 'Cloud infrastructure security and network defense architecture.',
    skills: ['AWS (EC2, VPC, IAM, CloudWatch)', 'Cisco (Routing, Switching, VLANs)', 'Firewalls', 'TCP/IP'],
  },
  {
    key: 'tools',
    label: 'Tools',
    icon: Radar,
    description: 'Offensive and defensive security tooling for assessment and monitoring.',
    skills: ['Wireshark', 'Nmap', 'Metasploit', 'Burp Suite', 'Git', 'Docker', 'Linux'],
  },
];

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const pill = {
  hidden: { opacity: 0, y: 12, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.9 },
};

interface SkillCategoriesProps {
  activeTab?: string;
  onTabChange?: (key: string) => void;
}

export function SkillCategories({ activeTab = 'security', onTabChange }: SkillCategoriesProps) {
  const current = CATEGORIES.find(c => c.key === activeTab) || CATEGORIES[0];

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border/40">
        {CATEGORIES.map(cat => {
          const isActive = cat.key === activeTab;
          return (
            <button
              key={cat.key}
              onClick={() => onTabChange?.(cat.key)}
              className={`relative flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/70'
              }`}
            >
              <cat.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{cat.label}</span>
              {isActive && (
                <motion.div
                  layoutId="skills-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Pills */}
      <div className="min-h-[140px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={container}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-wrap gap-2"
          >
            {current.skills.map(skill => (
              <motion.span
                key={skill}
                variants={pill}
                className="px-3 py-1.5 text-sm rounded-lg glass-card text-foreground/80 border border-transparent hover:border-primary/20 hover:shadow-[0_0_12px_hsl(var(--primary)/0.15)] transition-all cursor-default"
              >
                {skill}
              </motion.span>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Description */}
      <AnimatePresence mode="wait">
        <motion.p
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-sm text-muted-foreground mt-4"
        >
          {current.description}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
