import projectsData from '@/data/projects.json';
import type { Project as DbProject } from '@/hooks/useProjects';

export type PortfolioProject = (typeof projectsData)[number];

/**
 * The project list the home page shows: projects.json plus any row that exists
 * only in the database.
 *
 * projects.json is the maintained source and wins on a shared id. The
 * database still holds January seed copies of eight entries that were never
 * updated, and letting them win hid every later edit to those projects. A
 * row that exists only in the database is still shown.
 *
 * Shared by the home page and the command palette so both count and open the
 * same set of projects.
 */
export function mergeProjects(dbProjects: readonly DbProject[] | null | undefined) {
  const jsonIds = new Set(projectsData.map(p => p.id));
  const normalized = (dbProjects || []).filter(p => !jsonIds.has(p.id)).map(p => ({
    id: p.id, title: p.title, description: p.description || '', category: p.category || '',
    tech: p.tech || [], year: p.year || '', status: p.status || 'completed',
    featured: p.featured || false, keyResults: p.key_results || [],
    links: { github: p.github_link, writeup: p.writeup_link, demo: p.demo_link },
    image: p.image || '', tags: p.tags || [],
  }));
  return [...normalized, ...projectsData];
}
