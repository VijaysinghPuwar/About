import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TechBadge } from '@/components/TechBadge';
import { Search, Calendar, Clock, ArrowRight, Star } from 'lucide-react';
import writeupsData from '@/data/writeups.json';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
});

const formatWriteupDate = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : dateFormatter.format(parsed);
};

const categories = ['All', 'Blue Team', 'Red Team', 'CTF', 'OSINT', 'SIEM'];

export default function Writeups() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredWriteups = writeupsData.filter(writeup => {
    const matchesSearch = writeup.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      writeup.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      writeup.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || writeup.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const featuredWriteups = filteredWriteups.filter(w => w.featured);
  const regularWriteups = filteredWriteups.filter(w => !w.featured);

  return (
    <div className="container py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
          Security Writeups
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          In-depth analysis of CTF challenges, incident response cases, detection engineering, 
          and cybersecurity research with practical insights and methodologies.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-6 animate-fade-in">
        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search writeups..."
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
      </div>

      {/* Results Summary */}
      <div className="text-center text-muted-foreground">
        {filteredWriteups.length === 0 ? (
          <p>No writeups found matching your criteria.</p>
        ) : (
          <p>
            Showing {filteredWriteups.length} writeup{filteredWriteups.length !== 1 ? 's' : ''}
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </p>
        )}
      </div>

      {/* Featured Writeups */}
      {featuredWriteups.length > 0 && (
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Featured Writeups</h2>
            <p className="text-muted-foreground">In-depth security analysis and research</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredWriteups.map((writeup, index) => (
              <Card 
                key={writeup.id}
                className="group relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card-elevated hover:shadow-cyber cyber-hover animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {writeup.featured && (
                  <div className="absolute top-4 right-4 z-10">
                    <TechBadge tech="Featured" variant="featured" />
                  </div>
                )}

                <div className="aspect-video w-full bg-gradient-to-br from-secondary/10 via-primary/5 to-secondary/5 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-4xl text-primary/20 font-mono">{writeup.category}</div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <TechBadge tech={writeup.category} variant="category" />
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {writeup.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground line-clamp-3">
                    {writeup.summary}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Meta info */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatWriteupDate(writeup.date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {writeup.readingTime}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {writeup.tags.slice(0, 4).map((tag) => (
                      <TechBadge key={tag} tech={tag} variant="tech" />
                    ))}
                    {writeup.tags.length > 4 && (
                      <TechBadge tech={`+${writeup.tags.length - 4}`} variant="tech" />
                    )}
                  </div>

                  {/* Read More Button */}
                  <Button
                    asChild
                    className="w-full bg-primary hover:bg-primary/90 shadow-glow-cyan"
                  >
                    <Link to={`/writeups/${writeup.slug}`}>
                      Read Writeup
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* All Writeups */}
      {regularWriteups.length > 0 && (
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">All Writeups</h2>
            <p className="text-muted-foreground">Complete collection of security analysis</p>
          </div>
          <div className="space-y-6">
            {regularWriteups.map((writeup, index) => (
              <Card 
                key={writeup.id}
                className="group overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card-elevated hover:shadow-cyber animate-fade-in"
                style={{ animationDelay: `${(featuredWriteups.length + index) * 0.1}s` }}
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-48 aspect-video md:aspect-square bg-gradient-to-br from-secondary/10 via-primary/5 to-secondary/5 relative overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-2xl text-primary/20 font-mono">{writeup.category}</div>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-6">
                    <div className="flex flex-col h-full">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {writeup.title}
                          </h3>
                          <TechBadge tech={writeup.category} variant="category" />
                        </div>
                        
                        <p className="text-muted-foreground line-clamp-2">
                          {writeup.summary}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatWriteupDate(writeup.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {writeup.readingTime}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {writeup.tags.slice(0, 3).map((tag) => (
                            <TechBadge key={tag} tech={tag} variant="tech" />
                          ))}
                          {writeup.tags.length > 3 && (
                            <TechBadge tech={`+${writeup.tags.length - 3}`} variant="tech" />
                          )}
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button
                          variant="outline"
                          asChild
                          className="border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                        >
                          <Link to={`/writeups/${writeup.slug}`}>
                            Read More
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}