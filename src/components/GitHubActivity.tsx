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

export function GitHubActivity() {
  const [data, setData] = useState<Activity | null>(null);
  /** Index of the day under the cursor or keyboard focus, if any. */
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    let live = true;

    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        const v = cached?.v;
        const usable =
          v &&
          Array.isArray(v.repos) &&
          Array.isArray(v.days) &&
          typeof v.total === 'number' &&
          (v.days.length === 0 || typeof v.days[0] === 'object') &&
          (v.unit === 'pushes' || v.unit === 'contributions');
        if (usable && Date.now() - cached.t < TTL) {
          setData(v);
          return;
        }
      }
    } catch {
      /* A locked-down profile throws on read; fall through to the network. */
    }

    load()
      .then(result => {
        if (!live || !result) return;
        setData(result);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), v: result }));
        } catch {
          /* Storage full or blocked: the strip still renders this visit. */
        }
      })
      .catch(() => {
        /* Offline, rate limited, or blocked. The strip stays absent. */
      });

    return () => {
      live = false;
    };
  }, []);

  // Nothing to say yet, or nothing verifiable to say. Either way, say nothing:
  // a placeholder here would be a claim about activity that was never checked.
  if (!data) return null;

  const peak = Math.max(1, ...data.days.map(d => d.count));
  const shown = active === null ? null : data.days[active];

  /** "25 Aug", in the reader's locale rather than an ISO string. */
  const dayLabel = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

  return (
    <div className="page-gutter container mx-auto max-w-[1180px]">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 border-y border-border py-[18px]">
        <div className="flex flex-none items-center gap-2.5">
          <span
            aria-hidden="true"
            className="h-[7px] w-[7px] animate-pulse rounded-full bg-primary motion-reduce:animate-none"
          />
          <span className="font-mono text-[11.5px] tracking-[0.14em] text-muted-dim">
            CURRENTLY BUILDING
          </span>
        </div>

        {/* The links sit directly in the strip rather than inside a nested
            flex-1 box. That wrapper was allowed to shrink below its own
            content (`min-w-0`) while its children refused to shrink, so on a
            narrow screen the links spilled out of it and were drawn straight
            over the push total. With one wrapping row there is nothing to
            spill out of: a link that does not fit moves to the next line. */}
        {data.repos.map(repo => (
          <a
            key={repo.name}
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-none items-baseline gap-2 whitespace-nowrap font-mono text-[13px] text-foreground transition-colors hover:text-primary"
          >
            {repo.name}
            <span className="text-[12px] text-muted-dim">{repo.when}</span>
          </a>
        ))}

        {data.total > 0 && (
          <>
            {/* The chart is the widest thing in the row at roughly 240px, and
                below the two-column breakpoint it is what turns a one-line
                strip into a five-line block. The count beside it carries the
                same fact in a tenth of the width, so the bars are what goes. */}
            {/* Thirty days, each one a link into that date on GitHub.

                The bars used to carry a native `title` and nothing else, which
                is a tooltip you have to wait for and cannot read on a phone.
                Each bar is now a real destination: GitHub's own contribution
                view accepts a from/to range, so a click lands on that exact
                day. Hovering or tabbing to one lifts it, dims its neighbours,
                and prints the day beside the chart rather than over it, so
                nothing is covered while you read across.

                The hit area is padded well beyond the 5px of ink, because a
                5px target with a 3px gap is not a target. */}
            <div
              className="group/chart hidden h-6 flex-none items-end gap-[3px] wide:flex"
              onMouseLeave={() => setActive(null)}
            >
              {data.days.map((day, i) => (
                <a
                  key={day.date}
                  href={`https://github.com/${USER}?tab=overview&from=${day.date}&to=${day.date}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  aria-label={`${day.count} ${day.count === 1 ? UNIT_ONE[data.unit] : data.unit} on ${day.date}`}
                  className="flex h-6 items-end px-px py-1 -my-1 outline-offset-4"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'block w-[5px] rounded-[1.5px] transition-[transform,opacity,background-color] duration-150 ease-out motion-reduce:transition-none',
                      day.count ? 'bg-primary' : 'bg-border-strong',
                      /* The hovered bar grows from its base; the rest step
                         back so the one being read is the one that reads. */
                      active === i
                        ? 'origin-bottom scale-x-[1.6] scale-y-125 opacity-100'
                        : active !== null && 'opacity-40',
                    )}
                    style={{ height: day.count ? `${Math.max(4, Math.round((day.count / peak) * 22))}px` : '2px' }}
                  />
                </a>
              ))}
            </div>
            {/* One line, two jobs: the thirty-day total at rest, and the day
                under the cursor while there is one. Reserving the width stops
                the row reflowing as you sweep across the chart. */}
            <span
              className="flex-none whitespace-nowrap font-mono text-[11.5px] text-muted-dim wide:min-w-[17rem]"
              aria-live="polite"
            >
              {shown ? (
                <>
                  <span className="text-foreground">{dayLabel(shown.date)}</span>
                  {' · '}
                  <span className={shown.count ? 'text-primary' : undefined}>
                    {shown.count} {shown.count === 1 ? UNIT_ONE[data.unit] : data.unit}
                  </span>
                  {shown.repos.length > 0 && ` · ${shown.repos.join(', ')}`}
                </>
              ) : (
                `${data.total} ${data.unit}, ${DAYS}d`
              )}
            </span>
          </>
        )}

        <a
          href={`https://github.com/${USER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-none whitespace-nowrap border-b border-border-strong font-mono text-[12.5px] text-muted-dim transition-colors hover:text-primary"
        >
          github ↗
        </a>
      </div>
    </div>
  );
}
