import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
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
  The reader.

  One chapter per page, scrolled, not paginated: the books are full of code
  listings and wide tables, and a paginated layout would cut both. The site
  navigation and footer step aside (App hides them on this route) and the
  reader's own bar takes over: back to the book, the chapter, the contents,
  and "Aa" for page, typeface and size.

  The bar gets out of the way while reading. It slides up when the reader
  scrolls down, comes back on any scroll up, at the end of the chapter, or on
  a tap in the text on a touch screen, which is how Apple Books does it.

  Where the reader is gets recorded on every scroll frame into the
  reading-progress store, which batches the writes (see reading-progress.ts).
  Opening a chapter returns to the saved spot in it; a link with a #section
  goes to that section instead.
*/

const PAGE_BG: Record<ReaderSettings['page'], string> = {
  site: '',
  plain: '#ffffff',
  paper: '#f6f0e3',
};

export default function BookReader() {
  const { slug, chapterId } = useParams();
  const book = getBook(slug);
  const { books, ready } = useReadingProgress();
  const [settings] = useReaderSettings();

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

  // Leaving the reader is the moment a reader expects their place to be safe.
  useEffect(() => () => flushReadingProgress(), []);

  // ← and → turn chapters, unless focus is somewhere the arrows already mean
  // something (a field, or a code block or table that scrolls sideways).
  //
  // Bound here, in the shell that stays mounted, rather than in the chapter
  // view that is replaced on every turn: there, a key pressed in the moment
  // between one view unmounting and the next binding its listener was lost.
  // The ref is advanced on the keypress itself, so quick presses chain.
  const navigate = useNavigate();
  const currentRef = useRef(chapterId);
  currentRef.current = chapterId;
  useEffect(() => {
    if (!book) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const el = document.activeElement as HTMLElement | null;
      if (el?.closest('input, textarea, select, [contenteditable], pre, .table-scroll, [role="dialog"], [role="menu"]')) return;
      const i = chapterIndex(book, currentRef.current);
      if (i < 0) return;
      const target = book.chapters[e.key === 'ArrowRight' ? i + 1 : i - 1];
      if (!target) return;
      currentRef.current = target.id;
      navigate(chapterUrl(book.slug, target.id));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [book, navigate]);

  if (!book) return <BookNotFound />;

  if (!chapterId || chapterIndex(book, chapterId) < 0) {
    if (!ready) return <ReaderShell settings={settings} />;
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
    />
  );
}

function ReaderShell({ settings }: { settings: ReaderSettings }) {
  return (
    <div className="reader min-h-[100dvh]" data-page={settings.page}>
      <ProseSkeleton />
    </div>
  );
}

function ProseSkeleton() {
  return (
    <div className="mx-auto max-w-[42rem] px-5 pt-28 sm:px-8" aria-busy="true" aria-label="Loading chapter">
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

function scrollRange() {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

/** 0..1 down the page. A chapter shorter than the screen counts as seen. */
function currentPosition() {
  const range = scrollRange();
  return range < 40 ? 1 : Math.min(1, Math.max(0, window.scrollY / range));
}

function ChapterView({
  book,
  chapter,
  index,
  progress,
  ready,
  settings,
}: {
  book: Book;
  chapter: BookChapter;
  index: number;
  progress?: BookProgress;
  ready: boolean;
  settings: ReaderSettings;
}) {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [chrome, setChrome] = useState(true);
  const [minutesLeft, setMinutesLeft] = useState(chapter.minutes);
  const meterRef = useRef<HTMLSpanElement>(null);
  const tracking = useRef(false);
  const restored = useRef(false);
  const lastPos = useRef(0);
  const lastY = useRef(0);

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

  // Return to the saved place once, when both the text and the history exist.
  useLayoutEffect(() => {
    if (!html || !ready || restored.current) return;
    restored.current = true;
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (target) {
      target.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
    } else if (progress?.chapterId === chapter.id && progress.position > 0.005 && progress.position < 0.995) {
      window.scrollTo({ top: progress.position * scrollRange(), behavior: 'instant' as ScrollBehavior });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
    lastY.current = window.scrollY;
    tracking.current = true;
    const pos = currentPosition();
    lastPos.current = pos;
    recordPosition(book.slug, chapter.id, pos);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per chapter by design
  }, [html, ready]);

  // A #section link within the chapter that is already open: the view is not
  // remounted, so the restore above does not run again. Go to the section.
  const seenHash = useRef(hash);
  useEffect(() => {
    if (!html || hash === seenHash.current) return;
    seenHash.current = hash;
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    target?.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
  }, [hash, html]);

  // A size or typeface change reflows the whole chapter. Hold the reader's
  // place through it rather than leaving them wherever the old offset lands.
  const firstSettings = useRef(true);
  useLayoutEffect(() => {
    if (firstSettings.current) { firstSettings.current = false; return; }
    if (!tracking.current) return;
    window.scrollTo({ top: lastPos.current * scrollRange(), behavior: 'instant' as ScrollBehavior });
  }, [settings.size, settings.font]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const pos = currentPosition();
      if (meterRef.current) meterRef.current.style.transform = `scaleX(${pos})`;
      setMinutesLeft(Math.max(0, Math.ceil(chapter.minutes * (1 - pos))));

      const y = window.scrollY;
      const dy = y - lastY.current;
      if (y < 80 || pos > 0.97) setChrome(true);
      else if (dy > 8) setChrome(false);
      else if (dy < -8) setChrome(true);
      if (Math.abs(dy) > 8) lastY.current = y;

      if (tracking.current) {
        lastPos.current = pos;
        recordPosition(book.slug, chapter.id, pos);
      }
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [book.slug, chapter.id, chapter.minutes]);

  // Links inside the chapter are plain anchors from the EPUB. Route internal
  // ones through the router instead of reloading the app; on a touch screen,
  // a tap anywhere else in the text shows or hides the bars.
  const onProseClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const a = target.closest('a');
    if (a) {
      const href = a.getAttribute('href') || '';
      if (href.startsWith('/') && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
        e.preventDefault();
        navigate(href);
      }
      return;
    }
    if (
      window.matchMedia('(pointer: coarse)').matches &&
      !target.closest('button, pre, .table-scroll, img, figure') &&
      !window.getSelection()?.toString()
    ) {
      setChrome(c => !c);
    }
  }, [navigate]);

  const percent = progress?.chapterId === chapter.id ? progress.percent : null;

  return (
    <div className="reader min-h-[100dvh]" data-page={settings.page}>
      <Helmet>
        <title>{`${chapter.number ? `${chapter.number}. ` : ''}${chapter.title} | ${shortTitle(book)}`}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <a href="#chapter" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-md focus:bg-[hsl(var(--r-surface))] focus:px-3 focus:py-2">
        Skip to chapter text
      </a>

      <header
        className={cn(
          'reader-bar fixed inset-x-0 top-0 z-50 border-b pt-[env(safe-area-inset-top)] transition-transform duration-300 ease-out',
          !chrome && '-translate-y-full',
        )}
        // Focus inside the bar brings it back, so keyboard users never tab into a hidden control.
        onFocus={() => setChrome(true)}
      >
        <div className="mx-auto flex h-14 max-w-[1180px] items-center gap-1 px-2 sm:gap-2 sm:px-4">
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
            ref={meterRef}
            className="block h-full origin-left bg-[hsl(var(--r-accent))]"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>
      </header>

      <main id="chapter" tabIndex={-1} className="mx-auto max-w-[42rem] px-5 pb-28 pt-24 outline-none sm:px-8 sm:pt-28">
        {chapter.part && (
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--r-dim))]">{chapter.part}</p>
        )}

        {error ? (
          <div className="py-16">
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
        ) : html === null ? (
          <div className="-mx-5 sm:-mx-8"><ProseSkeleton /></div>
        ) : (
          <>
            <article
              className="book-prose"
              data-font={settings.font}
              style={{ ['--prose-size' as string]: `${TEXT_SIZES[settings.size]}px` }}
              onClick={onProseClick}
              dangerouslySetInnerHTML={{ __html: html }}
            />
            <ChapterEnd book={book} prev={prev} next={next} />
          </>
        )}
      </main>

      <footer
        className={cn(
          'reader-bar pointer-events-none fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] transition-opacity duration-300',
          chrome && html ? 'opacity-100' : 'opacity-0',
        )}
        aria-hidden="true"
      >
        <div className="mx-auto flex h-9 max-w-[1180px] items-center justify-between px-5 font-mono text-[11px] tabular-nums text-[hsl(var(--r-dim))] sm:px-6">
          <span>{minutesLeft > 0 ? `${minutesLeft} min left in chapter` : 'End of chapter'}</span>
          <span>{percent !== null ? formatPercent(percent) : ''}</span>
        </div>
      </footer>
    </div>
  );
}

