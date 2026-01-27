import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Shield, Plus, Trash2, Users, FolderLock, Settings, 
  Loader2, Lock, Unlock, Eye, UserPlus, X, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  title: string;
  access_level: 'public' | 'basic' | 'admin';
}

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
}

interface ProjectAccess {
  id: string;
  project_id: string;
  user_id: string;
  profiles?: UserProfile;
}

const projectSchema = z.object({
  id: z.string().min(1, 'Project ID required').max(100).regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only'),
  title: z.string().min(1, 'Title required').max(200),
  description: z.string().max(1000).optional(),
  category: z.string().max(100).optional(),
  access_level: z.enum(['public', 'basic', 'admin']),
  github_link: z.string().url().optional().or(z.literal('')),
  featured: z.boolean().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function Admin() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [projectAccess, setProjectAccess] = useState<Record<string, ProjectAccess[]>>({});
  const [loading, setLoading] = useState(true);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [searchUser, setSearchUser] = useState('');
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      id: '',
      title: '',
      description: '',
      category: '',
      access_level: 'public',
      github_link: '',
      featured: false,
    },
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, title, access_level')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;
      setProjects(projectsData as Project[] || []);

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*');

      if (usersError) throw usersError;
      setUsers(usersData as UserProfile[] || []);

      // Fetch project access
      const { data: accessData, error: accessError } = await supabase
        .from('project_access')
        .select('*');

      if (accessError) throw accessError;
      
      // Now fetch profiles for access entries
      const accessByProject: Record<string, ProjectAccess[]> = {};
      for (const access of accessData || []) {
        const profile = usersData?.find((u: UserProfile) => u.user_id === access.user_id);
        const enrichedAccess: ProjectAccess = {
          ...access,
          profiles: profile,
        };
        if (!accessByProject[access.project_id]) {
          accessByProject[access.project_id] = [];
        }
        accessByProject[access.project_id].push(enrichedAccess);
      }
      setProjectAccess(accessByProject);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      toast({
        title: 'Error',
        description: 'Failed to load admin data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (data: ProjectFormData) => {
    try {
      setIsAddingProject(true);
      
      const { error } = await supabase
        .from('projects')
        .insert({
          id: data.id,
          title: data.title,
          description: data.description || null,
          category: data.category || null,
          access_level: data.access_level,
          github_link: data.github_link || null,
          featured: data.featured || false,
        });

      if (error) throw error;

      toast({
        title: 'Project Created',
        description: `${data.title} has been added.`,
      });
      
      form.reset();
      fetchData();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create project',
        variant: 'destructive',
      });
    } finally {
      setIsAddingProject(false);
    }
  };

  const handleUpdateAccessLevel = async (projectId: string, newLevel: 'public' | 'basic' | 'admin') => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ access_level: newLevel })
        .eq('id', projectId);

      if (error) throw error;

      setProjects(projects.map(p => 
        p.id === projectId ? { ...p, access_level: newLevel } : p
      ));

      toast({
        title: 'Access Updated',
        description: `Project access level changed to ${newLevel}`,
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update access level',
        variant: 'destructive',
      });
    }
  };

  const handleGrantAccess = async (projectId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('project_access')
        .insert({
          project_id: projectId,
          user_id: userId,
          granted_by: user?.id,
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Already Granted',
            description: 'This user already has access to this project',
          });
          return;
        }
        throw error;
      }

      toast({
        title: 'Access Granted',
        description: 'User can now access this project',
      });
      
      fetchData();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to grant access',
        variant: 'destructive',
      });
    }
  };

  const handleRevokeAccess = async (accessId: string) => {
    try {
      const { error } = await supabase
        .from('project_access')
        .delete()
        .eq('id', accessId);

      if (error) throw error;

      toast({
        title: 'Access Revoked',
        description: 'User access has been removed',
      });
      
      fetchData();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to revoke access',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: 'Project Deleted',
        description: 'The project has been removed',
      });
      
      fetchData();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete project',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
    (u.full_name && u.full_name.toLowerCase().includes(searchUser.toLowerCase()))
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const getAccessIcon = (level: string) => {
    switch (level) {
      case 'public': return <Unlock className="w-4 h-4 text-success" />;
      case 'basic': return <Eye className="w-4 h-4 text-warning" />;
      case 'admin': return <Lock className="w-4 h-4 text-destructive" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute inset-0 cyber-grid opacity-20" />
      
      <div className="container relative max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Manage projects and user access</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Projects Panel */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
            >
              <div className="p-6 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FolderLock className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Projects ({projects.length})</h2>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Project</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleAddProject)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project ID (URL slug)</FormLabel>
                              <FormControl>
                                <Input placeholder="my-project" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="My Project" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="access_level"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Access Level</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="public">Public</SelectItem>
                                  <SelectItem value="basic">Basic (Login Required)</SelectItem>
                                  <SelectItem value="admin">Admin Only</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full" disabled={isAddingProject}>
                          {isAddingProject ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Create Project'
                          )}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="divide-y divide-border/50">
                {projects.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No projects yet. Add your first project above.
                  </div>
                ) : (
                  projects.map((project) => (
                    <div key={project.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          {getAccessIcon(project.access_level)}
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{project.title}</p>
                            <p className="text-sm text-muted-foreground truncate">{project.id}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Select
                            value={project.access_level}
                            onValueChange={(val) => handleUpdateAccessLevel(project.id, val as any)}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="basic">Basic</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedProject(project.id)}
                              >
                                <UserPlus className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Manage Access: {project.title}</DialogTitle>
                              </DialogHeader>
                              
                              <div className="space-y-4">
                                {/* Current Access */}
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Users with Access</h4>
                                  {projectAccess[project.id]?.length > 0 ? (
                                    <div className="space-y-2">
                                      {projectAccess[project.id].map((access) => (
                                        <div key={access.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                          <span className="text-sm">{access.profiles?.email}</span>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRevokeAccess(access.id)}
                                          >
                                            <X className="w-4 h-4 text-destructive" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No specific users granted access</p>
                                  )}
                                </div>

                                {/* Add User */}
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Grant Access</h4>
                                  <div className="relative mb-3">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                      placeholder="Search users..."
                                      value={searchUser}
                                      onChange={(e) => setSearchUser(e.target.value)}
                                      className="pl-9"
                                    />
                                  </div>
                                  <div className="max-h-40 overflow-y-auto space-y-1">
                                    {filteredUsers.slice(0, 10).map((u) => (
                                      <button
                                        key={u.user_id}
                                        onClick={() => handleGrantAccess(project.id, u.user_id)}
                                        className="w-full text-left p-2 rounded-lg hover:bg-muted/50 text-sm transition-colors"
                                      >
                                        {u.email} {u.full_name && `(${u.full_name})`}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Users Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
          >
            <div className="p-6 border-b border-border/50">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-secondary" />
                <h2 className="text-xl font-semibold">Users ({users.length})</h2>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-border/50">
              {users.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No users registered yet.
                </div>
              ) : (
                users.map((u) => (
                  <div key={u.user_id} className="p-4">
                    <p className="font-medium text-foreground text-sm truncate">{u.email}</p>
                    {u.full_name && (
                      <p className="text-xs text-muted-foreground truncate">{u.full_name}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
