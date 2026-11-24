import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/*
  A one-line proof that the work is ongoing.

  Three most recently pushed public repositories, a thirty-day sparkline, and a
  link out. It is a strip rather than a panel on purpose: the page was already
  called cluttered, and "is this person still building" is a question worth one
  line, not a section.

  Everything here comes from GitHub's unauthenticated REST API, so there is no
  token in the bundle and nothing to leak. That has two consequences worth
  knowing. Private repositories never appear, and the visitor's own IP carries
  the rate limit of sixty requests an hour, which is why the answer is cached
  for six hours rather than fetched on every page view.

  The chart has two sources and prefers the better one.

  When the `github-activity` edge function is deployed, it answers with real
  daily contribution counts from GitHub's GraphQL API, private repositories
  included, and the label reads "contributions". That function holds the token
  server-side; see `supabase/functions/github-activity/index.ts`.

  Without it, the component falls back to the public REST feed and counts
  pushes instead. The obvious thing to count would be commits, and the design
  this came from tried to take them from `payload.commits`, but the public
  events feed for this account returns PushEvent payloads carrying only
  `before`, `head`, `push_id`, `ref` and `repository_id`. There is no commit
  count in there to read, under that key or under `size`, so a commit chart
  built on it would have been thirty empty bars and a total of zero. A push is
  what that feed actually knows, so a push is what the label says.
*/

const USER = 'VijaysinghPuwar';
const CACHE_KEY = 'vj-gh-activity-v3';
const TTL = 6 * 60 * 60 * 1000;
const DAYS = 30;

/** Singular forms, so a bar title never does string surgery mid-render. */
const UNIT_ONE = { pushes: 'push', contributions: 'contribution' } as const;

interface Repo {
  name: string;
  when: string;
  url: string;
}

/** One day of the chart. `repos` is what was pushed to, deduped. */
interface Day {
  date: string;
  count: number;
  repos: string[];
}

interface Activity {
  repos: Repo[];
  /** Oldest first. */
  days: Day[];
  total: number;
  /** What a bar represents, which depends on which source answered. */
  unit: 'contributions' | 'pushes';
  /** Only known from the authenticated source. */
  privateCount?: number;
}

/**
 * Age only, at its shortest.
 *
 * This used to read "pushed 2d ago", which spends the words "pushed" and
 * "ago" three times over on a strip whose whole job is to be read at a glance.
 * The heading already says these are things being built, and a bare age next
 * to a repository name cannot mean anything else.
 */
function ago(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d`;
  return `${Math.floor(days / 30)}mo`;
}

function dayKeys(): string[] {
  const out: string[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    out.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
  }
  return out;
}

/**
 * Real contribution counts, private work included, when the edge function is
 * deployed. Returns null on any failure so the caller falls back quietly.
 */
async function loadAuthenticated(): Promise<Omit<Activity, 'repos'> | null> {
  const base = import.meta.env.VITE_SUPABASE_URL;
  if (!base) return null;
  try {
    const res = await fetch(`${base}/functions/v1/github-activity`, {
      headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '' },
    });
    if (!res.ok) return null;
    const body = await res.json();
    if (!Array.isArray(body?.days) || body.days.length === 0) return null;
    return {
      days: body.days.map((d: { date: string; count: number }) => ({
        date: d.date,
        count: d.count ?? 0,
        // The authenticated source counts contributions, not pushes, so it
        // cannot attribute them to a repository. The readout says so.
        repos: [],
      })),
      total: body.total ?? 0,
      unit: 'contributions',
      privateCount: body.privateCount ?? 0,
    };
  } catch {
    return null;
  }
}

async function load(): Promise<Activity | null> {
  const [reposRes, eventsRes] = await Promise.all([
    fetch(`https://api.github.com/users/${USER}/repos?sort=pushed&per_page=3`),
    fetch(`https://api.github.com/users/${USER}/events/public?per_page=100`),
  ]);

  // A rate-limited or failed call renders nothing rather than a stale claim.
  if (!reposRes.ok) return null;

  const repoList = await reposRes.json();
  if (!Array.isArray(repoList) || repoList.length === 0) return null;

  const repos: Repo[] = repoList.map((r: { name: string; pushed_at: string; html_url: string }) => ({
    name: r.name,
    when: ago(r.pushed_at),
    url: r.html_url,
  }));

  const keys = dayKeys();
  const index = new Map(keys.map((k, i) => [k, i]));
  const days: Day[] = keys.map(date => ({ date, count: 0, repos: [] }));
  let total = 0;

  if (eventsRes.ok) {
    const events = await eventsRes.json();
    if (Array.isArray(events)) {
      for (const e of events) {
        if (e?.type !== 'PushEvent') continue;
        const i = index.get(String(e.created_at ?? '').slice(0, 10));
        if (i === undefined) continue;
        days[i].count += 1;
        total += 1;
        // The repo behind each push, so a day can say what was worked on and
        // not merely that something was.
        const name = String(e.repo?.name ?? '').split('/').pop();
        if (name && !days[i].repos.includes(name)) days[i].repos.push(name);
      }
    }
  }

  // The authenticated source is strictly better when it is available: it sees
  // private work, and it counts contributions rather than pushes.
  const authed = await loadAuthenticated();
  if (authed) return { repos, ...authed };

  return { repos, days, total, unit: 'pushes' };
}