function ChapterEnd({ book, prev, next }: { book: Book; prev: BookChapter | null; next: BookChapter | null }) {
  return (
    <nav aria-label="Chapters" className="mt-20 border-t border-[hsl(var(--r-border))] pt-8">
      {next ? (
        <Link
          to={chapterUrl(book.slug, next.id)}
          className="group block rounded-lg border border-[hsl(var(--r-border-strong))] p-5 transition-colors hover:border-[hsl(var(--r-accent))]"
        >
          <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[hsl(var(--r-accent))]">
            {next.number ? `Next · Chapter ${next.number}` : 'Next'}
          </span>
          <span className="mt-2 block text-[19px] font-semibold leading-snug text-[hsl(var(--r-strong))]">{next.title}</span>
          <span className="mt-1.5 block font-mono text-[11.5px] text-[hsl(var(--r-dim))]">{next.minutes} min read</span>
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
      {prev && (
        <Link
          to={chapterUrl(book.slug, prev.id)}
          className="mt-3 flex min-h-[44px] items-center gap-2 rounded-md px-1 text-[14px] text-[hsl(var(--r-muted))] transition-colors hover:text-[hsl(var(--r-strong))]"
        >
          <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">
            Previous: {prev.number ? `${prev.number}. ` : ''}{prev.title}
          </span>
        </Link>
      )}
      <p className="mt-6 hidden text-center font-mono text-[11px] text-[hsl(var(--r-dim))] [@media(pointer:fine)]:block">
        ← → to turn chapters
      </p>
    </nav>
  );
}
