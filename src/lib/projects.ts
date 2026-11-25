import projectsData from '@/data/projects.json';

export type PortfolioProject = (typeof projectsData)[number];

/**
 * Every project the site shows. `src/data/projects.json` is the only source.
 *
 * The home page and the command palette used to fetch a `projects` table from
 * the database on every visit and merge it in. The table holds eight seed rows
 * from January that the JSON had long since replaced, so the request, its CORS
 * preflight and the 53 kB client library that made them bought nothing: each
 * row was discarded as soon as it arrived. A portfolio's project list changes
 * when the repository does, and a build is the right time to read it.
 */
export const PROJECTS: PortfolioProject[] = projectsData;
