import { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, ChevronLeft, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CHANNEL_URL,
  VIDEOS,
  type Video,
  formatDuration,
  formatLength,
  formatPublished,
  getVideo,
  thumb,
} from '@/data/videos';

/*
  Videos: the list at /videos, one video at /videos/:slug.

  The player is a facade. Until someone presses play, the page holds a
  self-hosted WebP and nothing from YouTube: no iframe, no script, no cookie.
  A YouTube embed is roughly a megabyte of JavaScript and keeps a decoder
  busy on the low-power laptop this site is tested on, and most visitors to
  the page are skimming the list, not watching. The click that loads the
  iframe also starts it, so it never costs a second click.

  Chapters are the timestamps from each video's own description. Before the
  player loads, a chapter starts it at that point; once it is playing, a
  chapter seeks it in place through the IFrame API rather than reloading.
*/

export default function Videos() {
  const { slug } = useParams();
  if (slug) {
    const video = getVideo(slug);
    return video ? <VideoPage key={video.slug} video={video} /> : <VideoNotFound />;
  }
  return <VideoList />;
}

/* ── List ── */

function VideoList() {
  const total = VIDEOS.reduce((sum, v) => sum + v.duration, 0);
  return (
    <div className="min-h-[100dvh]">
      <Helmet>
        <title>Videos | Vijaysingh Puwar</title>
        <meta
          name="description"
          content="Technical videos by Vijaysingh Puwar: full courses and code walkthroughs built on real labs and real code bases, with every chapter linked."
        />
        <link rel="canonical" href="https://vijaysinghpuwar.com/videos" />
      </Helmet>

      <div className="page-gutter container mx-auto max-w-[1180px] pb-24 pt-28 sm:pt-32">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-[640px]">
            <p className="section-heading">Channel</p>
            <h1 className="section-title mt-3">Videos</h1>
            <p className="mt-4 text-[15.5px] leading-relaxed text-muted-foreground">
              Courses and walkthroughs built on my own labs and code. Every command output and
              code panel on screen comes from the real thing.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-5">
            <span className="font-mono text-[12px] tabular-nums text-muted-dim">
              {VIDEOS.length} videos · {formatLength(total)}
            </span>
            <a
              href={CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline inline-flex h-10 items-center gap-1.5 rounded-md px-4 text-[13.5px] font-medium"
            >
              YouTube channel <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </header>

        <ol className="mt-12 border-t border-border sm:mt-14">
          {VIDEOS.map((v, i) => (
            <li key={v.slug} className="border-b border-border">
              <VideoRow video={v} eager={i < 2} />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function VideoRow({ video, eager }: { video: Video; eager: boolean }) {
  return (
    <Link
      to={`/videos/${video.slug}`}
      className="group grid gap-4 py-6 sm:grid-cols-[minmax(0,320px)_minmax(0,1fr)] sm:gap-7 sm:py-7"
    >
      <Thumbnail video={video} size="sm" eager={eager} />
      <div className="min-w-0 self-center">
        <p className="meta-label">{video.kicker}</p>
        <h2 className="mt-2 text-[19px] font-semibold leading-[1.3] tracking-[-0.015em] text-foreground transition-colors group-hover:text-primary sm:text-[21px]">
          {video.title}
        </h2>
        <p className="mt-2 line-clamp-2 max-w-[68ch] text-[14.5px] leading-[1.6] text-muted-foreground">
          {video.summary}
        </p>
        <p className="mt-3 font-mono text-[11.5px] tabular-nums text-muted-dim">
          {formatPublished(video.published)} · {formatLength(video.duration)} · {video.chapters.length} chapters
        </p>
      </div>
    </Link>
  );
}

function Thumbnail({ video, size, eager }: { video: Video; size: 'sm' | 'lg'; eager?: boolean }) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-card">
      <img
        src={thumb(video, size)}
        alt=""
        width={size === 'sm' ? 640 : 1280}
        height={size === 'sm' ? 360 : 720}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className="h-full w-full object-cover"
      />
      <span className="absolute bottom-2 right-2 rounded-[4px] bg-background px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-foreground">
        {formatDuration(video.duration)}
      </span>
    </div>
  );
}

/* ── One video ── */

const YT_ORIGIN = 'https://www.youtube-nocookie.com';

function VideoPage({ video }: { video: Video }) {
  const [params] = useSearchParams();
  // ?t=600 (seconds) is how a chapter link is shared; it cues, it does not autoplay.
  const initialStart = Math.max(0, Math.min(video.duration - 1, Number(params.get('t')) || 0));
  const [start, setStart] = useState<number | null>(null);
  const [current, setCurrent] = useState<number | null>(initialStart ? initialStart : null);
  const frame = useRef<HTMLIFrameElement>(null);
  const playerTop = useRef<HTMLDivElement>(null);
  // True once the player inside the iframe has answered. A command posted
  // before that is dropped without a trace, so until then a chapter reloads
  // the iframe at its start time instead of trying to seek.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (start === null) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== YT_ORIGIN || e.source !== frame.current?.contentWindow) return;
      setReady(true);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [start]);

  /** The IFrame API handshake: after this the player posts its state back. */
  const listen = useCallback(() => {
    setReady(false);
    frame.current?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 'player' }), YT_ORIGIN);
  }, []);

  const play = useCallback((t: number) => {
    setCurrent(t);
    if (start !== null && ready) {
      const post = (func: string, args: unknown[] = []) =>
        frame.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), YT_ORIGIN);
      post('seekTo', [t, true]);
      post('playVideo');
    } else {
      setReady(false);
      setStart(t);
    }
    // A chapter list below the fold should bring the player back into view.
    const top = playerTop.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) playerTop.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [start, ready]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const others = VIDEOS.filter(v => v.slug !== video.slug);
  const src =
    start === null
      ? null
      : `${YT_ORIGIN}/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&start=${start}&origin=${encodeURIComponent(window.location.origin)}`;

  return (
    <div className="min-h-[100dvh]">
      <Helmet>
        <title>{`${video.title} | Videos | Vijaysingh Puwar`}</title>
        <meta name="description" content={video.summary} />
        <link rel="canonical" href={`https://vijaysinghpuwar.com/videos/${video.slug}`} />
        <meta property="og:type" content="video.other" />
        <meta property="og:title" content={video.title} />
        <meta property="og:image" content={`https://vijaysinghpuwar.com${thumb(video)}`} />
      </Helmet>

      <div className="page-gutter container mx-auto max-w-[1180px] pb-24 pt-24 sm:pt-28">
        <Link
          to="/videos"
          className="-ml-2 inline-flex h-11 items-center gap-1 rounded-md px-2 text-[14px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Videos
        </Link>

        <div className="mt-4 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
          <div className="min-w-0">
            <div ref={playerTop} className="scroll-mt-20">
              {src ? (
                <div className="aspect-video overflow-hidden rounded-lg border border-border bg-black">
                  <iframe
                    ref={frame}
                    key={src}
                    src={src}
                    onLoad={listen}
                    title={video.title}
                    className="h-full w-full"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => play(initialStart)}
                  aria-label={`Play ${video.title}${initialStart ? ` from ${formatDuration(initialStart)}` : ''}`}
                  className="group relative block w-full text-left"
                >
                  <Thumbnail video={video} size="lg" eager />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-105 sm:h-[72px] sm:w-[72px]">
                      <Play className="ml-1 h-7 w-7 fill-current" aria-hidden="true" />
                    </span>
                  </span>
                </button>
              )}
              {!src && (
                <p className="mt-2.5 text-[12.5px] text-muted-dim">
                  Plays from YouTube. Nothing loads from YouTube until you press play.
                </p>
              )}
            </div>

            <p className="meta-label mt-8">{video.kicker}</p>
            <h1 className="mt-3 text-[26px] font-semibold leading-[1.2] tracking-[-0.02em] text-foreground sm:text-[32px]">
              {video.title}
            </h1>

            <dl className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border">
              {[
                { label: 'Published', value: formatPublished(video.published) },
                { label: 'Length', value: formatLength(video.duration) },
                { label: 'Chapters', value: String(video.chapters.length) },
              ].map(f => (
                <div key={f.label} className="bg-background px-4 py-3">
                  <dt className="meta-label">{f.label}</dt>
                  <dd className="mt-1 text-[14px] font-medium tabular-nums text-foreground">{f.value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 max-w-[68ch] text-[15.5px] leading-relaxed text-muted-foreground">{video.summary}</p>

            <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Topics">
              {video.topics.map(t => (
                <li key={t} className="rounded-[5px] border border-border px-2 py-0.5 font-mono text-[11.5px] text-muted-foreground">
                  {t}
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <a
                href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="gradient-btn inline-flex h-10 items-center gap-1.5 rounded-md px-4 text-[13.5px]"
              >
                Watch on YouTube <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
              {video.related.map(r =>
                r.href.startsWith('/') ? (
                  <Link key={r.href} to={r.href} className="btn-outline inline-flex h-10 items-center rounded-md px-4 text-[13.5px] font-medium">
                    {r.label}
                  </Link>
                ) : (
                  <a
                    key={r.href}
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline inline-flex h-10 items-center gap-1.5 rounded-md px-4 text-[13.5px] font-medium"
                  >
                    {r.label} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                ),
              )}
            </div>
          </div>

          <aside aria-labelledby="chapters" className="min-w-0">
            <div className="lg:sticky lg:top-24">
              <div className="flex items-baseline justify-between">
                <h2 id="chapters" className="section-heading">Chapters</h2>
                <span className="font-mono text-[11px] tabular-nums text-muted-dim">{video.chapters.length}</span>
              </div>
              <ol className="mt-3 border-t border-border lg:max-h-[calc(100dvh-10rem)] lg:overflow-y-auto">
                {video.chapters.map((c, i) => {
                  const active = current !== null && c.t <= current && (video.chapters[i + 1]?.t ?? Infinity) > current;
                  return (
                    <li key={c.t}>
                      <button
                        type="button"
                        onClick={() => play(c.t)}
                        aria-current={active ? 'true' : undefined}
                        className={cn(
                          'grid w-full grid-cols-[64px_minmax(0,1fr)] items-baseline gap-3 border-b border-border py-2.5 text-left text-[14px] transition-colors',
                          active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        <span className={cn('font-mono text-[12px] tabular-nums', active ? 'text-primary' : 'text-muted-dim')}>
                          {formatDuration(c.t)}
                        </span>
                        <span>{c.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </aside>
        </div>

        {others.length > 0 && (
          <section aria-labelledby="more" className="mt-20">
            <h2 id="more" className="section-heading">More videos</h2>
            <ul className="mt-5 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {others.map(v => (
                <li key={v.slug}>
                  <Link to={`/videos/${v.slug}`} className="group block">
                    <Thumbnail video={v} size="sm" />
                    <p className="meta-label mt-3">{v.kicker}</p>
                    <p className="mt-1.5 text-[15.5px] font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                      {v.title}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

function VideoNotFound() {
  return (
    <div className="page-gutter container mx-auto flex min-h-[70dvh] max-w-[640px] flex-col items-start justify-center pt-24">
      <Helmet>
        <title>Video not found | Vijaysingh Puwar</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <p className="section-heading">Channel</p>
      <h1 className="section-title mt-3">That video is not here.</h1>
      <p className="mt-4 text-muted-foreground">The link may be old, or the video may have been renamed.</p>
      <Link to="/videos" className="gradient-btn mt-7 inline-flex h-11 items-center rounded-md px-6 text-[15px]">
        See all videos
      </Link>
    </div>
  );
}
