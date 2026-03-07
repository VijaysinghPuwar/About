import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Github, ExternalLink, FileText, Tag, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useProject } from '@/hooks/useProjects';
import projectsData from '@/data/projects.json';

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
  links: { github: string | null; writeup: string | null; demo: string | null };
  image: string;
  tags: string[];
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { project: dbProject, loading } = useProject(id);

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
        <Button variant="ghost" asChild className="mb-8">
          <Link to="/projects"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects</Link>
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Badge variant="outline" className="text-primary border-primary/20">{project.category}</Badge>
            <span className="text-sm text-muted-foreground">{project.year}</span>
            {project.featured && <Badge variant="outline" className="text-warning border-warning/20">Featured</Badge>}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{project.title}</h1>
          <p className="text-lg text-muted-foreground mb-6">{project.description}</p>

          <div className="flex flex-wrap gap-3 mb-8">
            {project.links.github && (
              <Button asChild><a href={project.links.github} target="_blank" rel="noopener noreferrer"><Github className="w-4 h-4 mr-2" /> View Source</a></Button>
            )}
            {project.links.demo && (
              <Button variant="outline" asChild><a href={project.links.demo} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4 mr-2" /> Demo</a></Button>
            )}
            {project.links.writeup && (
              <Button variant="outline" asChild><Link to={project.links.writeup}><FileText className="w-4 h-4 mr-2" /> Writeup</Link></Button>
            )}
          </div>

          {/* Key Results */}
          {project.keyResults.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Key Results</h2>
              <div className="space-y-3">
                {project.keyResults.map((result, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border/40">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{result}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tech */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Technologies</h2>
            <div className="flex flex-wrap gap-2">
              {project.tech.map(t => (
                <Badge key={t} variant="secondary" className="bg-muted text-muted-foreground border-0">{t}</Badge>
              ))}
            </div>
          </section>

          {/* Tags */}
          {project.tags.length > 0 && (
            <section className="mb-12">
              <h3 className="text-lg font-semibold text-foreground mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-muted/50 text-muted-foreground">
                    <Tag className="w-3 h-3" />{tag}
                  </span>
                ))}
              </div>
            </section>
          )}
        </motion.div>

        {/* Related */}
        {relatedProjects.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-foreground mb-6">Related Projects</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {relatedProjects.map((rp) => (
                <Link key={rp.id} to={`/projects/${rp.id}`}>
                  <Card className="border-border/40 bg-card hover:border-primary/20 transition-colors h-full">
                    <CardContent className="pt-4">
                      <Badge variant="outline" className="text-xs text-primary border-primary/20 mb-2">{rp.category}</Badge>
                      <h3 className="font-semibold text-foreground mb-1 text-sm hover:text-primary transition-colors">{rp.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{rp.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
