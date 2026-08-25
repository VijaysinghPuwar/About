import { useState, useMemo, useCallback, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import projectsData from '@/data/projects.json';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { TerminalHero } from '@/components/TerminalHero';
import { SecurityDiagram } from '@/components/SecurityDiagram';
import { SectionReveal } from '@/components/SectionReveal';
import { ProtectedEmail } from '@/components/ProtectedEmail';
import { loginHref } from '@/lib/auth-redirect';
import { onFilterSkill } from '@/lib/portfolio-events';

const SkillMatrix = lazy(() => import('@/components/SkillMatrix').then(m => ({ default: m.SkillMatrix })));
const ExperienceTimeline = lazy(() => import('@/components/ExperienceTimeline').then(m => ({ default: m.ExperienceTimeline })));
const ProjectShowcase = lazy(() => import('@/components/ProjectShowcase').then(m => ({ default: m.ProjectShowcase })));

/**
 * Section header.
 *
 * Every section used to be eyebrow + centred title + grid, which went monotone
 * by the third scroll. This takes an `align` so the rhythm can break: Work and
 * Capabilities lead centred because they introduce a wide grid, Journey runs
 * left so the page does not read as four identical slabs.
 */
function SectionHeader({
  label,
  title,
  blurb,
  align = 'center',
}: {
  label: string;
  title: string;
  blurb?: string;
  align?: 'center' | 'left';
}) {
  const centred = align === 'center';
  return (
    <div className={centred ? 'mx-auto mb-10 max-w-[640px] text-center' : 'mb-10 max-w-[640px]'}>
      <div className="section-heading">{label}</div>
      <h2 className="section-title mt-3">{title}</h2>
      {blurb && <p className="mt-3 text-[15px] text-muted-foreground">{blurb}</p>}
    </div>
  );
}

export default function Index() {
  const { user } = useAuth();

  /* projects */
  const { projects: dbProjects } = useProjects();
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

  /* Selecting a skill filters the projects section to the work that uses it. */
  const [skillFilter, setSkillFilter] = useState<{ label: string; aliases: string[] } | null>(null);

  useEffect(() => onFilterSkill(({ label, aliases }) => {
    setSkillFilter({ label, aliases });
  }), []);

  const handleSelectSkill = useCallback((aliases: string[], label: string) => {
    setSkillFilter(prev => (prev?.label === label ? null : { label, aliases }));
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="min-h-[100dvh]">
      <Helmet>
        <title>Vijaysingh Puwar | Cybersecurity Engineer</title>
        <meta name="description" content="Cybersecurity engineer specializing in identity security, security automation, cloud defense, and detection engineering. M.S. Cybersecurity at Pace University, New York." />
        <link rel="canonical" href="https://vijaysinghpuwar.com/" />
      </Helmet>
      {/* sr-only h1 establishes the page heading for SEO and screen readers; the visual hero is the terminal card */}
      <h1 className="sr-only">Vijaysingh Puwar — Cybersecurity Engineer</h1>

      {/* ═══════ HERO ═══════ */}
      <section id="home" aria-labelledby="home-heading" className="relative">
        <span id="home-heading" className="sr-only">Hero</span>

        <div className="container mx-auto max-w-[1180px] px-5 pb-16 pt-24 sm:pb-24 sm:pt-32">
          {/* Terminal left, schematic right. The right column is the proof the
              first screen previously had none of: what the work is, where it
              happens now, and whether he is available — all checkable. */}
          <div className="grid items-center gap-11 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,1fr)] lg:gap-[68px]">
            <div>
              <TerminalHero projects={allProjects} />

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[12px]">
                <a
                  href="https://github.com/vijaysinghpuwar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  github.com/vijaysinghpuwar
                </a>
                <a
                  href="https://linkedin.com/in/vijaysinghpuwar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  linkedin.com/in/vijaysinghpuwar
                </a>
                <ProtectedEmail variant="icon" className="text-muted-foreground hover:text-primary" iconClassName="w-4 h-4" />
              </div>
            </div>

            <SecurityDiagram />
          </div>
        </div>
      </section>

      {/* ═══════ WORK ═══════ */}
      <section id="projects" aria-label="Selected work" className="border-t border-border py-20">
        <SectionReveal className="container mx-auto max-w-[1180px] px-5">
          <SectionHeader
            label="Selected work"
            title="Systems in production"
            blurb="Built, deployed and maintained. The full index sits below and filters by capability."
          />

          <Suspense fallback={<div className="h-64" />}>
            <ProjectShowcase
              projects={allProjects}
              skillFilter={skillFilter}
              onClearSkillFilter={() => setSkillFilter(null)}
            />
          </Suspense>

          {/* Project detail is public; repositories and the resume stay gated. */}
          {!user && (
            <div className="panel mx-auto mt-10 flex max-w-2xl flex-col items-center justify-center gap-4 rounded-lg px-6 py-5 text-center sm:flex-row sm:text-left">
              <Lock className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <p className="flex-1 text-sm text-muted-foreground">
                Sign in to open the source repositories and download my resume.
              </p>
              <Link
                to={loginHref()}
                className="gradient-btn inline-flex h-10 shrink-0 items-center justify-center rounded-md px-5 text-sm"
              >
                Sign in with Google
              </Link>
            </div>
          )}
        </SectionReveal>
      </section>

      {/* ═══════ JOURNEY ═══════ */}
      <section id="experience" aria-label="Experience and education" className="border-t border-border py-20">
        <SectionReveal className="container mx-auto max-w-[1180px] px-5">
          <SectionHeader
            align="left"
            label="Journey"
            title="Experience & education"
            blurb="Work and study in one sequence. Expand an entry for what the role actually involved."
          />
          <Suspense fallback={<div className="h-64" />}>
            <ExperienceTimeline />
          </Suspense>
        </SectionReveal>
      </section>

      {/* ═══════ CAPABILITIES ═══════ */}
      {/* The certification marquee that used to sit here was cut: the same five
          certifications already render as cards at the end of the timeline
          above, and a scrolling copy of a list the reader has just seen is
          repetition, not reinforcement. */}
      <section id="skills" aria-label="Capabilities" className="border-t border-border py-20">
        <SectionReveal className="container mx-auto max-w-[1180px] px-5">
          <SectionHeader
            label="Capabilities"
            title="Skills, and the work that proves them"
            blurb="The number on a skill is how many indexed projects actually use it. Select one to filter the work above — no ratings, no percentages."
          />

          <Suspense fallback={<div className="h-64" />}>
            <SkillMatrix
              projects={allProjects}
              activeSkill={skillFilter?.label ?? null}
              onSelectSkill={handleSelectSkill}
            />
          </Suspense>
        </SectionReveal>
      </section>

      {/* ═══════ CONTACT ═══════ */}
      <section id="contact" aria-label="Contact" className="border-t border-border py-20">
        <SectionReveal className="container mx-auto max-w-[1180px] px-5">
          <div className="mx-auto max-w-[620px] text-center">
            <div className="section-heading">Contact</div>
            <h2 className="section-title mt-3">Open to security engineering roles</h2>
            <p className="mt-3 text-[15px] text-muted-foreground">
              New York, NY and remote. Résumé and project detail stay public — no sign-in required.
            </p>
          </div>

          {/* Four routes, one row. The digital-business-card mock and the list of
              "availabilities" padded out with pulsing dots are both gone. */}
          <div className="mx-auto mt-8 grid max-w-[900px] gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="https://github.com/vijaysinghpuwar"
              target="_blank"
              rel="noopener noreferrer"
              className="panel panel-hover flex flex-col gap-1.5 rounded-lg px-[18px] py-4"
            >
              <span className="meta-label">GitHub</span>
              <span className="text-[15px] text-foreground">/vijaysinghpuwar</span>
            </a>
            <a
              href="https://linkedin.com/in/vijaysinghpuwar"
              target="_blank"
              rel="noopener noreferrer"
              className="panel panel-hover flex flex-col gap-1.5 rounded-lg px-[18px] py-4"
            >
              <span className="meta-label">LinkedIn</span>
              <span className="text-[15px] text-foreground">/in/vijaysinghpuwar</span>
            </a>
            <ProtectedEmail variant="card" />
            <a
              href="/resume.pdf"
              download
              className="panel panel-hover flex flex-col gap-1.5 rounded-lg px-[18px] py-4"
            >
              <span className="meta-label">Résumé</span>
              <span className="text-[15px] text-foreground">Download PDF</span>
            </a>
          </div>
        </SectionReveal>
      </section>
    </div>
  );
}
