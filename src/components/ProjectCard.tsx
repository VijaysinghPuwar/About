import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TechBadge } from '@/components/TechBadge';
import { Github, ExternalLink, FileText, Star } from 'lucide-react';
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

interface ProjectCardProps {
  project: Project;
  className?: string;
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  return (
    <Card className={cn(
      "group relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300",
      "hover:border-primary/30 hover:bg-card-elevated hover:shadow-cyber",
      "cyber-hover",
      className
    )}>
      {/* Featured indicator */}
      {project.featured && (
        <div className="absolute top-4 right-4 z-10">
          <TechBadge tech="Featured" variant="featured" />
        </div>
      )}

      {/* Project image placeholder */}
      <div className="aspect-video w-full bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl text-primary/20 font-mono">{project.category}</div>
        </div>
        <div className="absolute top-4 left-4">
          <TechBadge tech={project.category} variant="category" />
        </div>
        <div className="absolute bottom-4 left-4">
          <TechBadge tech={project.year} variant="year" />
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="flex items-start justify-between gap-2">
          <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
            {project.title}
          </span>
        </CardTitle>
        <CardDescription className="text-muted-foreground line-clamp-2">
          {project.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tech stack */}
        <div className="flex flex-wrap gap-1.5">
          {project.tech.slice(0, 4).map((tech) => (
            <TechBadge key={tech} tech={tech} variant="tech" />
          ))}
          {project.tech.length > 4 && (
            <TechBadge tech={`+${project.tech.length - 4}`} variant="tech" />
          )}
        </div>

        {/* Key results */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Key Results:</h4>
          <ul className="space-y-1">
            {project.keyResults.slice(0, 2).map((result, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <Star className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                {result}
              </li>
            ))}
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          {project.links.github && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex-1 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
            >
              <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" />
                Code
              </a>
            </Button>
          )}
          
          {project.links.writeup && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex-1 border-secondary/20 hover:border-secondary/40 hover:bg-secondary/5"
            >
              <Link to={project.links.writeup}>
                <FileText className="w-4 h-4 mr-2" />
                Writeup
              </Link>
            </Button>
          )}
          
          {project.links.demo && (
            <Button
              size="sm"
              asChild
              className="flex-1 bg-primary hover:bg-primary/90 shadow-glow-cyan"
            >
              <a href={project.links.demo} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Demo
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}