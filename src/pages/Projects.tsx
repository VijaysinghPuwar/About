import { useState } from 'react';
import { ProjectCard } from '@/components/ProjectCard';
import { TechBadge } from '@/components/TechBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import projectsData from '@/data/projects.json';

const categories = ['All', 'Blue Team', 'Red Team', 'Cloud', 'Automation', 'OSINT', 'Network Security'];
const techFilters = ['PowerShell', 'Python', 'Splunk', 'Burp Suite', 'AWS', 'Docker'];

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTech, setSelectedTech] = useState<string[]>([]);

  const filteredProjects = projectsData.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
    
    const matchesTech = selectedTech.length === 0 || selectedTech.some(tech => 
      project.tech.includes(tech)
    );

    return matchesSearch && matchesCategory && matchesTech;
  });

  const featuredProjects = filteredProjects.filter(p => p.featured);
  const regularProjects = filteredProjects.filter(p => !p.featured);

  const toggleTechFilter = (tech: string) => {
    setSelectedTech(prev => 
      prev.includes(tech) 
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    );
  };

  return (
    <div className="container py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
          Security Labs & Projects
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Hands-on cybersecurity projects, automation scripts, and security research. 
          Each project includes source code, documentation, and key findings.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-6 animate-fade-in">
        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card/50 border-border/50 focus:border-primary/30"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={
                selectedCategory === category
                  ? "bg-primary text-primary-foreground shadow-glow-cyan"
                  : "border-border/50 hover:border-primary/30 hover:bg-primary/5"
              }
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Tech Filters */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span>Filter by technology:</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {techFilters.map((tech) => (
              <div
                key={tech}
                onClick={() => toggleTechFilter(tech)}
                className={`cursor-pointer transition-all ${
                  selectedTech.includes(tech) 
                    ? "ring-2 ring-primary/30" 
                    : "hover:scale-105"
                }`}
              >
                <TechBadge
                  tech={tech}
                  variant={selectedTech.includes(tech) ? "tech" : "category"}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-center text-muted-foreground">
        {filteredProjects.length === 0 ? (
          <p>No projects found matching your criteria.</p>
        ) : (
          <p>
            Showing {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            {selectedTech.length > 0 && ` using ${selectedTech.join(', ')}`}
          </p>
        )}
      </div>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Featured Projects</h2>
            <p className="text-muted-foreground">Highlighted security labs and research</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project, index) => (
              <div 
                key={project.id} 
                className="animate-fade-in" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Projects */}
      {regularProjects.length > 0 && (
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">All Projects</h2>
            <p className="text-muted-foreground">Complete portfolio of security work</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularProjects.map((project, index) => (
              <div 
                key={project.id} 
                className="animate-fade-in" 
                style={{ animationDelay: `${(featuredProjects.length + index) * 0.1}s` }}
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}