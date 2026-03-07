import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Github } from 'lucide-react';
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
      "h-full border-border/40 bg-card hover:border-primary/20 transition-colors group",
      className
    )}>
      <CardContent className="pt-6 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-xs text-primary border-primary/20">{project.category}</Badge>
          <span className="text-xs text-muted-foreground">{project.year}</span>
          {project.featured && (
            <Badge variant="outline" className="text-xs text-warning border-warning/20">Featured</Badge>
          )}
        </div>
        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          <Link to={`/projects/${project.id}`}>{project.title}</Link>
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{project.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tech.slice(0, 4).map(t => (
            <Badge key={t} variant="secondary" className="text-xs bg-muted text-muted-foreground border-0">{t}</Badge>
          ))}
          {project.tech.length > 4 && (
            <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground border-0">+{project.tech.length - 4}</Badge>
          )}
        </div>
        {project.links.github && (
          <a href={project.links.github} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-primary hover:underline">
            <Github className="w-4 h-4 mr-1.5" /> View on GitHub
          </a>
        )}
      </CardContent>
    </Card>
  );
}