/** A fresh answer from an earlier visit, read before the first render. */
function readCache(): Activity | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    const v = cached?.v;
    const usable =
      v &&
      Array.isArray(v.repos) &&
      Array.isArray(v.days) &&
      typeof v.total === 'number' &&
      (v.days.length === 0 || typeof v.days[0] === 'object') &&
      (v.unit === 'pushes' || v.unit === 'contributions');
    return usable && Date.now() - cached.t < TTL ? v : null;
  } catch {
    // A locked-down profile throws on read; the network answers instead.
    return null;
  }
}

/** Holds the rows open while the first answer is on its way. */
const PENDING: Repo[] = [
  { name: ' ', when: '', url: '' },
  { name: ' ', when: '', url: '' },
  { name: ' ', when: '', url: '' },
];

/*
  The strip has a fixed shape at every width, and takes its place in the page
  before GitHub has answered.

  It used to render nothing until the data arrived and then appear, which on a
  first visit pushed everything below the hero down by 95px on a desktop and
  150px on a phone, a second or two after the page had settled. It also wrapped
  however the three repository names happened to fall, which left the total and
  the GitHub link stranded on a second row under nothing in particular.

  So the layout no longer depends on the data:

    - phone: the label and the total share a row; the repositories are a list
      beneath, one to a row, each name truncated if it has to be.
    - tablet: the same two rows, with the repositories set along the second.
    - desktop: one row. Names shrink before anything wraps, and the third
      repository waits for a wider screen.

  Until the answer lands the rows are held open by blanks and the data fades
  in over them. If GitHub never answers (rate limit, offline), the strip folds
  down to its label and a plain link: that is a small shift, but only for the
  visitor it failed for, and it makes no claim about activity it did not check.
*/
export function GitHubActivity() {
  // Read synchronously, so a returning visitor's first frame already has it.
  const [data, setData] = useState<Activity | null>(readCache);
  const [failed, setFailed] = useState(false);
  /** Index of the day under the cursor or keyboard focus, if any. */
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    if (data) return;
    let live = true;

    load()
      .then(result => {
        if (!live) return;
        if (!result) { setFailed(true); return; }
        setData(result);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), v: result }));
        } catch {
          /* Storage full or blocked: the strip still renders this visit. */
        }
      })
      .catch(() => {
        /* Offline, rate limited, or blocked. */
        if (live) setFailed(true);
      });

    return () => {
      live = false;
    };
    // Runs once: the cache either answered at mount or it did not.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const profile = `https://github.com/${USER}`;
  const label = (
    <div className="flex min-w-0 items-center gap-2.5">
      {/* Still, not pulsing. The label says the work is current; a blinking
          light beside it was a second thing saying the same. */}
      <span aria-hidden="true" className="h-[7px] w-[7px] flex-none rounded-full bg-primary" />
      <span className="whitespace-nowrap font-mono text-[11px] tracking-[0.1em] text-muted-dim sm:text-[11.5px] sm:tracking-[0.14em]">
        CURRENTLY BUILDING
      </span>
    </div>
  );

  if (failed) {
    return (
      <div className="page-gutter container mx-auto max-w-[1180px]">
        <div className="flex items-center justify-between gap-6 border-y border-border py-[18px]">
          {label}
          <a
            href={profile}
            target="_blank"
            rel="noopener noreferrer"
            className="tap-44 whitespace-nowrap font-mono text-[12.5px] text-muted-foreground transition-colors hover:text-primary"
          >
            github.com/{USER} ↗
          </a>
        </div>
      </div>
    );
  }

  const ready = data !== null;
  const repos = data?.repos ?? PENDING;
  const days = data?.days ?? [];
  const unit = data?.unit ?? 'pushes';
  const peak = Math.max(1, ...days.map(d => d.count));
  const shown = active === null ? null : days[active];
  const reveal = cn('transition-opacity duration-300', ready ? 'opacity-100' : 'opacity-0');

  /** "25 Aug", in the reader's locale rather than an ISO string. */
  const dayLabel = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

  return (
    <div className="page-gutter container mx-auto max-w-[1180px]">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1 border-y border-border py-[18px] sm:gap-y-2 wide:flex">
        <div className="col-start-1 row-start-1">{label}</div>

        <ul
          className={cn(
            'col-span-2 row-start-2 flex min-w-0 flex-col sm:flex-row sm:gap-6 wide:flex-1',
            reveal,
          )}
        >
          {repos.map((repo, i) => (
            <li
              key={ready ? repo.name : i}
              // Three fit beside the chart from 1280px; between there and the
              // desktop breakpoint the row has room for two.
              className={cn('min-w-0', i === 2 && 'wide:max-xl:hidden')}
            >
              <a
                href={repo.url || profile}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={ready ? undefined : -1}
                className="flex items-baseline justify-between gap-2 py-1.5 font-mono text-[13px] text-foreground transition-colors hover:text-primary sm:justify-start sm:py-2 wide:py-0"
              >
                <span className="truncate">{repo.name}</span>
                <span className="flex-none text-[12px] text-muted-dim">{repo.when}</span>
              </a>
            </li>
          ))}
        </ul>

        {/* Thirty days, each one a link into that date on GitHub.

            Hovering or tabbing to a bar lifts it, dims its neighbours, and
            prints the day in the total's place beside the chart, so nothing
            is covered while you read across. The hit area is the full height
            of the row, because 4px of ink is not a target.

            Desktop only: on a phone the count beside it carries the same fact
            in a tenth of the width. */}
        <div
          className={cn('hidden h-6 flex-none items-end gap-[2px] wide:flex', reveal)}
          onMouseLeave={() => setActive(null)}
        >
          {days.map((day, i) => (
            <a
              key={day.date}
              href={`${profile}?tab=overview&from=${day.date}&to=${day.date}`}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              aria-label={`${day.count} ${day.count === 1 ? UNIT_ONE[unit] : unit} on ${day.date}`}
              className="flex h-6 items-end outline-offset-4"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'block w-[4px] origin-bottom rounded-[1px] transition-[transform,opacity] duration-100 ease-out',
                  day.count ? 'bg-primary' : 'bg-border-strong',
                  /* The hovered bar grows from its base; the rest step back
                     so the one being read is the one that reads. */
                  active === i ? 'scale-x-150 scale-y-125' : active !== null && 'opacity-40',
                )}
                style={{ height: day.count ? `${Math.max(4, Math.round((day.count / peak) * 19))}px` : '2px' }}
              />
            </a>
          ))}
        </div>

        {/* One slot, two jobs: the thirty-day total at rest, and the day under
            the cursor while there is one. The width is reserved on a desktop
            so the row does not reflow as you sweep across the chart. */}
        <a
          href={profile}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={ready ? undefined : -1}
          aria-live="polite"
          className={cn(
            'tap-44 col-start-2 row-start-1 flex-none whitespace-nowrap text-right font-mono text-[11.5px] text-muted-dim transition-colors hover:text-primary wide:min-w-[21ch]',
            reveal,
          )}
        >
          {shown ? (
            <>
              <span className="text-foreground">{dayLabel(shown.date)}</span>
              {' · '}
              <span className={shown.count ? 'text-primary' : undefined}>
                {shown.count} {shown.count === 1 ? UNIT_ONE[unit] : unit}
              </span>
            </>
          ) : (
            <>{ready ? `${data.total} ${unit}, ${DAYS}d` : ' '} ↗</>
          )}
        </a>
      </div>
    </div>
  );
}
