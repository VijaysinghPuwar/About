# About — portfolio site

## Project reference material

Full notes and repo metadata for every project live one level up, in
**`../reference/`** (outside this git repo, so it is never committed).

Start with `../reference/INDEX.md` — it lists all 82 Obsidian project notes and
49 repos, and marks which ones already have an entry in
`src/data/projects.json` and which do not. `../reference/CLAUDE.md` explains the
layout and the workflow for adding a project to the site.

When asked to update the projects section, read that index first rather than
searching the Desktop. `../reference/PROMPTS.md` has ready-made prompts for the
common tasks (survey gaps, add an entry, audit the existing ones).

## Project data

`src/data/projects.json` drives the projects section, rendered by
`src/components/ProjectShowcase.tsx` (featured cards, project index and the
detail modal all live in that one file). The entry schema is documented in
`../reference/CLAUDE.md`.

Each featured card leads with `keyResults[0]`, so the first entry in that array
should be the project's strongest verifiable outcome — not a restatement of the
title.

## Design system

One accent colour, no gradients, no glows. Every surface, border and text tone
comes from a token in `src/index.css`; the `.theme-pentest` class overrides only
the accent, so anything written against `--primary` themes for free. Do not add
a second accent hue or reintroduce `bg-gradient-*`, coloured `box-shadow` or
`backdrop-blur` — the flat palette is the design, not a limitation of it.

Ambient motion is capped at two effects: the static rule grid behind the hero
(`CyberGrid`) and the section fade-up (`SectionReveal`). Anything beyond that
needs to earn its place by aiding comprehension.

Two more effects are scoped to a single moment rather than running on a loop,
which is why they are not counted as ambient. The hero schematic
(`SecurityDiagram`) draws its numbered chain one leg at a time on load and
again on a mode switch, and only starts its travelling dot once the route
exists. The terminal (`TerminalHero`) retypes its intro on a mode switch —
unless the reader has already run a command, in which case the transcript is
swapped in place. Both wait out the theme shutter by calling `sweepHold()` from
`src/lib/theme-transition.ts`, which is the single source of truth for how long
the plates cover the viewport; do not hardcode that delay a second time.

On phones the terminal is the whole hero, so it carries its own affordances: a
16px input (anything smaller makes iOS zoom the page on focus), a tap row of
commands standing in for Tab and the arrow keys, and command output that
scrolls sideways instead of wrapping its columns.

When the on-screen keyboard is up, the prompt is pinned to the bottom of the
layout viewport with `position: fixed`, offset by the height `visualViewport`
says the keyboard covers — it does not scroll the page to keep the prompt in
view. iOS is scrolling the visual viewport at the same time, so a scroll of our
own is either fought or undone and the prompt ends up off screen anyway. A
spacer holds the prompt's place in the card, and the page is scrolled once so
the end of the transcript meets the bar. In landscape, where there may be only
a couple of hundred points above the keyboard, the shortcut row drops out of
the bar.

The theme switch is the one deliberate exception, and it is not ambient — it
only ever runs on a click. `src/lib/theme-transition.ts` closes a shutter of
plates over the viewport, swaps the class behind it, holds long enough for the
mode name to be read, and reopens, with a synthesized WebAudio cue on the same
timeline. It is the only sound on the site; the command palette can mute it.
Both the plates and the audio are skipped entirely under
`prefers-reduced-motion`.
