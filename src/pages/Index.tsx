import { useState, useMemo, useCallback, useEffect, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import projectsData from '@/data/projects.json';
import { useProjects } from '@/hooks/useProjects';
import { TerminalHero } from '@/components/TerminalHero';
import { SecurityDiagram } from '@/components/SecurityDiagram';
import { SectionReveal, SectionRule } from '@/components/SectionReveal';
import { ProtectedEmail } from '@/components/ProtectedEmail';
import { onFilterSkill } from '@/lib/portfolio-events';

const SkillMatrix = lazy(() => import('@/components/SkillMatrix').then(m => ({ default: m.SkillMatrix })));
const ExperienceTimeline = lazy(() => import('@/components/ExperienceTimeline').then(m => ({ default: m.ExperienceTimeline })));
const ProjectShowcase = lazy(() => import('@/components/ProjectShowcase').then(m => ({ default: m.ProjectShowcase })));
const GitHubActivity = lazy(() => import('@/components/GitHubActivity').then(m => ({ default: m.GitHubActivity })));

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
      <h1 className="sr-only">Vijaysingh Puwar, Cybersecurity Engineer</h1>

      {/* ═══════ HERO ═══════ */}
      <section id="home" aria-labelledby="home-heading" className="relative">
        <span id="home-heading" className="sr-only">Hero</span>

        <div className="page-gutter container mx-auto max-w-[1180px] pb-[clamp(60px,8vw,100px)] pt-[clamp(100px,13vh,140px)]">
          {/* Terminal left, schematic right. The right column is the proof the
              first screen previously had none of: what the work is, where it
              happens now, and whether he is available, all checkable. */}
          <div className="grid items-center gap-11 wide:grid-cols-[minmax(0,1.06fr)_minmax(0,1fr)] wide:gap-[clamp(40px,5vw,68px)]">
            {/* `min-w-0`: a grid item's automatic minimum size is its content's
                min-content width, and the terminal now prints command output
                unwrapped so its own scroller can keep the columns aligned. Left
                to itself the item would take that width and push the page
                sideways instead of letting the scroller do its job. */}
            <div className="min-w-0">
              <TerminalHero projects={allProjects} />

              {/* Signature row.

                  Spelled out rather than shown as glyphs. The handle is the
                  useful part of either link, a reader can copy it without
                  following it, and it survives being printed. The email is not
                  repeated here: it has its own card in the contact section and
                  its own `contact` command in the terminal above. */}
              <div className="mt-4 flex flex-wrap gap-x-[22px] gap-y-2 text-[12px]">
                <a
                  href="https://github.com/vijaysinghpuwar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap-44 font-mono text-muted-foreground transition-colors hover:text-primary"
                >
                  github.com/vijaysinghpuwar
                </a>
                <a
                  href="https://linkedin.com/in/vijaysinghpuwar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap-44 font-mono text-muted-foreground transition-colors hover:text-primary"
                >
                  linkedin.com/in/vijaysinghpuwar
                </a>
              </div>
            </div>

            <SecurityDiagram />
          </div>
        </div>
      </section>

      {/* ═══════ ACTIVITY ═══════ */}
      {/* One line, between the introduction and the evidence. It renders
          nothing at all until GitHub answers, so a rate-limited or offline
          visitor sees the page close up rather than an empty frame. */}
      <Suspense fallback={null}>
        <GitHubActivity />
      </Suspense>

      {/* ═══════ WORK ═══════ */}
      <section id="projects" aria-label="Selected work" className="relative py-[clamp(52px,7vw,88px)]">
        <SectionRule />
        <SectionReveal className="page-gutter container mx-auto max-w-[1180px]">
          <SectionHeader
            label="Selected work"
            title="Systems in production"
            blurb="Built, deployed and maintained. Three case studies below, and a searchable index of the rest."
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
      <section id="experience" aria-label="Experience and education" className="relative py-[clamp(52px,7vw,88px)]">
        <SectionRule />
        <SectionReveal className="page-gutter container mx-auto max-w-[1180px]">
          <SectionHeader
            align="left"
            title="Journey"
            blurb="Work and study in one sequence, most recent first. Coursework and tooling detail sit behind each entry."
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
      <section id="skills" aria-label="Capabilities" className="relative py-[clamp(52px,7vw,88px)]">
        <SectionRule />
        <SectionReveal className="page-gutter container mx-auto max-w-[1180px]">
          <SectionHeader
            label="Capabilities"
            title="What I work with"
            blurb="The number on a skill is how many indexed projects actually use it. Select one to filter the work above. No ratings, no percentages."
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
      <section id="contact" aria-label="Contact" className="relative py-[clamp(52px,7vw,88px)]">
        <SectionRule />
        <SectionReveal className="page-gutter container mx-auto max-w-[1180px]">
          <div className="mx-auto max-w-[620px] text-center">
            <div className="section-heading">Contact</div>
            <h2 className="section-title mt-3">Open to security engineering roles</h2>
            <p className="mt-3 text-[15px] text-muted-foreground">
              New York, NY and remote. Résumé, projects and links stay public, no sign-in required.
            </p>
          </div>

          {/* Four routes, one row. The digital-business-card mock and the list of
              "availabilities" padded out with pulsing dots are both gone. */}
          <div className="mx-auto mt-8 grid max-w-[1080px] gap-3 sm:grid-cols-2 wide:grid-cols-4">
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
