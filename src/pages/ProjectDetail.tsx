import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Github, ExternalLink, FileText, Star, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TechBadge } from '@/components/TechBadge';
import { cn } from '@/lib/utils';
import projectsData from '@/data/projects.json';

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

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const project = projectsData.find((p: Project) => p.id === id) as Project | undefined;

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  const isRedTeam = project.category.toLowerCase().includes('red team');
  
  return (
    <div className={cn(
      "min-h-screen transition-all duration-300",
      isRedTeam ? "bg-gradient-to-br from-red-team-muted/20 via-background to-background" : ""
    )}>
      {/* Navigation */}
      <div className="container mx-auto px-6 py-8">
        <Button
          variant="ghost"
          asChild
          className={cn(
            "mb-8 hover:bg-muted/50",
            isRedTeam ? "text-red-team-primary hover:text-red-team-accent hover:bg-red-team-muted/30" : ""
          )}
        >
          <Link to="/projects">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 flex-wrap">
                <TechBadge 
                  tech={project.category} 
                  variant="category" 
                  className={isRedTeam ? "border-red-team-border bg-red-team-muted text-red-team-accent" : ""}
                />
                <TechBadge tech={project.year} variant="year" />
                {project.featured && (
                  <TechBadge tech="Featured" variant="featured" />
                )}
              </div>
              
              <h1 className={cn(
                "text-4xl font-bold tracking-tight",
                isRedTeam ? "text-red-team-primary" : "text-foreground"
              )}>
                {project.title}
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Project Image Placeholder */}
            <Card className={cn(
              "overflow-hidden border-border/50",
              isRedTeam ? "border-red-team-border bg-red-team-muted/10" : ""
            )}>
              <div className="aspect-video w-full bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/5 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={cn(
                    "text-8xl font-mono opacity-20",
                    isRedTeam ? "text-red-team-primary" : "text-primary"
                  )}>
                    {project.category}
                  </div>
                </div>
                {isRedTeam && (
                  <div className="absolute inset-0 bg-red-team-primary/5" />
                )}
              </div>
            </Card>

            {/* Key Results */}
            <Card className={cn(
              "border-border/50",
              isRedTeam ? "border-red-team-border bg-red-team-muted/10" : ""
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  "flex items-center gap-2",
                  isRedTeam ? "text-red-team-primary" : ""
                )}>
                  <Star className="w-5 h-5" />
                  Key Results & Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {project.keyResults.map((result, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Star className={cn(
                        "w-4 h-4 mt-0.5 flex-shrink-0",
                        isRedTeam ? "text-red-team-accent" : "text-primary"
                      )} />
                      <span className="text-muted-foreground">{result}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Technology Deep Dive */}
            <Card className={cn(
              "border-border/50",
              isRedTeam ? "border-red-team-border bg-red-team-muted/10" : ""
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  isRedTeam ? "text-red-team-primary" : ""
                )}>
                  Technology Stack & Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <TechBadge 
                      key={tech} 
                      tech={tech} 
                      variant="tech"
                      className={isRedTeam ? "border-red-team-border bg-red-team-muted text-red-team-accent" : ""}
                    />
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <div
                      key={tag}
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border",
                        isRedTeam 
                          ? "border-red-team-border/30 bg-red-team-muted/20 text-red-team-accent" 
                          : "border-muted-foreground/20 bg-muted/20 text-muted-foreground"
                      )}
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <Card className={cn(
              "border-border/50",
              isRedTeam ? "border-red-team-border bg-red-team-muted/10" : ""
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  "text-lg",
                  isRedTeam ? "text-red-team-primary" : ""
                )}>
                  Project Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Year:</span>
                  <span className="font-mono">{project.year}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    project.status === 'completed' 
                      ? (isRedTeam ? "bg-red-team-accent" : "bg-success")
                      : "bg-warning"
                  )} />
                  <span className="text-muted-foreground">Status:</span>
                  <span className="capitalize">{project.status}</span>
                </div>
              </CardContent>
            </Card>

            {/* Action Links */}
            <Card className={cn(
              "border-border/50",
              isRedTeam ? "border-red-team-border bg-red-team-muted/10" : ""
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  "text-lg",
                  isRedTeam ? "text-red-team-primary" : ""
                )}>
                  Project Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.links.github && (
                  <Button
                    variant="outline"
                    asChild
                    className={cn(
                      "w-full justify-start",
                      isRedTeam 
                        ? "border-red-team-border hover:bg-red-team-muted/30 hover:text-red-team-accent hover:border-red-team-accent" 
                        : "border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                    )}
                  >
                    <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                      <Github className="w-4 h-4 mr-2" />
                      View Source Code
                    </a>
                  </Button>
                )}
                
                {project.links.writeup && (
                  <Button
                    variant="outline"
                    asChild
                    className={cn(
                      "w-full justify-start",
                      isRedTeam 
                        ? "border-red-team-border hover:bg-red-team-muted/30 hover:text-red-team-accent hover:border-red-team-accent" 
                        : "border-secondary/20 hover:border-secondary/40 hover:bg-secondary/5"
                    )}
                  >
                    <Link to={project.links.writeup}>
                      <FileText className="w-4 h-4 mr-2" />
                      Read Technical Writeup
                    </Link>
                  </Button>
                )}
                
                {project.links.demo && (
                  <Button
                    asChild
                    className={cn(
                      "w-full justify-start",
                      isRedTeam 
                        ? "bg-red-team-primary hover:bg-red-team-accent shadow-[0_0_20px] shadow-red-team-glow/20" 
                        : "bg-primary hover:bg-primary/90 shadow-glow-cyan"
                    )}
                  >
                    <a href={project.links.demo} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Live Demo
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}