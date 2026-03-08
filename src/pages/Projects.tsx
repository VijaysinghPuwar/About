import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProjectCard } from '@/components/ProjectCard';
import { useProjects } from '@/hooks/useProjects';
import projectsData from '@/data/projects.json';

export default function Projects() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { projects: dbProjects, loading } = useProjects();

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
            <Input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card border-border/40" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant={selectedCategory === null ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(null)}>All</Button>
            {categories.map(cat => (
              <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)}>{cat}</Button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project, i) => (
            <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <ProjectCard project={project} />
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
