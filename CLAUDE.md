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

`src/data/projects.json` is the only source of the projects section, rendered
by `src/components/ProjectShowcase.tsx` (featured cards, project index and the
detail modal all live in that one file) and imported through
`src/lib/projects.ts`. The entry schema is documented in
`../reference/CLAUDE.md`. The `projects` table in the database is not read by
the site; see "What a visit costs" below.

Each featured card leads with `keyResults[0]`, so the first entry in that array
should be the project's strongest verifiable outcome — not a restatement of the
title.

What may be listed (the owner's rule, 2026-11-24): a project goes on the site
only if its GitHub repository is public. The two exceptions are Recap Verse and
WebAudioTV, which are private repositories behind live public products; they
carry a live-site link and no repository link. Check visibility with
`gh repo list VijaysinghPuwar --json name,visibility` before adding or keeping
an entry: repositories have been made private after their entry was written.
Removing an entry from `projects.json` takes it off the site. It does not take
it out of the database: the `projects` table is still served by the public REST
API and by the `mcp` function, so a project that must not be public also has to
be deleted there (Admin → Projects).

What may be claimed: only what the linked repository's README, its CI or its
release list shows, or what the owner has published himself on LinkedIn or the
résumé. Entries go stale in both directions, so re-read the README before
editing one: in November 2026 several described first versions of projects
that had since been rebuilt (the Nmap auditor was listed as a 179-line script
when it had 321 tests), and others carried figures nothing supported. There is
no "impact" or before/after view and there must not be one; the one that
existed listed controls the projects did not contain. The four cards are the
four projects the résumé names, set in `FEATURED_ORDER` in
`ProjectShowcase.tsx`.

The self-description in the hero (`MISSION` in `src/lib/terminal-commands.ts`),
the page metadata in `index.html` and the `focus` row follow the LinkedIn About
section. The experience, education and certification rows follow the LinkedIn
profile line for line. Change LinkedIn first, then the site.

## Design system

One accent colour, no gradients, no glows. Every surface, border and text tone
comes from a token in `src/index.css`; the `.theme-pentest` class overrides only
the accent, so anything written against `--primary` themes for free. Do not add
a second accent hue or reintroduce `bg-gradient-*`, coloured `box-shadow` or
`backdrop-blur` — the flat palette is the design, not a limitation of it.

Ambient motion is capped at two effects: the static rule grid behind the hero
(`CyberGrid`) and the section fade-up (`SectionReveal`). Anything beyond that
needs to earn its place by aiding comprehension.

The site is tested on a low-power Windows laptop (Intel UHD 630) and must stay
smooth there. Animate only `transform` and `opacity`; never loop
`background-position`, `box-shadow`, `filter` or `backdrop-filter`, which
repaint every frame (the grid's old `background-position` drift was the
single biggest cost of the idle page). The grid scrolls with the document
rather than being fixed. Any loop that keeps running (live glow, schematic
dots, timeline cursor) must sit under `usePauseOffscreen` so it stops when
scrolled away. Routes other than `/` are lazy-loaded; keep it that way.

The typewriter intro is paced to be watched once, not admired: about three
seconds end to end, and a click or any keystroke finishes it immediately.
Reduced motion never sees it type at all — including on the first load, which
the mode-switch guard alone used to miss.

Two more effects are scoped to a single moment rather than running on a loop,
which is why they are not counted as ambient. The hero schematic
(`SecurityDiagram`) draws its numbered chain one leg at a time on load and
again on a mode switch, and only starts its travelling dot once the route
exists. The terminal (`TerminalHero`) retypes its intro on a mode switch —
unless the reader has already run a command, in which case the transcript is
swapped in place. Both wait out the theme shutter by calling `sweepHold()` from
`src/lib/theme-transition.ts`, which is the single source of truth for how long
the plates cover the viewport; do not hardcode that delay a second time.

The terminal window does not change size, and the terminal does not scroll the
page. Both are structural, not corrections. The transcript (intro plus session)
is one scrolling screen whose height is the height of the finished intro: an
invisible copy of the intro sits in normal flow and sizes the box, and the real
transcript is laid over it (`absolute inset-0`) and scrolls. There is no
measuring and no resize handler, so it is right at every width and after a font
swap. The prompt and the CTAs sit outside the scroller and are in the layout
from the first frame (hidden until the intro is done), so nothing arrives late
and pushes. Do not give the card a `min-height`, a growing log, or a
`window.scrollBy` to keep the prompt in view: each of those is how it used to
resize six times during the intro and yank the page 344px on the first command.
The check: the card's height and the prompt's `top` must be identical before
and after any command.

A new answer is brought into view inside the screen with a short eased scroll
(about 170ms, instant under reduced motion). An answer taller than the screen
is shown from its first line, not its last.

The intro is driven by one `requestAnimationFrame` loop over a timeline worked
out up front, not a chain of per-character timeouts: a busy main thread drops a
character rather than stretching the pace. Keep it that way.

Command output is structured, not pre-formatted. A command returns `text`,
`row` (key, value, optional note) and `list` lines from
`src/lib/terminal-commands.ts`, and `TerminalHero` lays them out with CSS: rows
share a key column and let the value wrap or drop under its key, lists are a
grid of as many columns as fit. Nothing is padded with spaces to a column
count, and nothing scrolls sideways at any width. Do not reintroduce
`whitespace-pre` rows or a `COLUMNS` budget; the old 56-column rows were wider
than the card on every phone.

The commands the intro demonstrates all work: `whoami`, `ls`, `cat`, and
`./connect.sh` (an alias of `contact`; it is the banner's own last line and
used to answer `command not found`). Aliases are accepted, Tab completes to the
longest shared prefix and prints the candidates, `clear` wipes the screen but
not the history, PageUp/PageDown scroll the screen from the field, and an
unknown word gets a "did you mean". With a keyboard and no touch screen, typing
anywhere on the page while nothing has focus goes to the prompt.

Touch affordances key off `(pointer: coarse)` as well as the `sm` width — a
tablet has the same on-screen keyboard covering the same prompt and used to get
neither the tap row nor the docking. They are: a 16px input (anything smaller
makes iOS zoom the page on focus), a tap row of commands standing in for Tab
and the arrow keys, and the docking below.

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

Reduced motion is the site's decision, not the raw media query:
`src/lib/motion.ts` (mirrored by an inline script in `index.html`) writes
`<html data-motion="reduce">`. A choice made in the command palette wins;
otherwise Windows animates, because Chrome there reports `reduce` whenever the
OS "Animation effects" switch is off, which it is on plenty of fast machines;
everyone else follows the OS. Write CSS against `:root[data-motion="reduce"]`,
Tailwind against `reduced:`, and React against `useReducedMotion` from
`@/lib/motion` — never `@media (prefers-reduced-motion)` or `motion-reduce:`,
or Windows visitors get the static site again.

There is no animation library. Entrances are `tailwindcss-animate` classes
(`animate-in fade-in …`), which the global `data-motion="reduce"` rule in
`src/index.css` already switches off. framer-motion was removed in November
2026: it cost every visitor 38 kB to fade two dialogs in. Do not add it back
for an entrance.

`hover:` and `group-hover:` only apply on devices with a real hover
(`hoverOnlyWhenSupported`), so a tap on a phone cannot leave something zoomed.

Hover and focus timing for every `a`, `button` and `input` is set once, in the
unlayered rule at the top of `src/index.css` (120ms colour, 160ms transform).
Unlayered beats every Tailwind layer, so a `duration-*` utility on a control
does nothing; change the rule, not the element. Do not add hover effects to
things that cannot be pressed.

## What a visit costs

The backend is Lovable Cloud (Supabase underneath). Its usage page (project →
More → Usage) splits "Run" credits into Database, Compute and Network, and in
November 2026 Database was over 99% of Run. The database is billed for the
hours it is active, and it is active when something queries it: a page that
reads one row on load keeps it awake for every visitor, crawler and link
preview. Almost every visitor is a recruiter who will never sign in, so the
site is built to ask the backend for nothing on their behalf:

- A signed-out visitor on a public route makes **no request to the backend**
  and does not download the Supabase client. `useAuth` imports the client
  dynamically, and only when `sessionMayExist()` says there is something to
  restore: a stored session, an auth redirect in the URL, one of the sign-in
  routes, or the Lovable editor's frame. Anything that needs the backend for a
  signed-in reader (`reading-progress.ts`) imports it the same way. A static
  `import { supabase }` in a component that a public route renders undoes all
  of this at once; the only files allowed one are the pages behind sign-in
  (`Login`, `AuthCallback`, `OAuthConsent`, `Admin`).
- A signed-in page load reads the profile once and the role once, and writes
  nothing. `last_login_at` and the `log-auth-event` function run once per
  sign-in, keyed on the `last_sign_in_at` the auth server stamps. They used to
  run twice on every page load and again on every token refresh.
- Content is static. Projects, books and videos are JSON in `src/data/`; the
  home page used to fetch the `projects` table on every visit and throw the
  rows away. The GitHub strip calls GitHub's public API from the browser and
  caches the answer; there is no `github-activity` edge function (the client
  called one that was never deployed, a 404 and a preflight per visit).
- The edge functions that exist are `auth-email-hook`, `log-auth-event`, `mcp`
  and `send-contact-email`. None is called by a signed-out page.

`scripts/verify/auth-test.mjs` holds all of this to account: it blocks the
backend host in the browser and counts the attempts.

## Before pushing

`npm run verify`. It builds, serves the build, and drives it in headless Chrome
(no packages to install; it needs Node 22+ and Chrome): every terminal command
and key at five sizes, navigation, dialogs, the palette and the mobile menu,
the hero figure at each breakpoint, the backend-request budget above, and a
sweep of every route at every width for overflow, text spilling its box,
clipping and console errors. `main` is what vijaysinghpuwar.com serves about a
minute after a merge, and Vercel previews are behind a login, so this local run
against the production build is the test. When something visual breaks, fix it
and add the measurement to `scripts/verify/site-test.mjs` so it cannot come
back unnoticed.

## Layout and scrolling

Nothing below the hero moves after first paint. The GitHub strip
(`GitHubActivity`) is not lazy and has a fixed shape at every width: it holds
its rows open with blanks until GitHub answers and fades the data in over them.
Anything that loads late has to reserve its space the same way.

The hero schematic (`SecurityDiagram`) has three layouts and the site test
checks each: from 980px it fills the column beside the terminal; from 640px to
979px the hero is one column, and the figure is capped and centred under the
terminal with its caption centred beneath; below 640px it is not drawn. On a
tablet it is the network's hexagon that sits on the page's axis, not the
drawing's box (the Internet node makes the box lopsided); the padding that does
this is derived in a comment in the component. It shipped left-aligned on
tablets once and looked broken.

`<body>` uses `overflow-x: clip`, not `hidden`. `hidden` made it a scroll
container that never scrolls, which silently killed every `position: sticky` on
the site. To hold the page still behind an overlay use `lockScroll()` from
`src/lib/scroll-lock.ts`, which locks the root; locking `document.body` does
nothing here.

`ScrollReset` in `src/App.tsx` puts every pushed navigation at the top of the
new page. Do not add a `scrollTo(0, 0)` to a page.

The floating back-to-top button only renders from 1340px, where the page has a
margin for it. Below that it sat on top of the content.

On a phone the mode switch and the way into the command palette are rows in the
menu (`Navigation`), not icons in the bar. The palette's section names match
the bar's: Work, Journey, Capabilities.

## Personal data

The site and the repository are public. Nothing personal goes on either beyond
name, city, and the GitHub and LinkedIn handles.

- No phone number and no personal email address, anywhere: not on `/resume`,
  not in `scripts/resume/resume.html`, not in `public/resume.pdf`, not in
  `scripts/og/og.html`, not in a planning note. Regenerate the PDF from the
  HTML (command in that file) and check it with
  `pdftotext public/resume.pdf - | grep -E "@|[0-9]{10}"`, which must print
  nothing.
- The contact address is never rendered, in whole or in part, for a signed-out
  visitor. The card reads "Sign in to view". It used to show the first four
  letters and the domain, which anyone could complete.
- `src/lib/contact-email.ts` stores the address reversed so it is not a
  plaintext literal in the bundle or the repository. That defeats scrapers and
  code search. It is not access control, the file says so, and nobody should
  describe it as "protected" without that caveat: real gating needs a server
  that checks the session before returning the address.
- No personal photographs or certificate scans in the repository.

## Books

`/books` is a library of long-form guides, read in the site's own reader.
`scripts/import-epub.py <slug> <file.epub>` turns a pandoc EPUB into one
sanitised HTML fragment per chapter under `public/books/<slug>/`, WebP figures,
a 640px cover, and an entry in `src/data/books.json` (titles, parts, sections,
word counts). Re-run it to update a book; it replaces that book's files. The
script is the security boundary for `dangerouslySetInnerHTML` in the reader:
tags and attributes are allow-listed there, so loosen it there, carefully, or
not at all.

The shelf and each book page are public. Reading (`/books/:slug/read/:chapter`)
is behind `ProtectedRoute`. That gates the experience, not the text: the
fragments are static files and can be fetched directly.

Reading history lives in `src/lib/reading-progress.ts`: local first, synced to
the `reading_progress` table (one row per reader per book) on a debounce, and
merged per book on sign-in. If the table is missing it falls back to local
only, without errors, the same way `useAuth` treats a missing `profiles`.

The reader is paginated, not scrolled: a chapter is laid out in CSS columns
the size of the measured page frame (two side by side on a wide screen) and
slid sideways a spread at a time. Nothing on a page scrolls, so code wraps and
tables fit the width and continue onto the next page; do not reintroduce an
`overflow: auto` box inside `.book-pages`. The saved place is a fraction
through the chapter, not a page number, so it survives a different screen,
a rotation or a type-size change; page counts are display only. The library
shows a percentage, never a time estimate: these are text books, and an hour
figure reads as an audiobook length.

The reader has three page themes (Site, Plain, Paper) defined as `--r-*`
variables in `src/styles/books.css`; write reader UI against those, never the
site tokens, or it breaks on the light pages. Navigation, Footer and BackToTop
return null on reader routes (`isReaderPath`). Keys are bound in the
persistent `BookReader` shell and forwarded to the current chapter view.
