import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MutableRefObject } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ReaderContents } from '@/components/books/ReaderContents';
import { ReaderSettingsPanel } from '@/components/books/ReaderSettingsPanel';
import {
  type Book,
  type BookChapter,
  chapterIndex,
  chapterLabel,
  chapterUrl,
  formatPercent,
  getBook,
  loadChapter,
  shortTitle,
} from '@/lib/books';
import { type BookProgress, flushReadingProgress, recordPosition, useReadingProgress } from '@/lib/reading-progress';
import { type ReaderSettings, TEXT_SIZES, useReaderSettings } from '@/lib/reader-settings';
import { cn } from '@/lib/utils';
import { BookNotFound } from '@/pages/BookDetail';
import '@/styles/books.css';

/*
  The reader: pages, not a scroll.

  A chapter is laid out with CSS columns, each exactly the size of the page
  frame, and the strip of columns is slid sideways one page at a time. On a
  wide screen two columns sit side by side as an open spread; on a tablet or
  phone, one. The frame is measured, not assumed, so rotating a phone or
  resizing a window re-paginates and keeps the reader on the same passage.

  Turning: tap the right or left edge, swipe (touch; the page follows the
  finger), the arrow buttons in the margins, ← → / Space / Page Up and Down,
  or a trackpad swipe. Past the last page is the next chapter; back from the
  first is the previous chapter, opened at its last page.

  Nothing on a page scrolls: code listings wrap, and tables fit the page
  width and continue onto the next page row by row, as they would in print.

  The place is recorded on every turn as a fraction through the chapter, so a
  place saved on a phone (one page per screen) opens on the right spread on a
  desktop, and survives a change of type size.
*/

const PAGE_BG: Record<ReaderSettings['page'], string> = {
  site: '',
  plain: '#ffffff',
  paper: '#f6f0e3',
};

/** What a chapter view exposes to the shell's keyboard handler. */
interface PagerApi {
  next: () => void;
  prev: () => void;
}

export default function BookReader() {
  const { slug, chapterId } = useParams();
  const book = getBook(slug);
  const { books, ready: localReady, synced } = useReadingProgress();
  const [settings] = useReaderSettings();
  const pager = useRef<PagerApi | null>(null);

  // On a new device the place lives only on the server. Wait for it before
  // choosing a chapter or a page, but never more than a moment: a slow or
  // absent backend must not keep a reader from reading.
  const [waited, setWaited] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setWaited(true), 2500);
    return () => window.clearTimeout(t);
  }, []);
  const ready = localReady && (synced || waited);

  // The page colour reaches past the reader into the overscroll area and the
  // mobile browser's toolbar, so a white page does not bounce onto black.
  useEffect(() => {
    const body = document.body;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const prevBg = body.style.backgroundColor;
    const prevMeta = meta?.content;
    body.style.backgroundColor = PAGE_BG[settings.page];
    if (meta) meta.content = PAGE_BG[settings.page] || '#08080a';
    return () => {
      body.style.backgroundColor = prevBg;
      if (meta && prevMeta) meta.content = prevMeta;
    };
  }, [settings.page]);

  // Pages do not scroll. Hold the document still while the reader is open.
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    return () => { root.style.overflow = prev; };
  }, []);

  // Leaving the reader is the moment a reader expects their place to be safe.
  useEffect(() => () => flushReadingProgress(), []);

  // Keys are bound here, in the shell that stays mounted across chapters, and
  // forwarded to whichever chapter view is current.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement as HTMLElement | null;
      if (el?.closest('input, textarea, select, [contenteditable], [role="dialog"], [role="menu"]')) return;
      const forward = e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey);
      const back = e.key === 'ArrowLeft' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey);
      if (!forward && !back) return;
      if (el?.closest('a, button') && e.key === ' ') return;
      e.preventDefault();
      if (forward) pager.current?.next();
      else pager.current?.prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!book) return <BookNotFound />;

  if (!chapterId || chapterIndex(book, chapterId) < 0) {
    if (!ready) return <div className="reader fixed inset-0" data-page={settings.page} />;
    const saved = books[book.slug]?.chapterId;
    const target = saved && chapterIndex(book, saved) >= 0 ? saved : book.chapters[0].id;
    return <Navigate to={chapterUrl(book.slug, target)} replace />;
  }

  const index = chapterIndex(book, chapterId);
  return (
    <ChapterView
      key={`${book.slug}/${chapterId}`}
      book={book}
      chapter={book.chapters[index]}
      index={index}
      progress={books[book.slug]}
      ready={ready}
      settings={settings}
      pagerRef={pager}
    />
  );
}

function ProseSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading chapter" className="max-w-[640px]">
      <div className="h-3 w-24 rounded bg-[hsl(var(--r-surface))]" />
      <div className="mt-5 h-9 w-4/5 rounded bg-[hsl(var(--r-surface))]" />
      <div className="mt-12 space-y-3.5">
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} className="h-3.5 rounded bg-[hsl(var(--r-surface))]" style={{ width: `${[96, 100, 92, 98, 70, 100, 94, 99, 60][i]}%` }} />
        ))}
      </div>
    </div>
  );
}

interface Geometry {
  /** Pages side by side: 2 on a wide screen, else 1. */
  cols: number;
  /** Gap between pages, and between one spread and the next. */
  gap: number;
  /** Widest the frame (page or spread) may be. */
  maxW: number;
  /** Horizontal margin outside the frame; room for the turn buttons. */
  padX: number;
  /** Space between the bars and the text. */
  padY: number;
}

/** Page geometry for a viewport. A spread only where both pages stay readable. */
function geometryFor(vw: number, vh: number): Geometry {
  if (vw >= 1100 && vh >= 560) return { cols: 2, gap: 80, maxW: 1240, padX: 96, padY: 36 };
  if (vw >= 768) return { cols: 1, gap: 96, maxW: 660, padX: 88, padY: 32 };
  return { cols: 1, gap: 48, maxW: 640, padX: 22, padY: 20 };
}

function sameGeometry(a: Geometry, b: Geometry) {
  return a.cols === b.cols && a.gap === b.gap && a.maxW === b.maxW && a.padX === b.padX && a.padY === b.padY;
}

