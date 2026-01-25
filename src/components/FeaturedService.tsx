import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Github, ArrowRight, Zap, Shield, Cloud, Terminal, Network, Code, CheckCircle2 } from 'lucide-react';
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

interface FeaturedServiceProps {
  project: Project;
  index: number;
  reversed?: boolean;
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

export function FeaturedService({ project, index, reversed = false }: FeaturedServiceProps) {
  const CategoryIcon = getCategoryIcon(project.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className={cn(
        "grid lg:grid-cols-2 gap-8 lg:gap-12 items-center",
        reversed && "lg:flex-row-reverse"
      )}
    >
      {/* Content side */}
      <div className={cn("space-y-6", reversed && "lg:order-2")}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 flex items-center justify-center">
            <CategoryIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <span className="text-xs font-medium text-primary uppercase tracking-wider">
              {project.category}
            </span>
            <span className="mx-2 text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{project.year}</span>
          </div>
        </div>

        <h3 className="text-2xl md:text-3xl font-bold text-foreground">
          {project.title}
        </h3>

        <p className="text-muted-foreground leading-relaxed">
          {project.description}
        </p>

        {/* Key results with checkmarks */}
        <div className="space-y-3">
          {project.keyResults.map((result, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-foreground/80">{result}</span>
            </div>
          ))}
        </div>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-2">
          {project.tech.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1.5 text-sm font-mono rounded-lg bg-muted/50 text-muted-foreground border border-border/50"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-2">
          {project.links.github && (
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-border hover:border-primary/50 hover:bg-primary/5"
            >
              <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                <Github className="w-5 h-5 mr-2" />
                View Source
              </a>
            </Button>
          )}
          <Button
            size="lg"
            asChild
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-cyan"
          >
            <Link to={`/projects/${project.id}`}>
              Learn More
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Visual side */}
      <div className={cn("relative", reversed && "lg:order-1")}>
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border/50 bg-gradient-to-br from-card via-card/80 to-card/50">
          {/* Abstract pattern background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
            <div className="absolute inset-0 cyber-grid opacity-30" />
            
            {/* Floating elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center backdrop-blur-sm">
                  <CategoryIcon className="w-16 h-16 text-primary/60" />
                </div>
                {/* Orbiting elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 rounded-lg bg-secondary/20 border border-secondary/30 animate-pulse" />
                <div className="absolute -bottom-4 -left-4 w-6 h-6 rounded-full bg-primary/30 border border-primary/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
                <div className="absolute top-1/2 -right-8 w-4 h-4 rounded bg-success/30 border border-success/40 animate-pulse" style={{ animationDelay: '1s' }} />
              </div>
            </div>
          </div>

          {/* Tech badges floating */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
            {project.tech.slice(0, 3).map((tech, i) => (
              <span
                key={tech}
                className="px-2 py-1 text-xs font-mono rounded bg-card/80 backdrop-blur-sm text-muted-foreground border border-border/50"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
      </div>
    </motion.div>
  );
}
