import { useState, useMemo, useCallback, useEffect, lazy, Suspense } from 'react';
import { Github, Linkedin } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import projectsData from '@/data/projects.json';
import { useProjects } from '@/hooks/useProjects';
import { TerminalHero } from '@/components/TerminalHero';
import { SecurityDiagram } from '@/components/SecurityDiagram';
import { SectionReveal, SectionRule } from '@/components/SectionReveal';
import { ProtectedEmail } from '@/components/ProtectedEmail';
import { LogoIcon } from '@/components/LogoIcon';
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
 *
 * `label` is optional. Journey omits it: the eyebrow said JOURNEY and the title
 * said "Experience & education", which is the same section named twice.
 */
function SectionHeader({
  label,
  title,
  blurb,
  align = 'center',
}: {
  label?: string;
  title: string;
  blurb?: string;
  align?: 'center' | 'left';
}) {
  const centred = align === 'center';
  return (
    <div className={centred ? 'mx-auto mb-9 max-w-[640px] text-center' : 'mb-9 max-w-[640px]'}>
      {label && <div className="section-heading">{label}</div>}
      <h2 className={`section-title ${label ? 'mt-3' : ''}`}>{title}</h2>
      {blurb && <p className="mt-3 text-[15px] text-muted-foreground">{blurb}</p>}
    </div>
  );
}

export default function Index() {
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

        <div className="container mx-auto max-w-[1180px] px-5 pb-10 pt-24 sm:pb-14 sm:pt-28">
          {/* Terminal left, schematic right. The right column is the proof the
              first screen previously had none of: what the work is, where it
              happens now, and whether he is available — all checkable. */}
          <div className="grid items-center gap-11 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,1fr)] lg:gap-[68px]">
            <div>
              <TerminalHero projects={allProjects} />

              {/* Signature row: the mark, then one icon per channel. These were
                  spelled-out URLs in monospace, which put two long strings of
                  low-value text directly under the terminal and competed with
                  it. The icons carry accessible names and titles instead. */}
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2.5">
                <LogoIcon size={22} />
                <span className="h-4 w-px bg-border-strong" aria-hidden="true" />
                <a
                  href="https://github.com/vijaysinghpuwar"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub — vijaysinghpuwar"
                  title="github.com/vijaysinghpuwar"
                  className="tap-44 text-muted-foreground transition-colors hover:text-primary"
                >
                  <Github className="h-[18px] w-[18px]" aria-hidden="true" />
                </a>
                <a
                  href="https://linkedin.com/in/vijaysinghpuwar"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn — vijaysinghpuwar"
                  title="linkedin.com/in/vijaysinghpuwar"
                  className="tap-44 text-muted-foreground transition-colors hover:text-primary"
                >
                  <Linkedin className="h-[18px] w-[18px]" aria-hidden="true" />
                </a>
                <ProtectedEmail
                  variant="icon"
                  className="tap-44 text-muted-foreground hover:text-primary"
                  iconClassName="h-[18px] w-[18px]"
                />
              </div>
            </div>

            <SecurityDiagram />
          </div>
        </div>
      </section>

      {/* ═══════ WORK ═══════ */}
      <section id="projects" aria-label="Selected work" className="relative py-14 sm:py-[68px]">
        <SectionRule />
        <SectionReveal className="container mx-auto max-w-[1180px] px-5">
          <SectionHeader
            label="Selected work"
            title="Systems in Production"
            blurb="Built, deployed and maintained. Six case studies below, and a searchable index of the rest."
          />

          <Suspense fallback={<div className="h-64" />}>
            <ProjectShowcase
              projects={allProjects}
              skillFilter={skillFilter}
              onClearSkillFilter={() => setSkillFilter(null)}
            />
          </Suspense>

          {/* The sign-in panel that used to sit here claimed the repositories
              and the resume were gated. Neither is: every repo link in the
              detail modal is a public GitHub URL and /resume and /resume.pdf
              are open routes. It was asking a recruiter to create an account
              for something already in front of them. */}
        </SectionReveal>
      </section>

      {/* ═══════ JOURNEY ═══════ */}
      <section id="experience" aria-label="Experience and education" className="relative py-14 sm:py-[68px]">
        <SectionRule />
        <SectionReveal className="container mx-auto max-w-[1180px] px-5">
          <SectionHeader
            align="left"
            title="Journey"
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
      <section id="skills" aria-label="Capabilities" className="relative py-14 sm:py-[68px]">
        <SectionRule />
        <SectionReveal className="container mx-auto max-w-[1180px] px-5">
          <SectionHeader
            label="Capabilities"
            title="Skills Backed by Shipped Work"
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
      <section id="contact" aria-label="Contact" className="relative py-14 sm:py-[68px]">
        <SectionRule />
        <SectionReveal className="container mx-auto max-w-[1180px] px-5">
          <div className="mx-auto max-w-[620px] text-center">
            <div className="section-heading">Contact</div>
            <h2 className="section-title mt-3">Open to Security Engineering Roles</h2>
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
