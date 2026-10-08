import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Check, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BookCover } from '@/components/books/BookCover';
import { useAuth } from '@/hooks/useAuth';
import { loginHref } from '@/lib/auth-redirect';
import {
  BOOKS,
  type Book,
  chapterLabel,
  chapterUrl,
  formatPercent,
  getBook,
  timeAgo,
} from '@/lib/books';
import { type BookProgress, resetBookProgress, useReadingProgress } from '@/lib/reading-progress';
import '@/styles/books.css';

/*
  The shelf.

  After Apple Books: covers at their own proportions, bottom-aligned, with a
  single line under each that says where the reader stands (a percentage, NEW,
  or Finished) and a ••• menu for the rest. No titles under the covers; the
  covers carry them, and the link names them for a screen reader.

  Signed in with a book open, a "Continue" panel leads the page, because the
  most common reason to come back here is to carry on.
*/

export default function Books() {
  const { user } = useAuth();
  const { books: progress, ready } = useReadingProgress();

  // In progress first, most recent first; then everything else in catalogue order.
  const shelf = useMemo(() => {
    const opened = BOOKS.filter(b => progress[b.slug]).sort(
      (a, b) => Date.parse(progress[b.slug].updatedAt) - Date.parse(progress[a.slug].updatedAt),
    );
    return [...opened, ...BOOKS.filter(b => !progress[b.slug])];
  }, [progress]);

  const resume = useMemo(() => {
    const p = Object.values(progress)
      .filter(p => !p.finishedAt && getBook(p.slug))
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))[0];
    return p ? { progress: p, book: getBook(p.slug)! } : null;
  }, [progress]);

  return (
    <div className="min-h-[100dvh]">
      <Helmet>
        <title>Books | Vijaysingh Puwar</title>
        <meta
          name="description"
          content="Long-form technical guides to Vijaysingh Puwar's own software projects, each written against a specific commit and checked against the source."
        />
        <link rel="canonical" href="https://vijaysinghpuwar.com/books" />
      </Helmet>

      <div className="page-gutter container mx-auto max-w-[1180px] pb-24 pt-28 sm:pt-32">
        <header className="max-w-[640px]">
          <p className="section-heading">Library</p>
          <h1 className="section-title mt-3">Books</h1>
          <p className="mt-4 text-[15.5px] leading-relaxed text-muted-foreground">
            Long-form guides to projects I have built, each pinned to one commit and checked
            against the source. {user ? 'Your place is saved as you read, on every device you sign in on.' : 'Free to read once you sign in; your place is saved as you go.'}
          </p>
        </header>

        {user && ready && resume && <ContinuePanel book={resume.book} progress={resume.progress} />}

        <section aria-label="All books" className="mt-14 sm:mt-16">
          <ul className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-4 lg:gap-x-10">
            {shelf.map((book, i) => (
              <li key={book.slug}>
                <ShelfItem book={book} progress={progress[book.slug]} signedIn={!!user} eager={i < 4} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function ContinuePanel({ book, progress }: { book: Book; progress: BookProgress }) {
  const chapter = book.chapters.find(c => c.id === progress.chapterId) ?? book.chapters[0];
  return (
    <section aria-label="Continue reading" className="panel mt-10 flex items-center gap-5 rounded-lg p-4 sm:gap-6 sm:p-5">
      <Link to={chapterUrl(book.slug, chapter.id)} className="w-[64px] shrink-0 sm:w-[76px]" tabIndex={-1} aria-hidden="true">
        <BookCover book={book} eager />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="meta-label">Continue reading · {timeAgo(progress.updatedAt)}</p>
        <p className="mt-1.5 truncate text-[16px] font-semibold text-foreground">{book.title}</p>
        <p className="mt-0.5 truncate text-[13.5px] text-muted-foreground">
          {chapterLabel(chapter)}
          {chapter.number ? ` · ${chapter.title}` : ''}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="reading-meter max-w-[220px] flex-1" aria-hidden="true">
            <span style={{ transform: `scaleX(${progress.percent / 100})` }} />
          </div>
          <span className="font-mono text-[11.5px] tabular-nums text-muted-dim">{formatPercent(progress.percent)}</span>
        </div>
      </div>
      <Link
        to={chapterUrl(book.slug, chapter.id)}
        aria-label={`Resume ${book.title}`}
        className="gradient-btn inline-flex h-11 shrink-0 items-center rounded-md px-4 text-[14px] sm:h-10 sm:px-5"
      >
        Resume
      </Link>
    </section>
  );
}

function ShelfItem({
  book,
  progress,
  signedIn,
  eager,
}: {
  book: Book;
  progress?: BookProgress;
  signedIn: boolean;
  eager: boolean;
}) {
  const navigate = useNavigate();
  const readHref = progress ? chapterUrl(book.slug, progress.chapterId) : chapterUrl(book.slug, book.chapters[0].id);

  // A percentage in every state, as Apple Books shows it: 0% before the book
  // is opened (and for a visitor who is not signed in), 100% once finished.
  const percent = progress?.finishedAt ? 100 : progress?.percent ?? 0;
  const status = `${formatPercent(percent)} read`;

  return (
    <div>
      <Link to={`/books/${book.slug}`} className="book-cover-link" aria-label={`${book.title}. ${status}.`}>
        <BookCover book={book} eager={eager} />
      </Link>

      <div className="mt-3 flex h-8 items-center justify-between gap-2">
        {progress?.finishedAt ? (
          <span className="inline-flex items-center gap-1.5 font-mono text-[13px] tabular-nums text-primary">
            100% <Check className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        ) : (
          <span className="font-mono text-[13px] tabular-nums text-muted-foreground">{formatPercent(percent)}</span>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`More options for ${book.title}`}
            className="-mr-2 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-card hover:text-foreground data-[state=open]:bg-card data-[state=open]:text-foreground"
          >
            <MoreHorizontal className="h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 border-border bg-card">
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => navigate(signedIn ? readHref : loginHref(readHref))}
            >
              {!signedIn ? 'Sign in to read' : progress ? 'Continue reading' : 'Start reading'}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onSelect={() => navigate(`/books/${book.slug}`)}>
              About this book
            </DropdownMenuItem>
            {signedIn && progress && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onSelect={() => { void resetBookProgress(book.slug); }}
                >
                  Clear reading history
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
