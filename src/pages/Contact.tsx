import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, MessageSquare, Send, Github, Linkedin, Youtube, ExternalLink, Shield } from 'lucide-react';

const socialLinks = [
  {
    name: 'Email',
    url: 'mailto:vijaysingh.puwar@example.com',
    icon: Mail,
    description: 'Direct email communication',
    primary: true
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/in/vijaysingh-puwar',
    icon: Linkedin,
    description: 'Professional networking',
    primary: true
  },
  {
    name: 'GitHub',
    url: 'https://github.com/vijaysingh-puwar',
    icon: Github,
    description: 'Open source projects & code',
    primary: false
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com/@vijaysingh-puwar',
    icon: Youtube,
    description: 'Security tutorials & content',
    primary: false
  }
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real implementation, you would integrate with Formspree or similar service
      // For now, we'll simulate the form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message sent!",
        description: "Thank you for reaching out. I'll get back to you soon.",
      });
      
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again or use direct email.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-12 max-w-4xl space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
          Get In Touch
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Let's discuss cybersecurity, collaboration opportunities, or share knowledge. 
          Always happy to connect with fellow security professionals and enthusiasts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Send a Message
            </CardTitle>
            <CardDescription>
              Fill out the form below and I'll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="bg-background/50 border-border/50 focus:border-primary/30"
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="bg-background/50 border-border/50 focus:border-primary/30"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="bg-background/50 border-border/50 focus:border-primary/30"
                  placeholder="What would you like to discuss?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="bg-background/50 border-border/50 focus:border-primary/30 resize-none"
                  placeholder="Your message here..."
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 shadow-glow-cyan"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information & Social Links */}
        <div className="space-y-6">
          {/* Quick Contact */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Quick Contact
              </CardTitle>
              <CardDescription>
                Prefer direct communication? Use these channels.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {socialLinks.filter(link => link.primary).map((social) => {
                const Icon = social.icon;
                return (
                  <div key={social.name} className="flex items-center gap-4 p-3 rounded-lg bg-muted/20 border border-border/30 hover:bg-muted/30 transition-colors">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{social.name}</h3>
                      <p className="text-sm text-muted-foreground">{social.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="hover:bg-primary/10 hover:text-primary"
                    >
                      <a href={social.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in">
            <CardHeader>
              <CardTitle>Connect Online</CardTitle>
              <CardDescription>
                Follow my work and stay updated with the latest security content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {socialLinks.filter(link => !link.primary).map((social) => {
                const Icon = social.icon;
                return (
                  <div key={social.name} className="flex items-center gap-4 p-3 rounded-lg bg-muted/20 border border-border/30 hover:bg-muted/30 transition-colors">
                    <div className="p-2 rounded-lg bg-secondary/10 border border-secondary/20">
                      <Icon className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{social.name}</h3>
                      <p className="text-sm text-muted-foreground">{social.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="hover:bg-secondary/10 hover:text-secondary"
                    >
                      <a href={social.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Response Time */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-foreground">Response Time</h3>
                <p className="text-sm text-muted-foreground">
                  I typically respond to messages within 24-48 hours. 
                  For urgent security matters, please use direct email.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Info */}
      <div className="text-center space-y-4 animate-fade-in">
        <h2 className="text-2xl font-bold text-foreground">What I'm Looking For</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="space-y-2">
            <h3 className="font-semibold text-primary">Collaboration</h3>
            <p className="text-sm text-muted-foreground">
              Open source security projects, research partnerships, and knowledge sharing initiatives.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-primary">Career Opportunities</h3>
            <p className="text-sm text-muted-foreground">
              Full-time roles in cybersecurity engineering, SIEM/SOC positions, and cloud security roles.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-primary">Community</h3>
            <p className="text-sm text-muted-foreground">
              Speaking opportunities, mentorship, and connecting with cybersecurity professionals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}