import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Shield, Plus, Trash2, Users, FolderLock, Settings, 
  Loader2, Lock, Unlock, Eye, UserPlus, X, Search,
  CheckCircle, Ban, Clock, Bell, Mail, AlertTriangle, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  avatar_url: string | null;
  status: string;
  created_at: string;
  last_login_at: string | null;
}

interface ProjectAccess {
  id: string;
  project_id: string;
  user_id: string;
  profiles?: UserProfile;
}

interface Notification {
  id: string;
  type: string;
  user_email: string | null;
  user_name: string | null;
  message: string | null;
  read: boolean;
  created_at: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface AuthEvent {
  id: string;
  user_id: string | null;
  email: string | null;
  event_type: string;
  ip_address: string | null;
  user_agent: string | null;
  risk_level: string | null;
  flagged_suspicious: boolean;
  metadata: any;
  created_at: string;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);
  const [projectAccess, setProjectAccess] = useState<Record<string, ProjectAccess[]>>({});
  const [loading, setLoading] = useState(true);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [searchUser, setSearchUser] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [showSuspiciousOnly, setShowSuspiciousOnly] = useState(false);
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      id: '', title: '', description: '', category: '',
      access_level: 'public', github_link: '', featured: false,
    },
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate('/');
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsRes, usersRes, accessRes, notifRes, contactRes, authEventsRes] = await Promise.all([
        supabase.from('projects').select('id, title, access_level').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*'),
        supabase.from('project_access').select('*'),
        supabase.from('admin_notifications').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('auth_events').select('*').order('created_at', { ascending: false }).limit(100),
      ]);

      if (projectsRes.error) throw projectsRes.error;
      if (usersRes.error) throw usersRes.error;
      if (accessRes.error) throw accessRes.error;

      setProjects(projectsRes.data as Project[] || []);
      setUsers(usersRes.data as UserProfile[] || []);
      setNotifications(notifRes.data as Notification[] || []);
      setContactMessages(contactRes.data as ContactMessage[] || []);
      setAuthEvents(authEventsRes.data as AuthEvent[] || []);

      const accessByProject: Record<string, ProjectAccess[]> = {};
      for (const access of accessRes.data || []) {
        const profile = usersRes.data?.find((u: UserProfile) => u.user_id === access.user_id);
        const enriched: ProjectAccess = { ...access, profiles: profile as UserProfile };
        if (!accessByProject[access.project_id]) accessByProject[access.project_id] = [];
        accessByProject[access.project_id].push(enriched);
      }
      setProjectAccess(accessByProject);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast({ title: 'Error', description: 'Failed to load admin data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserStatus = async (userId: string, newStatus: string) => {
    setUpdatingStatus(userId);
    try {
      const { error } = await supabase.rpc('update_profile_status', {
        target_user_id: userId,
        new_status: newStatus,
      });
      if (error) throw error;
      toast({ title: 'Status Updated', description: `User status changed to ${newStatus}` });
      fetchData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update status', variant: 'destructive' });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const markNotificationsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;
    for (const n of unread) {
      await supabase.from('admin_notifications').update({ read: true }).eq('id', n.id);
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markContactRead = async (id: string) => {
    await supabase.from('contact_messages').update({ read: true }).eq('id', id);
    setContactMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  };

  const handleAddProject = async (data: ProjectFormData) => {
    try {
      setIsAddingProject(true);
      const { error } = await supabase.from('projects').insert({
        id: data.id, title: data.title, description: data.description || null,
        category: data.category || null, access_level: data.access_level,
        github_link: data.github_link || null, featured: data.featured || false,
      });
      if (error) throw error;
      toast({ title: 'Project Created', description: `${data.title} has been added.` });
      form.reset();
      fetchData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to create project', variant: 'destructive' });
    } finally {
      setIsAddingProject(false);
    }
  };

  const handleUpdateAccessLevel = async (projectId: string, newLevel: 'public' | 'basic' | 'admin') => {
    try {
      const { error } = await supabase.from('projects').update({ access_level: newLevel }).eq('id', projectId);
      if (error) throw error;
      setProjects(projects.map(p => p.id === projectId ? { ...p, access_level: newLevel } : p));
      toast({ title: 'Access Updated', description: `Project access level changed to ${newLevel}` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleGrantAccess = async (projectId: string, userId: string) => {
    try {
      const { error } = await supabase.from('project_access').insert({
        project_id: projectId, user_id: userId, granted_by: user?.id,
      });
      if (error) {
        if (error.code === '23505') { toast({ title: 'Already Granted' }); return; }
        throw error;
      }
      toast({ title: 'Access Granted' });
      fetchData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleRevokeAccess = async (accessId: string) => {
    try {
      const { error } = await supabase.from('project_access').delete().eq('id', accessId);
      if (error) throw error;
      toast({ title: 'Access Revoked' });
      fetchData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', projectId);
      if (error) throw error;
      toast({ title: 'Project Deleted' });
      fetchData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
    (u.full_name && u.full_name.toLowerCase().includes(searchUser.toLowerCase()))
  );

  const pendingUsers = users.filter(u => u.status === 'pending');
  const approvedUsers = users.filter(u => u.status === 'approved');
  const blockedUsers = users.filter(u => u.status === 'blocked');
  const unreadMessages = contactMessages.filter(m => !m.read).length;
  const suspiciousEvents = authEvents.filter(e => e.flagged_suspicious);
  const displayedAuthEvents = showSuspiciousOnly ? suspiciousEvents : authEvents;

  if (authLoading || loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const getAccessIcon = (level: string) => {
    switch (level) {
      case 'public': return <Unlock className="w-4 h-4 text-success" />;
      case 'basic': return <Eye className="w-4 h-4 text-warning" />;
      case 'admin': return <Lock className="w-4 h-4 text-destructive" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="text-warning border-warning/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved': return <Badge variant="outline" className="text-success border-success/30"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'blocked': return <Badge variant="outline" className="text-destructive border-destructive/30"><Ban className="w-3 h-3 mr-1" />Blocked</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const UserCard = ({ u }: { u: UserProfile }) => {
    const initials = u.full_name
      ? u.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : u.email[0].toUpperCase();

    return (
      <div className="p-4 hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-border/50">
            <AvatarImage src={u.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground text-sm truncate">{u.full_name || u.email}</p>
            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
            <p className="text-xs text-muted-foreground">Joined {new Date(u.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {getStatusBadge(u.status)}
            <div className="flex gap-1">
              {u.status !== 'approved' && (
                <Button size="sm" variant="outline" className="h-7 text-xs border-success/30 text-success hover:bg-success/10"
                  disabled={updatingStatus === u.user_id} onClick={() => handleUpdateUserStatus(u.user_id, 'approved')}>
                  {updatingStatus === u.user_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                  Approve
                </Button>
              )}
              {u.status !== 'blocked' && (
                <Button size="sm" variant="outline" className="h-7 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                  disabled={updatingStatus === u.user_id} onClick={() => handleUpdateUserStatus(u.user_id, 'blocked')}>
                  <Ban className="w-3 h-3 mr-1" />Block
                </Button>
              )}
              {u.status !== 'pending' && (
                <Button size="sm" variant="outline" className="h-7 text-xs"
                  disabled={updatingStatus === u.user_id} onClick={() => handleUpdateUserStatus(u.user_id, 'pending')}>
                  <Clock className="w-3 h-3 mr-1" />Revoke
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[100dvh] py-12">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute inset-0 cyber-grid opacity-20" />

      <div className="container relative max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Manage users, projects, messages, and security</p>
        </motion.div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-card border border-border/50">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" /> Users
              {pendingUsers.length > 0 && (
                <Badge className="bg-warning text-warning-foreground text-xs h-5 min-w-5 flex items-center justify-center">
                  {pendingUsers.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderLock className="w-4 h-4" /> Projects
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Messages
              {unreadMessages > 0 && (
                <Badge className="bg-primary text-primary-foreground text-xs h-5 min-w-5 flex items-center justify-center">
                  {unreadMessages}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Security
              {suspiciousEvents.length > 0 && (
                <Badge className="bg-destructive text-destructive-foreground text-xs h-5 min-w-5 flex items-center justify-center">
                  {suspiciousEvents.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {pendingUsers.length > 0 && (
                <div className="rounded-2xl border border-warning/30 bg-card/50 backdrop-blur-sm overflow-hidden">
                  <div className="p-4 border-b border-warning/20 bg-warning/5">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-warning" />
                      <h3 className="font-semibold text-foreground">Pending ({pendingUsers.length})</h3>
                    </div>
                  </div>
                  <div className="divide-y divide-border/50">
                    {pendingUsers.map(u => <UserCard key={u.user_id} u={u} />)}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="p-4 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <h3 className="font-semibold text-foreground">Approved ({approvedUsers.length})</h3>
                  </div>
                </div>
                <div className="divide-y divide-border/50">
                  {approvedUsers.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No approved users yet.</div>
                  ) : approvedUsers.map(u => <UserCard key={u.user_id} u={u} />)}
                </div>
              </div>

              {blockedUsers.length > 0 && (
                <div className="rounded-2xl border border-destructive/30 bg-card/50 backdrop-blur-sm overflow-hidden">
                  <div className="p-4 border-b border-destructive/20">
                    <div className="flex items-center gap-2">
                      <Ban className="w-5 h-5 text-destructive" />
                      <h3 className="font-semibold text-foreground">Blocked ({blockedUsers.length})</h3>
                    </div>
                  </div>
                  <div className="divide-y divide-border/50">
                    {blockedUsers.map(u => <UserCard key={u.user_id} u={u} />)}
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                  <div className="p-6 border-b border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FolderLock className="w-5 h-5 text-primary" />
                      <h2 className="text-xl font-semibold">Projects ({projects.length})</h2>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          <Plus className="w-4 h-4 mr-2" /> Add Project
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader><DialogTitle>Add New Project</DialogTitle></DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(handleAddProject)} className="space-y-4">
                            <FormField control={form.control} name="id" render={({ field }) => (
                              <FormItem><FormLabel>Project ID (URL slug)</FormLabel><FormControl><Input placeholder="my-project" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="title" render={({ field }) => (
                              <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="My Project" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="access_level" render={({ field }) => (
                              <FormItem><FormLabel>Access Level</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                  <SelectContent>
                                    <SelectItem value="public">Public</SelectItem>
                                    <SelectItem value="basic">Basic (Login Required)</SelectItem>
                                    <SelectItem value="admin">Admin Only</SelectItem>
                                  </SelectContent>
                                </Select><FormMessage />
                              </FormItem>
                            )} />
                            <Button type="submit" className="w-full" disabled={isAddingProject}>
                              {isAddingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Project'}
                            </Button>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="divide-y divide-border/50">
                    {projects.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">No projects yet.</div>
                    ) : projects.map((project) => (
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
                            <Select value={project.access_level} onValueChange={(val) => handleUpdateAccessLevel(project.id, val as any)}>
                              <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="public">Public</SelectItem>
                                <SelectItem value="basic">Basic</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedProject(project.id)}>
                                  <UserPlus className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader><DialogTitle>Manage Access: {project.title}</DialogTitle></DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Users with Access</h4>
                                    {projectAccess[project.id]?.length > 0 ? (
                                      <div className="space-y-2">
                                        {projectAccess[project.id].map((access) => (
                                          <div key={access.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                            <span className="text-sm">{access.profiles?.email}</span>
                                            <Button variant="ghost" size="sm" onClick={() => handleRevokeAccess(access.id)}>
                                              <X className="w-4 h-4 text-destructive" />
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    ) : <p className="text-sm text-muted-foreground">No specific users granted access</p>}
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Grant Access</h4>
                                    <div className="relative mb-3">
                                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                      <Input placeholder="Search users..." value={searchUser} onChange={(e) => setSearchUser(e.target.value)} className="pl-9" />
                                    </div>
                                    <div className="max-h-40 overflow-y-auto space-y-1">
                                      {filteredUsers.slice(0, 10).map((u) => (
                                        <button key={u.user_id} onClick={() => handleGrantAccess(project.id, u.user_id)}
                                          className="w-full text-left p-2 rounded-lg hover:bg-muted/50 text-sm transition-colors">
                                          {u.email} {u.full_name && `(${u.full_name})`}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteProject(project.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="p-6 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-secondary" />
                    <h2 className="text-xl font-semibold">Users ({users.length})</h2>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto divide-y divide-border/50">
                  {users.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No users yet.</div>
                  ) : users.map((u) => (
                    <div key={u.user_id} className="p-4 flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={u.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">{u.email[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm truncate">{u.email}</p>
                        {u.full_name && <p className="text-xs text-muted-foreground truncate">{u.full_name}</p>}
                      </div>
                      {getStatusBadge(u.status)}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </TabsContent>

          {/* Contact Messages Tab */}
          <TabsContent value="messages">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Contact Messages ({contactMessages.length})</h3>
                </div>
              </div>
              <div className="divide-y divide-border/50">
                {contactMessages.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No messages yet.</div>
                ) : contactMessages.map((msg) => (
                  <div key={msg.id} className={cn("p-4 transition-colors", !msg.read && "bg-primary/5")} onClick={() => !msg.read && markContactRead(msg.id)}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          {!msg.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                          <p className="font-medium text-foreground text-sm">{msg.subject}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">From: {msg.name} ({msg.email})</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{msg.message}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <p className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleString()}</p>
                        <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                          <a href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}>
                            <Mail className="w-3 h-3 mr-1" />Reply
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Security / Auth Events Tab */}
          <TabsContent value="security">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Auth Events</h3>
                </div>
                <Button size="sm" variant={showSuspiciousOnly ? "default" : "outline"}
                  onClick={() => setShowSuspiciousOnly(!showSuspiciousOnly)}>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {showSuspiciousOnly ? 'Showing Suspicious Only' : 'Show Suspicious Only'}
                </Button>
              </div>
              <div className="divide-y divide-border/50">
                {displayedAuthEvents.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    {showSuspiciousOnly ? 'No suspicious events detected.' : 'No auth events logged yet.'}
                  </div>
                ) : displayedAuthEvents.map((event) => (
                  <div key={event.id} className={cn("p-4 transition-colors", event.flagged_suspicious && "bg-destructive/5 border-l-2 border-l-destructive")}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          {event.flagged_suspicious && <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />}
                          <p className="font-medium text-foreground text-sm">{event.email}</p>
                          <Badge variant="outline" className={cn("text-xs",
                            event.risk_level === 'high' && "text-destructive border-destructive/30",
                            event.risk_level === 'medium' && "text-warning border-warning/30",
                            event.risk_level === 'normal' && "text-muted-foreground"
                          )}>
                            {event.risk_level}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Type: {event.event_type} · IP: {event.ip_address || 'unknown'}</p>
                        {event.user_agent && <p className="text-xs text-muted-foreground truncate">UA: {event.user_agent}</p>}
                        {event.metadata?.reasons?.length > 0 && (
                          <p className="text-xs text-destructive">Reason: {event.metadata.reasons.join(', ')}</p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground flex-shrink-0">{new Date(event.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
