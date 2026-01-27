import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ServiceCard } from '@/components/ServiceCard';
import { FeaturedService } from '@/components/FeaturedService';
import { AccessBadge } from '@/components/AccessBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Zap, Shield, Cloud, Network, Code, Terminal, ChevronDown, Loader2, Lock, LogIn } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import projectsData from '@/data/projects.json';

const categories = [
  { id: 'all', label: 'All Solutions', icon: Shield },
  { id: 'automation', label: 'Automation', icon: Zap },
  { id: 'cloud-security', label: 'Cloud Security', icon: Cloud },
  { id: 'network-security', label: 'Network Security', icon: Network },
  { id: 'application', label: 'Applications', icon: Code },
  { id: 'research', label: 'Research', icon: Terminal },
];

// Transform JSON data to match database structure for fallback
const fallbackProjects = projectsData.map(p => ({
  id: p.id,
  title: p.title,
  description: p.description,
  category: p.category,
  tech: p.tech,
  year: p.year,
  status: p.status,
  featured: p.featured,
  key_results: p.keyResults,
  github_link: p.links.github,
  writeup_link: p.links.writeup,
  demo_link: p.links.demo,
  image: p.image,
  tags: p.tags,
  access_level: 'public' as const,
  created_at: '',
  updated_at: '',
}));

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAll, setShowAll] = useState(false);
  const { projects: dbProjects, loading, error } = useProjects();
  const { user } = useAuth();

  // Use database projects if available, otherwise fallback to JSON
  const allProjects = dbProjects.length > 0 ? dbProjects : fallbackProjects;

  const filteredProjects = allProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesCategory = selectedCategory === 'all';
    if (selectedCategory === 'automation') matchesCategory = (project.category || '').toLowerCase() === 'automation';
    if (selectedCategory === 'cloud-security') matchesCategory = (project.category || '').toLowerCase().includes('cloud');
    if (selectedCategory === 'network-security') matchesCategory = (project.category || '').toLowerCase().includes('network');
    if (selectedCategory === 'application') matchesCategory = (project.category || '').toLowerCase().includes('application');
    if (selectedCategory === 'research') matchesCategory = (project.category || '').toLowerCase() === 'research' || (project.category || '').toLowerCase().includes('low-level');

    return matchesSearch && matchesCategory;
  });

  const featuredProjects = filteredProjects.filter(p => p.featured);
  const regularProjects = filteredProjects.filter(p => !p.featured);
  const displayedProjects = showAll ? regularProjects : regularProjects.slice(0, 6);

  // Transform for component compatibility
  const transformForComponent = (project: typeof allProjects[0]) => ({
    id: project.id,
    title: project.title,
    description: project.description || '',
    category: project.category || '',
    tech: project.tech,
    year: project.year || '',
    status: project.status || 'completed',
    featured: project.featured || false,
    keyResults: project.key_results,
    links: {
      github: project.github_link,
      writeup: project.writeup_link,
      demo: project.demo_link,
    },
    image: project.image || '',
    tags: project.tags,
    access_level: project.access_level,
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 cyber-grid opacity-20" />
        
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Shield className="w-4 h-4" />
              Security Solutions & Tools
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              <span className="text-foreground">Security</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Solutions & Labs
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Enterprise-grade security automation, cloud infrastructure protection, 
              and network security solutions built with modern tools and best practices.
            </p>

            {/* Login prompt for protected content */}
            {!user && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-warning/10 border border-warning/20"
              >
                <Lock className="w-5 h-5 text-warning" />
                <span className="text-sm text-warning">
                  Some solutions require authentication to view
                </span>
                <Button size="sm" variant="outline" asChild className="border-warning/30 hover:bg-warning/10">
                  <Link to="/auth">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
              </motion.div>
            )}

            {/* Search */}
            <div className="max-w-md mx-auto pt-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search solutions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-card/50 border-border/50 focus:border-primary/50 rounded-xl text-base"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-y border-border/30 bg-card/30 backdrop-blur-sm sticky top-16 z-40">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <Button
                  key={category.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={
                    isActive
                      ? "bg-primary text-primary-foreground shadow-glow-cyan"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <section className="py-24">
          <div className="container flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </section>
      )}

      {/* Stats Bar */}
      {!loading && (
        <section className="py-12 border-b border-border/30">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {[
                { label: 'Total Solutions', value: allProjects.length, icon: Shield },
                { label: 'Featured', value: allProjects.filter(p => p.featured).length, icon: Zap },
                { label: 'Technologies', value: '15+', icon: Code },
                { label: 'Categories', value: '5', icon: Network },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-3">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Solutions */}
      {!loading && featuredProjects.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12 md:mb-16"
            >
              <span className="text-primary font-medium text-sm uppercase tracking-wider">Featured</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
                Flagship Solutions
              </h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                Comprehensive security tools and automation frameworks designed for real-world deployment
              </p>
            </motion.div>

            <div className="space-y-16 md:space-y-24">
              {featuredProjects.map((project, index) => (
                <div key={project.id} className="relative">
                  {project.access_level !== 'public' && (
                    <div className="absolute top-4 right-4 z-10">
                      <AccessBadge level={project.access_level} />
                    </div>
                  )}
                  <FeaturedService 
                    project={transformForComponent(project)} 
                    index={index}
                    reversed={index % 2 === 1}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Solutions Grid */}
      {!loading && regularProjects.length > 0 && (
        <section className="py-16 md:py-24 bg-gradient-to-b from-transparent via-card/30 to-transparent">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="text-secondary font-medium text-sm uppercase tracking-wider">Complete Portfolio</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
                All Solutions
              </h2>
              <p className="text-muted-foreground mt-4">
                {filteredProjects.length} solution{filteredProjects.length !== 1 ? 's' : ''} available
                {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.label}`}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {displayedProjects.map((project, index) => (
                <div key={project.id} className="relative">
                  {project.access_level !== 'public' && (
                    <div className="absolute top-4 right-4 z-10">
                      <AccessBadge level={project.access_level} showLabel={false} />
                    </div>
                  )}
                  <ServiceCard 
                    project={transformForComponent(project)} 
                    index={index}
                  />
                </div>
              ))}
            </div>

            {/* Show More Button */}
            {regularProjects.length > 6 && !showAll && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mt-12"
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowAll(true)}
                  className="border-border hover:border-primary/50 hover:bg-primary/5"
                >
                  View All Solutions
                  <ChevronDown className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!loading && filteredProjects.length === 0 && (
        <section className="py-24">
          <div className="container">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No solutions found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filter criteria
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl border border-border/50 bg-gradient-to-br from-card via-card/80 to-card/50 p-8 md:p-12 lg:p-16 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
            <div className="absolute inset-0 cyber-grid opacity-10" />
            
            <div className="relative text-center max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Looking for Custom Security Solutions?
              </h2>
              <p className="text-muted-foreground mb-8">
                Let's discuss how I can help secure your infrastructure with tailored automation and security tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="bg-primary hover:bg-primary/90 shadow-glow-cyan">
                  <a href="/contact">Get in Touch</a>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-border hover:border-primary/50">
                  <a href="/resume">View Resume</a>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
