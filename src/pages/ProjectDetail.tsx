import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Github, ExternalLink, FileText, Tag, CheckCircle2, Zap, Shield, Cloud, Network, Code, Terminal, Lock, LogIn, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useProject, Project } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { AccessBadge } from '@/components/AccessBadge';
import projectsData from '@/data/projects.json';

// Fallback interface for JSON data
interface JSONProject {
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

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { project: dbProject, loading, error } = useProject(id);
  const { user, isAdmin } = useAuth();
  
  // Fallback to JSON data if database is empty
  const jsonProject = projectsData.find((p: JSONProject) => p.id === id) as JSONProject | undefined;
  
  // Normalize project data
  const project = dbProject ? {
    id: dbProject.id,
    title: dbProject.title,
    description: dbProject.description || '',
    category: dbProject.category || '',
    tech: dbProject.tech,
    year: dbProject.year || '',
    status: dbProject.status || 'completed',
    featured: dbProject.featured || false,
    keyResults: dbProject.key_results,
    links: {
      github: dbProject.github_link,
      writeup: dbProject.writeup_link,
      demo: dbProject.demo_link,
    },
    image: dbProject.image || '',
    tags: dbProject.tags,
    access_level: dbProject.access_level,
  } : jsonProject ? {
    ...jsonProject,
    access_level: 'public' as const,
  } : null;

