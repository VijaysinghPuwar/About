import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Github, Linkedin, Loader2, CheckCircle2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function Contact() {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.full_name) {
      setFormData(prev => ({ ...prev, name: profile.full_name || '' }));
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const body = user
        ? { name: formData.name, subject: formData.subject, message: formData.message }
        : { name: formData.name, email: formData.email, subject: formData.subject, message: formData.message };

      const { error } = await supabase.functions.invoke('send-contact-email', { body });
      if (error) throw error;
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      toast({ title: 'Message sent', description: "Thank you — I'll get back to you soon." });
    } catch {
      toast({ title: 'Failed to send', description: 'Please try again or email me directly.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="section-heading">Contact</p>
          <h1 className="section-title mb-4">Get in Touch</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Open to cybersecurity roles, collaborations, and security consulting opportunities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left column — info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">Let's Connect</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Whether you're looking for a cybersecurity engineer, need help with a security project, or want to discuss opportunities — I'd love to hear from you.
              </p>
            </div>

            <Card className="border-border/40 bg-card">
              <CardContent className="pt-6 space-y-4">
                <a href="mailto:contact@vijaysinghpuwar.com" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Mail className="w-4 h-4 text-primary" /> contact@vijaysinghpuwar.com
                </a>
                <a href="https://github.com/vijaysinghpuwar" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Github className="w-4 h-4 text-primary" /> github.com/vijaysinghpuwar
                </a>
                <a href="https://linkedin.com/in/vijaysinghpuwar" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Linkedin className="w-4 h-4 text-primary" /> linkedin.com/in/vijaysinghpuwar
                </a>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground mb-3 text-sm">Availability</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    Open to cybersecurity engineering roles
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    Open to security operations positions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    Open to cloud security opportunities
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    Open to collaborations & consulting
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right column — form */}
          <div>
            {submitted ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Message Sent</h3>
                <p className="text-muted-foreground mb-4">Thanks for reaching out. I'll respond within 24–48 hours.</p>
                <Button variant="outline" onClick={() => setSubmitted(false)}>Send Another</Button>
              </motion.div>
            ) : (
              <Card className="border-border/40 bg-card">
                <CardContent className="pt-6">
                  {user && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 pb-4 border-b border-border/40">
                      <User className="w-4 h-4 text-primary" />
                      <span>Signed in as <span className="text-foreground font-medium">{user.email}</span></span>
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className={user ? '' : 'grid sm:grid-cols-2 gap-4'}>
                      <div>
                        <Label htmlFor="name" className="text-sm">Name</Label>
                        <Input id="name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-background border-border/40 mt-1" />
                      </div>
                      {!user && (
                        <div>
                          <Label htmlFor="email" className="text-sm">Email</Label>
                          <Input id="email" type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="bg-background border-border/40 mt-1" />
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="subject" className="text-sm">Subject</Label>
                      <Input id="subject" required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} className="bg-background border-border/40 mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="message" className="text-sm">Message</Label>
                      <Textarea id="message" required rows={6} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} className="bg-background border-border/40 mt-1" />
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
