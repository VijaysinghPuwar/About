import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Project {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  tech: string[];
  year: string | null;
  status: string | null;
  featured: boolean | null;
  key_results: string[];
  github_link: string | null;
  writeup_link: string | null;
  demo_link: string | null;
  image: string | null;
  tags: string[];
  access_level: 'public' | 'basic' | 'admin';
  created_at: string;
  updated_at: string;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProjects(data as Project[] || []);
      setError(null);
    } catch (err) {
      const e = err as { code?: string; message?: string } | null;
      // Backend not provisioned with projects table — fall back silently to
      // static data merged in Index.tsx. No console noise, no error state.
      if (e && (e.code === 'PGRST205' || /schema cache/i.test(e.message || ''))) {
        setProjects([]);
        setError(null);
      } else {
        console.warn('Projects fetch failed:', e?.message || err);
        setError('Failed to load projects');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  return { projects, loading, error, refetch: fetchProjects };
}

export function useProject(id: string | undefined) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchProject = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;

        setProject(data as Project);
        setError(null);
      } catch (err) {
        const e = err as { code?: string; message?: string } | null;
        if (e && (e.code === 'PGRST205' || /schema cache/i.test(e.message || ''))) {
          setProject(null);
          setError(null);
        } else {
          console.warn('Project fetch failed:', e?.message || err);
          setError('Failed to load project');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, user]);

  return { project, loading, error };
}