  // Get related projects from JSON for now
  const relatedProjects = projectsData
    .filter((p: JSONProject) => p.id !== id && p.category === project?.category)
    .slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  // Check access for protected projects
  const accessLevel = project.access_level || 'public';
  const hasAccess = accessLevel === 'public' || 
    (accessLevel === 'basic' && user) || 
    (accessLevel === 'admin' && isAdmin);

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 cyber-grid opacity-20" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-2xl bg-warning/10 border border-warning/20 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-warning" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Restricted</h1>
          <p className="text-muted-foreground mb-6">
            {accessLevel === 'admin' 
              ? 'This solution is only available to administrators.'
              : 'You need to sign in to view this solution.'}
          </p>
          <AccessBadge level={accessLevel} className="mb-6" />
          <div className="flex flex-col gap-3">
            {!user && (
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link to="/auth">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In to View
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link to="/projects">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Solutions
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(project.category);
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 cyber-grid opacity-20" />
        
        <div className="container relative">
          {/* Back navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Button
              variant="ghost"
              asChild
              className="mb-8 hover:bg-muted/50 group"
            >
              <Link to="/projects">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Solutions
              </Link>
            </Button>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                  <CategoryIcon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">{project.category}</span>
                </div>
                <span className="text-sm text-muted-foreground">{project.year}</span>
                {project.featured && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-secondary/20 text-secondary border border-secondary/30">
                    Featured
                  </span>
                )}
                {accessLevel !== 'public' && (
                  <AccessBadge level={accessLevel} />
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                {project.title}
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {project.description}
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                {project.links.github && (
                  <Button
                    size="lg"
                    asChild
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-cyan"
                  >
                    <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                      <Github className="w-5 h-5 mr-2" />
                      View Source Code
                    </a>
                  </Button>
                )}
                {project.links.demo && (
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="border-border hover:border-primary/50"
                  >
                    <a href={project.links.demo} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Live Demo
                    </a>
                  </Button>
                )}
                {project.links.writeup && (
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="border-border hover:border-secondary/50"
                  >
                    <Link to={project.links.writeup}>
                      <FileText className="w-5 h-5 mr-2" />
                      Read Writeup
                    </Link>
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden border border-border/50 bg-gradient-to-br from-card via-card/80 to-card/50">
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
                  <div className="absolute inset-0 cyber-grid opacity-30" />
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="w-40 h-40 md:w-48 md:h-48 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center backdrop-blur-sm">
                        <CategoryIcon className="w-20 h-20 md:w-24 md:h-24 text-primary/60" />
                      </div>
                      <div className="absolute -top-6 -right-6 w-12 h-12 rounded-xl bg-secondary/20 border border-secondary/30 animate-pulse" />
                      <div className="absolute -bottom-6 -left-6 w-10 h-10 rounded-full bg-primary/30 border border-primary/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
                      <div className="absolute top-1/2 -right-12 w-6 h-6 rounded bg-success/30 border border-success/40 animate-pulse" style={{ animationDelay: '1s' }} />
                    </div>
                  </div>
                </div>

                {/* Status badge */}
                <div className="absolute top-4 right-4">
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm",
                    project.status === 'completed' 
                      ? "bg-success/20 text-success border border-success/30"
                      : "bg-warning/20 text-warning border border-warning/30"
                  )}>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      project.status === 'completed' ? "bg-success" : "bg-warning"
                    )} />
                    <span className="text-sm capitalize">{project.status}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-transparent via-card/30 to-transparent">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Key Results */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-foreground">Key Results & Features</h2>
                <div className="grid gap-4">
                  {project.keyResults.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-foreground/90 leading-relaxed">{result}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Technology Stack */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-foreground">Technology Stack</h2>
                <div className="flex flex-wrap gap-3">
                  {project.tech.map((tech, index) => (
                    <motion.span
                      key={tech}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="px-4 py-2 text-sm font-mono rounded-lg bg-muted/50 text-foreground border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-colors"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              {/* Tags */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-foreground">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-muted/30 text-muted-foreground border border-border/30"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
              >
                <div className="p-6 border-b border-border/50">
                  <h3 className="text-lg font-semibold text-foreground">Solution Details</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium text-foreground">{project.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Year</span>
                    <span className="font-mono text-foreground">{project.year}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className={cn(
                      "flex items-center gap-2 capitalize",
                      project.status === 'completed' ? "text-success" : "text-warning"
                    )}>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        project.status === 'completed' ? "bg-success" : "bg-warning"
                      )} />
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Technologies</span>
                    <span className="font-medium text-foreground">{project.tech.length} tools</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Access</span>
                    <AccessBadge level={accessLevel} />
                  </div>
                </div>
              </motion.div>

              {/* Actions Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
              >
                <div className="p-6 border-b border-border/50">
                  <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
                </div>
                <div className="p-6 space-y-3">
                  {project.links.github && (
                    <Button
                      variant="outline"
                      asChild
                      className="w-full justify-start border-border/50 hover:border-primary/50 hover:bg-primary/5"
                    >
                      <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4 mr-3" />
                        View on GitHub
                      </a>
                    </Button>
                  )}
                  {project.links.demo && (
                    <Button
                      variant="outline"
                      asChild
                      className="w-full justify-start border-border/50 hover:border-secondary/50 hover:bg-secondary/5"
                    >
                      <a href={project.links.demo} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-3" />
                        Live Demo
                      </a>
                    </Button>
                  )}
                  {project.links.writeup && (
                    <Button
                      variant="outline"
                      asChild
                      className="w-full justify-start border-border/50 hover:border-secondary/50 hover:bg-secondary/5"
                    >
                      <Link to={project.links.writeup}>
                        <FileText className="w-4 h-4 mr-3" />
                        Read Writeup
                      </Link>
                    </Button>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Solutions */}
      {relatedProjects.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="text-primary font-medium text-sm uppercase tracking-wider">Related</span>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-2">
                Similar Solutions
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {relatedProjects.map((related, index) => {
                const RelatedIcon = getCategoryIcon(related.category);
                return (
                  <motion.div
                    key={related.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link 
                      to={`/projects/${related.id}`}
                      className="block group"
                    >
                      <div className="rounded-2xl border border-border/50 bg-card/50 p-6 transition-all duration-300 hover:border-primary/30 hover:bg-card/80 hover:-translate-y-1 hover:shadow-cyber">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <RelatedIcon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">{related.category}</span>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {related.title}
                            </h3>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {related.description}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Interested in this solution?
            </h2>
            <p className="text-muted-foreground mb-8">
              Let's discuss how it can be adapted for your security needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-primary hover:bg-primary/90 shadow-glow-cyan">
                <Link to="/contact">Get in Touch</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/projects">View All Solutions</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
