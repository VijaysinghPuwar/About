import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Lock, Github } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import projectsData from '@/data/projects.json';

export default function Projects() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { projects: dbProjects, loading } = useProjects();
  const { user } = useAuth();

  const allProjects = useMemo(() => {
    const dbIds = new Set((dbProjects || []).map(p => p.id));
    const normalized = (dbProjects || []).map(p => ({
      id: p.id, title: p.title, description: p.description || '', category: p.category || '',
      tech: p.tech || [], year: p.year || '', status: p.status || 'completed',
      featured: p.featured || false, keyResults: p.key_results || [],
      links: { github: p.github_link, writeup: p.writeup_link, demo: p.demo_link },
      image: p.image || '', tags: p.tags || [],
    }));
    const jsonOnly = projectsData.filter(p => !dbIds.has(p.id));
    return [...normalized, ...jsonOnly];
  }, [dbProjects]);

  const categories = useMemo(() => {
    const cats = new Set(allProjects.map(p => p.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [allProjects]);

  const filtered = useMemo(() => {
    return allProjects.filter(p => {
      const matchSearch = !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.tech.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchCat = !selectedCategory || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [allProjects, search, selectedCategory]);

  if (!user) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="glass-card rounded-lg max-w-lg w-full mx-4 p-8 text-center">
          <Lock className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="font-semibold text-foreground text-xl mb-2">Portfolio Access Required</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Sign in with Google to access the full project portfolio, GitHub repositories, and detailed project breakdowns.
          </p>
          <Link to="/login" className="inline-flex items-center justify-center h-10 px-6 rounded-md text-sm font-medium gradient-btn">
            Sign In with Google
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="section-heading">Portfolio</p>
          <h1 className="section-title mb-4">Projects</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Security automation, cloud security, network defense, and research projects.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-background/50 border-border/40 focus:border-primary/60" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                selectedCategory === null ? 'gradient-btn' : 'glass-card text-muted-foreground hover:text-foreground'
              }`}
            >All</button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  selectedCategory === cat ? 'gradient-btn' : 'glass-card text-muted-foreground hover:text-foreground'
                }`}
              >{cat}</button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project, i) => (
            <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="h-full rounded-lg glass-card hover:border-primary/20 transition-all group flex flex-col">
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs text-primary border-primary/20">{project.category}</Badge>
                    <span className="text-xs text-muted-foreground">{project.year}</span>
                    {project.featured && (
                      <span className="text-xs px-2 py-0.5 rounded-full gradient-btn">Featured</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    <Link to={`/projects/${project.id}`}>{project.title}</Link>
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{project.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.tech.slice(0, 4).map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full glass-card text-muted-foreground">{t}</span>
                    ))}
                    {project.tech.length > 4 && (
                      <span className="text-xs px-2 py-0.5 rounded-full glass-card text-muted-foreground">+{project.tech.length - 4}</span>
                    )}
                  </div>
                  {project.links.github && (
                    <a href={project.links.github} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-primary hover:underline">
                      <Github className="w-4 h-4 mr-1.5" /> View on GitHub
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">No projects found matching your criteria.</div>
        )}
      </div>
    </div>
  );
}
