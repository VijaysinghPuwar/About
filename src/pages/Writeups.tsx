import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import writeupsData from '@/data/writeups.json';

export default function Writeups() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(writeupsData.map((w: any) => w.category).filter(Boolean));
    return Array.from(cats).sort();
  }, []);

  const filtered = useMemo(() => {
    return writeupsData.filter((w: any) => {
      const matchSearch = !search ||
        w.title?.toLowerCase().includes(search.toLowerCase()) ||
        w.summary?.toLowerCase().includes(search.toLowerCase()) ||
        w.description?.toLowerCase().includes(search.toLowerCase());
      const matchCat = !selectedCategory || w.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [search, selectedCategory]);

  return (
    <div className="min-h-screen py-20">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="section-heading">Research</p>
          <h1 className="section-title mb-4">Writeups & Labs</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Technical writeups, lab exercises, and security case studies.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search writeups..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card border-border/40" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant={selectedCategory === null ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(null)}>All</Button>
            {categories.map(cat => (
              <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)}>{cat}</Button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((writeup: any, i: number) => (
            <motion.div key={writeup.id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="h-full border-border/40 bg-card hover:border-primary/20 transition-colors">
                <CardContent className="pt-6">
                  <Badge variant="outline" className="text-xs mb-3 text-primary border-primary/20">{writeup.category}</Badge>
                  <h3 className="font-semibold text-foreground mb-2">{writeup.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{writeup.summary || writeup.description}</p>
                  {writeup.tags && (
                    <div className="flex flex-wrap gap-1.5">
                      {writeup.tags.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-muted text-muted-foreground border-0">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">No writeups found.</div>
        )}
      </div>
    </div>
  );
}
