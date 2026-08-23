/**
 * A narrow event channel between the hero terminal and the sections it drives.
 *
 * The terminal sits in the hero and the projects grid owns its own selection
 * and expansion state. Threading callbacks from one to the other would mean
 * lifting that state into the page for the sake of a single caller, so they
 * talk over two named window events instead. Typed helpers on both ends keep
 * the payloads honest.
 */

const OPEN_PROJECT = 'portfolio:open-project';
const FILTER_SKILL = 'portfolio:filter-skill';

export interface OpenProjectDetail {
  /** Project id, matched case-insensitively against id and title. */
  query: string;
}

export interface FilterSkillDetail {
  label: string;
  aliases: string[];
}

function emit<T>(name: string, detail: T) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<T>(name, { detail }));
}

function listen<T>(name: string, handler: (detail: T) => void) {
  if (typeof window === 'undefined') return () => undefined;
  const wrapped = (event: Event) => handler((event as CustomEvent<T>).detail);
  window.addEventListener(name, wrapped);
  return () => window.removeEventListener(name, wrapped);
}

export const emitOpenProject = (detail: OpenProjectDetail) =>
  emit<OpenProjectDetail>(OPEN_PROJECT, detail);

export const onOpenProject = (handler: (detail: OpenProjectDetail) => void) =>
  listen<OpenProjectDetail>(OPEN_PROJECT, handler);

export const emitFilterSkill = (detail: FilterSkillDetail) =>
  emit<FilterSkillDetail>(FILTER_SKILL, detail);

export const onFilterSkill = (handler: (detail: FilterSkillDetail) => void) =>
  listen<FilterSkillDetail>(FILTER_SKILL, handler);

/** Scrolls a section into view allowing for the fixed navigation bar. */
export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY - 64,
    behavior: 'smooth',
  });
}
