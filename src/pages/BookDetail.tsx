import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { BookCover } from '@/components/books/BookCover';
import { ChapterList } from '@/components/books/ChapterList';
import { useAuth } from '@/hooks/useAuth';
import { loginHref } from '@/lib/auth-redirect';
import {
  chapterLabel,
  chapterUrl,
  formatDuration,
  formatPercent,
  getBook,
  timeAgo,
} from '@/lib/books';
import { READ_THRESHOLD, resetBookProgress, useReadingProgress } from '@/lib/reading-progress';
import '@/styles/books.css';

/*
  One book: the cover, what it is, how long it is, and the contents.

  Public, so a link to a book can be shared and indexed. The reading itself
  is behind sign-in; every "read" action here routes through /login with the
  chapter as `next`, so signing in lands the reader on the page they asked for.
*/

export default function BookDetail() {
  const { slug } = useParams();
  const book = getBook(slug);
  const { user } = useAuth();
  const { books } = useReadingProgress();

  if (!book) return <BookNotFound />;

  const progress = books[book.slug];
  const current = progress ? book.chapters.find(c => c.id === progress.chapterId) : undefined;
  const target = current ? chapterUrl(book.slug, current.id) : chapterUrl(book.slug, book.chapters[0].id);
  const go = (path: string) => (user ? path : loginHref(path));
  const readCount = progress
    ? book.chapters.filter(c => (progress.chapters[c.id]?.p ?? 0) >= READ_THRESHOLD).length
    : 0;
  const published = book.date
    ? new Date(`${book.date}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const facts = [
    { label: 'Chapters', value: String(book.chapters.length) },
    { label: 'Reading time', value: `~${formatDuration(book.minutes)}` },
    { label: 'Words', value: book.words.toLocaleString('en-US') },
    ...(published ? [{ label: 'Published', value: published }] : []),
  ];

  return (
    <div className="min-h-[100dvh]">
      <Helmet>
        <title>{`${book.title} | Books | Vijaysingh Puwar`}</title>
        {book.description && <meta name="description" content={book.description} />}
        <link rel="canonical" href={`https://vijaysinghpuwar.com/books/${book.slug}`} />
      </Helmet>

      <div className="page-gutter container mx-auto max-w-[1180px] pb-24 pt-24 sm:pt-28">
        <Link
          to="/books"
          className="-ml-2 inline-flex h-11 items-center gap-1 rounded-md px-2 text-[14px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Library
        </Link>

        <div className="mt-6 grid gap-10 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)] md:gap-12 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-16">
          <div className="mx-auto w-[min(60vw,260px)] md:mx-0 md:w-full">
            <div className="md:sticky md:top-24">
              <BookCover book={book} eager />
            </div>
          </div>

          <div className="min-w-0">
            {book.subjects.length > 0 && (
              <p className="meta-label">{book.subjects.slice(0, 4).join(' · ')}</p>
            )}
            <h1 className="section-title mt-3">{book.title}</h1>
            {book.subtitle && (
              <p className="mt-3 text-[17px] leading-snug text-muted-foreground">{book.subtitle}</p>
            )}
            {book.description && (
              <p className="mt-5 max-w-[62ch] text-[15.5px] leading-relaxed text-muted-foreground">{book.description}</p>
            )}

            <dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
              {facts.map(f => (
                <div key={f.label} className="bg-background px-4 py-3">
                  <dt className="meta-label">{f.label}</dt>
                  <dd className="mt-1 text-[14.5px] font-medium tabular-nums text-foreground">{f.value}</dd>
                </div>
              ))}
            </dl>

            {progress && current && (
              <div className="mt-7">
                <div className="flex items-baseline justify-between gap-4 text-[13.5px]">
                  <span className="truncate text-muted-foreground">
                    {progress.finishedAt ? 'Finished' : `${chapterLabel(current)}${current.number ? ` · ${current.title}` : ''}`}
                  </span>
                  <span className="shrink-0 font-mono text-[12px] tabular-nums text-muted-dim">
                    {formatPercent(progress.percent)} · {readCount}/{book.chapters.length} chapters · {timeAgo(progress.updatedAt)}
                  </span>
                </div>
                <div className="reading-meter mt-2.5" aria-hidden="true">
                  <span style={{ transform: `scaleX(${progress.percent / 100})` }} />
                </div>
              </div>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to={go(target)}
                className="gradient-btn inline-flex h-11 items-center rounded-md px-6 text-[15px]"
              >
                {!user ? 'Sign in to read' : progress ? 'Continue reading' : 'Start reading'}
              </Link>
              {user && progress && (
                <button
                  type="button"
                  onClick={() => { void resetBookProgress(book.slug); }}
                  className="btn-outline inline-flex h-11 items-center rounded-md px-5 text-[14px]"
                >
                  Start over
                </button>
              )}
            </div>
            {!user && (
              <p className="mt-3 text-[13px] text-muted-dim">
                Google or a one-time email link. Your place is kept across devices.
              </p>
            )}

            <section aria-labelledby="contents" className="mt-14">
              <h2 id="contents" className="section-heading mb-4">Contents</h2>
              <div className="book-tokens -mx-3">
                <ChapterList
                  book={book}
                  progress={progress}
                  hrefFor={(c, s) => go(chapterUrl(book.slug, c, s))}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BookNotFound() {
  return (
    <div className="page-gutter container mx-auto flex min-h-[70dvh] max-w-[640px] flex-col items-start justify-center pt-24">
      <Helmet>
        <title>Book not found | Vijaysingh Puwar</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <p className="section-heading">Library</p>
      <h1 className="section-title mt-3">That book is not on the shelf.</h1>
      <p className="mt-4 text-muted-foreground">The link may be old, or the book may have been renamed.</p>
      <Link to="/books" className="gradient-btn mt-7 inline-flex h-11 items-center rounded-md px-6 text-[15px]">
        See all books
      </Link>
    </div>
  );
}
