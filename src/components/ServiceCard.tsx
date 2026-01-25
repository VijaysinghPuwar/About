import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Github, ArrowRight, Zap, Shield, Cloud, Terminal, Network, Code } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  tech: string[];
  year: string;
  status: string;
  featured: boolean;
  keyResults: string[];
  links: {
    github: string | null;
    writeup: string | null;
    demo: string | null;
  };
  image: string;
  tags: string[];
}

interface ServiceCardProps {
  project: Project;
  index: number;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'automation':
      return Zap;
    case 'cloud security':
      return Cloud;
    case 'network security':
      return Network;
    case 'application security':
    case 'application development':
      return Code;
    case 'low-level security':
      return Terminal;
    default:
      return Shield;
  }
};

const getCategoryGradient = (category: string) => {
  switch (category.toLowerCase()) {
    case 'automation':
      return 'from-primary/20 via-primary/10 to-transparent';
    case 'cloud security':
      return 'from-secondary/20 via-secondary/10 to-transparent';
    case 'network security':
      return 'from-success/20 via-success/10 to-transparent';
    case 'research':
      return 'from-warning/20 via-warning/10 to-transparent';
    default:
      return 'from-primary/20 via-secondary/10 to-transparent';
  }
};

const getCategoryAccent = (category: string) => {
  switch (category.toLowerCase()) {
    case 'automation':
      return 'border-primary/30 hover:border-primary/60';
    case 'cloud security':
      return 'border-secondary/30 hover:border-secondary/60';
    case 'network security':
      return 'border-success/30 hover:border-success/60';
    case 'research':
      return 'border-warning/30 hover:border-warning/60';
    default:
      return 'border-primary/30 hover:border-primary/60';
  }
};

export function ServiceCard({ project, index }: ServiceCardProps) {
  const CategoryIcon = getCategoryIcon(project.category);
  const gradientClass = getCategoryGradient(project.category);
  const accentClass = getCategoryAccent(project.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group h-full"
    >
      <div
        className={cn(
          "relative h-full flex flex-col rounded-2xl border bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-500",
          accentClass,
          "hover:shadow-cyber hover:bg-card/80 hover:-translate-y-1"
        )}
      >
        {/* Gradient overlay */}
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", gradientClass)} />
        
        {/* Featured badge */}
        {project.featured && (
          <div className="absolute top-4 right-4 z-10">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/20 text-primary border border-primary/30 backdrop-blur-sm">
              Featured
            </span>
          </div>
        )}

        {/* Header with icon */}
        <div className="relative p-6 pb-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <CategoryIcon className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {project.category}
              </span>
              <h3 className="text-lg font-bold text-foreground mt-1 line-clamp-2 group-hover:text-primary transition-colors">
                {project.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="relative px-6 pb-4 flex-1">
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
            {project.description}
          </p>
        </div>

        {/* Key features */}
        <div className="relative px-6 pb-4">
          <div className="space-y-2">
            {project.keyResults.slice(0, 2).map((result, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <span className="text-muted-foreground line-clamp-1">{result}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tech stack */}
        <div className="relative px-6 pb-4">
          <div className="flex flex-wrap gap-1.5">
            {project.tech.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 text-xs font-mono rounded-md bg-muted/50 text-muted-foreground border border-border/50"
              >
                {tech}
              </span>
            ))}
            {project.tech.length > 4 && (
              <span className="px-2.5 py-1 text-xs font-mono rounded-md bg-muted/50 text-muted-foreground">
                +{project.tech.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="relative mt-auto p-6 pt-4 border-t border-border/50">
          <div className="flex gap-3">
            {project.links.github && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex-1 border-border/50 hover:border-primary/50 hover:bg-primary/5 group/btn"
              >
                <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" />
                  Source
                </a>
              </Button>
            )}
            <Button
              size="sm"
              asChild
              className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 group/btn"
            >
              <Link to={`/projects/${project.id}`}>
                Details
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
