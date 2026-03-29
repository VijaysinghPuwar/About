import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Github, ExternalLink, FileText, Tag, CheckCircle2, Loader2, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useProject } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import projectsData from '@/data/projects.json';

interface JSONProject {
  id: string; title: string; description: string; category: string; tech: string[];
  year: string; status: string; featured: boolean; keyResults: string[];
  links: { github: string | null; writeup: string | null; demo: string | null };
  image: string; tags: string[];
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { project: dbProject, loading } = useProject(id);
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="glass-card rounded-lg max-w-lg w-full mx-4 p-8 text-center">
          <Lock className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="font-semibold text-foreground text-xl mb-2">Portfolio Access Required</h2>
          <p className="text-sm text-muted-foreground mb-6">Sign in with Google to view project details.</p>
          <Link to="/login" className="inline-flex items-center justify-center h-10 px-6 rounded-md text-sm font-medium gradient-btn">
            Sign In with Google
          </Link>
        </div>
      </div>
    );
  }

  const jsonProject = projectsData.find((p: JSONProject) => p.id === id) as JSONProject | undefined;

  const project = dbProject ? {
    id: dbProject.id, title: dbProject.title, description: dbProject.description || '',
    category: dbProject.category || '', tech: dbProject.tech || [], year: dbProject.year || '',
    status: dbProject.status || 'completed', featured: dbProject.featured || false,
    keyResults: dbProject.key_results || [],
    links: { github: dbProject.github_link, writeup: dbProject.writeup_link, demo: dbProject.demo_link },
    tags: dbProject.tags || [],
  } : jsonProject || null;

  const relatedProjects = projectsData
    .filter((p: JSONProject) => p.id !== id && p.category === project?.category)
    .slice(0, 3);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!project) return <Navigate to="/projects" replace />;

  return (
    <div className="min-h-screen py-20">
      <div className="container max-w-4xl mx-auto">
        <Link to="/projects" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Badge variant="outline" className="text-primary border-primary/20">{project.category}</Badge>
            <span className="text-sm text-muted-foreground">{project.year}</span>
            {project.featured && <span className="text-xs px-2 py-0.5 rounded-full gradient-btn">Featured</span>}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{project.title}</h1>
          <p className="text-lg text-muted-foreground mb-6">{project.description}</p>

          <div className="flex flex-wrap gap-3 mb-8">
            {project.links.github && (
              <a href={project.links.github} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-10 px-6 rounded-md text-sm font-medium gradient-btn">
                <Github className="w-4 h-4 mr-2" /> View Source
              </a>
            )}
            {project.links.demo && (
              <a href={project.links.demo} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-10 px-6 rounded-md text-sm font-medium glass-card hover:border-primary/30 transition-colors">
                <ExternalLink className="w-4 h-4 mr-2" /> Demo
              </a>
            )}
            {project.links.writeup && (
              <Link to={project.links.writeup}
                className="inline-flex items-center justify-center h-10 px-6 rounded-md text-sm font-medium glass-card hover:border-primary/30 transition-colors">
                <FileText className="w-4 h-4 mr-2" /> Writeup
              </Link>
            )}
          </div>

          {project.keyResults.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Key Results</h2>
              <div className="space-y-3">
                {project.keyResults.map((result, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg glass-card">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{result}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Technologies</h2>
            <div className="flex flex-wrap gap-2">
              {project.tech.map(t => (
                <span key={t} className="text-sm px-3 py-1 rounded-full glass-card text-muted-foreground">{t}</span>
              ))}
            </div>
          </section>

          {project.tags.length > 0 && (
            <section className="mb-12">
              <h3 className="text-lg font-semibold text-foreground mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md glass-card text-muted-foreground">
                    <Tag className="w-3 h-3" />{tag}
                  </span>
                ))}
              </div>
            </section>
          )}
        </motion.div>

        {relatedProjects.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-foreground mb-6">Related Projects</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {relatedProjects.map(rp => (
                <Link key={rp.id} to={`/projects/${rp.id}`}>
                  <div className="glass-card rounded-lg p-4 hover:border-primary/20 transition-colors h-full">
                    <Badge variant="outline" className="text-xs text-primary border-primary/20 mb-2">{rp.category}</Badge>
                    <h3 className="font-semibold text-foreground mb-1 text-sm hover:text-primary transition-colors">{rp.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{rp.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