function ChapterView({
  book,
  chapter,
  index,
  progress,
  ready,
  settings,
  pagerRef,
}: {
  book: Book;
  chapter: BookChapter;
  index: number;
  progress?: BookProgress;
  ready: boolean;
  settings: ReaderSettings;
  pagerRef: MutableRefObject<PagerApi | null>;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { hash } = location;
  const openAtEnd = (location.state as { at?: string } | null)?.at === 'end';

  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [geom, setGeom] = useState(() => geometryFor(window.innerWidth, window.innerHeight));
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [spread, setSpread] = useState(0);
  const [spreads, setSpreads] = useState(1);
  const [columns, setColumns] = useState(1);
  const [fontsReady, setFontsReady] = useState(0);
  const [drag, setDrag] = useState(0);
  const [animate, setAnimate] = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLSpanElement>(null);
  const restored = useRef(false);
  /** Where the reader is, 0..1 through the chapter. The source of truth;
      the spread is derived from it whenever the pages are counted. */
  const fraction = useRef(0);
  /** Set once the reader turns a page themselves. Until then, re-pagination
      (fonts arriving, a resize) must not round the saved place away. */
  const moved = useRef(false);

  const prev = index > 0 ? book.chapters[index - 1] : null;
  const next = index < book.chapters.length - 1 ? book.chapters[index + 1] : null;

  useEffect(() => {
    let live = true;
    setError(null);
    loadChapter(book.slug, chapter.id)
      .then(text => {
        if (!live) return;
        setHtml(text);
        // The next chapter is the likeliest next request; have it ready.
        if (next) loadChapter(book.slug, next.id).catch(() => {});
      })
      .catch(e => live && setError(e instanceof Error ? e.message : String(e)));
    return () => { live = false; };
  }, [book.slug, chapter.id, next, attempt]);

  // Web fonts change line breaks, so paginate again once they have arrived.
  useEffect(() => {
    let live = true;
    document.fonts?.ready.then(() => live && setFontsReady(n => n + 1));
    return () => { live = false; };
  }, []);

  // Measure the frame. Rotation, a window resize and a mobile toolbar
  // showing or hiding all land here.
  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => {
      const g = geometryFor(window.innerWidth, window.innerHeight);
      setGeom(prev => (sameGeometry(prev, g) ? prev : g));
      const w = Math.floor(el.clientWidth);
      const h = Math.floor(el.clientHeight);
      setSize(s => (s && s.w === w && s.h === h ? s : { w, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, []);

  const step = size ? size.w + geom.gap : 0;
  const colW = size ? (size.w - (geom.cols - 1) * geom.gap) / geom.cols : 0;

  /** Which spread an element starts on. Its first fragment, not its union
      box: a section split over several pages reports them all as one rect. */
  const spreadOf = useCallback((el: Element) => {
    const track = trackRef.current;
    if (!track || !step) return 0;
    const first = el.getClientRects()[0] ?? el.getBoundingClientRect();
    const x = first.left - track.getBoundingClientRect().left;
    return Math.max(0, Math.floor((x + 2) / step));
  }, [step]);

  // Paginate: count the spreads, then put the reader on the right one.
  useLayoutEffect(() => {
    const track = trackRef.current;
    const end = endRef.current;
    if (!html || !size || !track || !end || !ready) return;
    const x = end.getBoundingClientRect().left - track.getBoundingClientRect().left;
    const total = Math.max(1, Math.floor((x + 2) / step) + 1);
    setSpreads(total);
    setColumns(Math.max(1, Math.floor((x + 2) / (colW + geom.gap)) + 1));
    setAnimate(false);

    let target: number;
    if (!restored.current) {
      restored.current = true;
      const anchor = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
      if (anchor && track.contains(anchor)) {
        target = spreadOf(anchor);
        moved.current = true;
      } else {
        fraction.current = openAtEnd
          ? 1
          : progress?.chapterId === chapter.id && progress.position < 0.999
            ? progress.position
            : 0;
        target = Math.round(fraction.current * (total - 1));
      }
    } else {
      // Re-paginated (resize, type size, fonts): stay on the same passage.
      target = Math.round(fraction.current * (total - 1));
    }
    setSpread(Math.min(total - 1, Math.max(0, target)));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on layout inputs only, by design
  }, [html, size, geom, ready, settings.size, settings.font, fontsReady]);

  // Record the place on every turn.
  useEffect(() => {
    if (!restored.current) return;
    if (moved.current) fraction.current = spreads > 1 ? spread / (spreads - 1) : 1;
    recordPosition(book.slug, chapter.id, fraction.current);
  }, [spread, spreads, book.slug, chapter.id]);

  const spreadRef = useRef(spread);
  spreadRef.current = spread;

  const goNext = useCallback(() => {
    if (spreadRef.current < spreads - 1) {
      moved.current = true;
      setAnimate(true);
      setSpread(spreadRef.current + 1);
    } else if (next) {
      navigate(chapterUrl(book.slug, next.id));
    }
  }, [spreads, next, navigate, book.slug]);

  const goPrev = useCallback(() => {
    if (spreadRef.current > 0) {
      moved.current = true;
      setAnimate(true);
      setSpread(spreadRef.current - 1);
    } else if (prev) {
      navigate(chapterUrl(book.slug, prev.id), { state: { at: 'end' } });
    }
  }, [prev, navigate, book.slug]);

  useEffect(() => {
    pagerRef.current = html ? { next: goNext, prev: goPrev } : null;
    return () => { pagerRef.current = null; };
  }, [html, goNext, goPrev, pagerRef]);

  // A #section link within the open chapter: turn to the page it is on.
  const seenHash = useRef(hash);
  useEffect(() => {
    if (!html || hash === seenHash.current) return;
    seenHash.current = hash;
    const anchor = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (anchor) { moved.current = true; setAnimate(false); setSpread(spreadOf(anchor)); }
  }, [hash, html, spreadOf]);

  /* ---------- touch: swipe with the page under the finger, tap the edges ---------- */

  const touch = useRef<{ x: number; y: number; t: number; id: number; horizontal: boolean | null } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    if ((e.target as HTMLElement).closest('a, button')) return;
    touch.current = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId, horizontal: null };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const t = touch.current;
    if (!t || t.id !== e.pointerId) return;
    const dx = e.clientX - t.x;
    const dy = e.clientY - t.y;
    if (t.horizontal === null && Math.hypot(dx, dy) > 8) t.horizontal = Math.abs(dx) > Math.abs(dy);
    if (t.horizontal) {
      // Resist past the first and last page instead of sliding into nothing.
      const atEdge = (dx > 0 && spread === 0 && !prev) || (dx < 0 && spread === spreads - 1 && !next);
      setAnimate(false);
      setDrag(atEdge ? dx / 4 : dx);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const t = touch.current;
    touch.current = null;
    if (!t || t.id !== e.pointerId) return;
    const dx = e.clientX - t.x;
    const dy = e.clientY - t.y;
    const dt = performance.now() - t.t;
    if (t.horizontal) {
      const flick = Math.abs(dx) > 30 && dt < 250;
      const far = Math.abs(dx) > Math.min(120, window.innerWidth * 0.18);
      setAnimate(true);
      setDrag(0);
      if (flick || far) (dx < 0 ? goNext : goPrev)();
    } else if (Math.hypot(dx, dy) < 10 && !window.getSelection()?.toString()) {
      // A tap. The outer thirds turn; the middle is for reading and selecting.
      const x = e.clientX / window.innerWidth;
      if (x > 0.66) goNext();
      else if (x < 0.34) goPrev();
    }
  };

  const onPointerCancel = () => {
    touch.current = null;
    setAnimate(true);
    setDrag(0);
  };

  // Trackpads: one turn per swipe, however many wheel events it produces,
  // momentum included. The lock holds until the events have stopped for a
  // moment, so a long swipe is still one turn.
  const wheel = useRef({ acc: 0, lockedUntil: 0 });
  const onWheel = (e: React.WheelEvent) => {
    const now = performance.now();
    const w = wheel.current;
    if (now < w.lockedUntil) { w.lockedUntil = Math.max(w.lockedUntil, now + 300); return; }
    w.acc += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(w.acc) > 40) {
      (w.acc > 0 ? goNext : goPrev)();
      w.acc = 0;
      w.lockedUntil = now + 500;
    }
  };

  // Links inside the chapter are plain anchors from the EPUB: route internal
  // ones through the router instead of reloading the app.
  const onClick = (e: React.MouseEvent) => {
    const a = (e.target as HTMLElement).closest('a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (href.startsWith('/') && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
      e.preventDefault();
      navigate(href);
    }
  };

  const ready2 = !!html && !!size;
  const percent = progress?.chapterId === chapter.id ? progress.percent : null;
  const firstPage = spread * geom.cols + 1;
  const lastPage = Math.min(columns, firstPage + geom.cols - 1);
  const pageLabel = ready2
    ? `${firstPage >= lastPage ? `Page ${Math.min(firstPage, columns)}` : `Pages ${firstPage}–${lastPage}`} of ${columns}`
    : '';
  const atStart = spread === 0 && !prev;
  const atEnd = spread === spreads - 1 && !next;

  return (
    <div className="reader fixed inset-0 overflow-hidden" data-page={settings.page}>
      <Helmet>
        <title>{`${chapter.number ? `${chapter.number}. ` : ''}${chapter.title} | ${shortTitle(book)}`}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <header className="reader-bar absolute inset-x-0 top-0 z-20 border-b pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 max-w-[1240px] items-center gap-1 px-2 sm:gap-2 sm:px-4">
          <Link
            to={`/books/${book.slug}`}
            className="reader-btn flex h-10 min-w-10 shrink-0 items-center gap-1 px-2 text-[14px]"
            aria-label={`Back to ${book.title}`}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            <span className="hidden max-w-[180px] truncate md:inline">{shortTitle(book)}</span>
          </Link>
          <div className="min-w-0 flex-1 px-1 text-center">
            <p className="truncate text-[13.5px] font-medium text-[hsl(var(--r-strong))]">{chapter.title}</p>
            <p className="truncate font-mono text-[10.5px] tabular-nums text-[hsl(var(--r-dim))]">
              {chapterLabel(chapter) === chapter.title ? '' : `${chapterLabel(chapter)} · `}
              {index + 1} of {book.chapters.length}
            </p>
          </div>
          <ReaderContents book={book} progress={progress} currentId={chapter.id} page={settings.page} />
          <ReaderSettingsPanel />
        </div>
        <div className="absolute inset-x-0 -bottom-px h-[2px]" aria-hidden="true">
          <span
            className="block h-full origin-left bg-[hsl(var(--r-accent))] transition-transform duration-300"
            style={{ transform: `scaleX(${spreads > 1 ? spread / (spreads - 1) : ready2 ? 1 : 0})` }}
          />
        </div>
      </header>

      {/* The page frame, sized between the bars, so its measured box is the
          page on any device. */}
      {/* The whole band between the bars takes taps, swipes and the wheel,
          margins included: on a phone the edge a thumb reaches for is the
          margin, not the text. */}
      <main
        id="chapter"
        className="absolute inset-x-0"
        style={{
          top: `calc(56px + env(safe-area-inset-top) + ${geom.padY}px)`,
          bottom: `calc(44px + env(safe-area-inset-bottom) + ${geom.padY}px)`,
          touchAction: 'pinch-zoom',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onWheel={onWheel}
        onClick={onClick}
      >
        <div
          ref={frameRef}
          className="relative mx-auto h-full overflow-hidden"
          style={{ width: `min(calc(100vw - ${geom.padX * 2}px), ${geom.maxW}px)` }}
        >
          {error ? (
            <div className="py-10">
              <p className="text-[17px] font-medium text-[hsl(var(--r-strong))]">This chapter did not load.</p>
              <p className="mt-2 text-[14.5px] text-[hsl(var(--r-muted))]">Check the connection and try again. Your place is saved.</p>
              <button
                type="button"
                onClick={() => setAttempt(a => a + 1)}
                className="mt-6 inline-flex h-11 items-center rounded-md bg-[hsl(var(--r-accent))] px-5 text-[14.5px] font-semibold text-[hsl(var(--r-accent-ink))]"
              >
                Try again
              </button>
            </div>
          ) : !ready2 ? (
            <ProseSkeleton />
          ) : (
            <div
              ref={trackRef}
              className={cn('book-pages h-full', animate && 'is-turning')}
              style={{
                width: size!.w,
                columnWidth: `${colW}px`,
                columnGap: `${geom.gap}px`,
                ['--page-h' as string]: `${size!.h}px`,
                transform: `translate3d(${-spread * step + drag}px, 0, 0)`,
              }}
            >
              {chapter.part && (
                <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--r-dim))]">{chapter.part}</p>
              )}
              <article
                className="book-prose"
                data-font={settings.font}
                style={{ ['--prose-size' as string]: `${TEXT_SIZES[settings.size]}px` }}
                dangerouslySetInnerHTML={{ __html: html! }}
              />
              <ChapterEnd book={book} next={next} />
              <span ref={endRef} aria-hidden="true" className="block h-px" />
            </div>
          )}
        </div>
      </main>

      {/* Turn buttons in the margins, where there is room for them. Touch
          screens also turn by tapping the edges or swiping. */}
      {ready2 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            disabled={atStart}
            aria-label={spread === 0 ? 'Previous chapter' : 'Previous page'}
            className="reader-btn absolute left-2 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full disabled:invisible md:flex lg:left-5"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={atEnd}
            aria-label={spread === spreads - 1 ? 'Next chapter' : 'Next page'}
            className="reader-btn absolute right-2 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full disabled:invisible md:flex lg:right-5"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <footer className="reader-bar absolute inset-x-0 bottom-0 z-20 border-t pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid h-11 max-w-[1240px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 font-mono text-[11px] tabular-nums text-[hsl(var(--r-dim))] sm:px-6">
          <span className="truncate">{chapter.number ? `Chapter ${chapter.number}` : ''}</span>
          <span className="text-center" aria-live="polite">{pageLabel}</span>
          <span className="truncate text-right">{percent !== null ? `${formatPercent(percent)} of book` : ''}</span>
        </div>
      </footer>
    </div>
  );
}

function ChapterEnd({ book, next }: { book: Book; next: BookChapter | null }) {
  return (
    <nav aria-label="Next chapter" className="chapter-end mt-12 border-t border-[hsl(var(--r-border))] pt-8">
      {next ? (
        <Link
          to={chapterUrl(book.slug, next.id)}
          className="group block rounded-lg border border-[hsl(var(--r-border-strong))] p-5 transition-colors hover:border-[hsl(var(--r-accent))]"
        >
          <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[hsl(var(--r-accent))]">
            {next.number ? `Next · Chapter ${next.number}` : 'Next'}
          </span>
          <span className="mt-2 block text-[19px] font-semibold leading-snug text-[hsl(var(--r-strong))]">{next.title}</span>
        </Link>
      ) : (
        <div className="rounded-lg border border-[hsl(var(--r-border-strong))] p-5">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[hsl(var(--r-accent))]">The end</span>
          <p className="mt-2 text-[19px] font-semibold leading-snug text-[hsl(var(--r-strong))]">You have finished {shortTitle(book)}.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/books" className="inline-flex h-11 items-center rounded-md bg-[hsl(var(--r-accent))] px-5 text-[14.5px] font-semibold text-[hsl(var(--r-accent-ink))]">
              Back to the library
            </Link>
            <Link to={`/books/${book.slug}`} className="inline-flex h-11 items-center rounded-md border border-[hsl(var(--r-border-strong))] px-5 text-[14.5px] text-[hsl(var(--r-fg))]">
              Book details
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
