import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { type Book, chapterUrl } from '@/lib/books';
import { READ_THRESHOLD, type BookProgress } from '@/lib/reading-progress';
import { cn } from '@/lib/utils';

/**
 * The contents, grouped by part, with each chapter's state: read (a check),
 * current (an accent rule and its sections listed beneath), or untouched.
 *
 * Written against the --r-* variables so it takes the reader's page theme
 * inside the reader and the site palette on the book page.
 */
export function ChapterList({
  book,
  progress,
  currentId,
  hrefFor,
  onNavigate,
}: {
  book: Book;
  progress?: BookProgress;
  currentId?: string;
  /** Where a chapter row leads. Defaults to the reader. */
  hrefFor?: (chapterId: string, sectionId?: string) => string;
  onNavigate?: () => void;
}) {
  const href = hrefFor ?? ((c: string, s?: string) => chapterUrl(book.slug, c, s));

  const groups: { part: string | null; chapters: Book['chapters'] }[] = [];
  for (const ch of book.chapters) {
    const last = groups[groups.length - 1];
    if (last && last.part === ch.part) last.chapters.push(ch);
    else groups.push({ part: ch.part, chapters: [ch] });
  }

  return (
    <div className="flex flex-col">
      {groups.map((g, gi) => (
        <section key={`${g.part}-${gi}`} aria-label={g.part ?? 'Front matter'} className={cn(gi > 0 && 'mt-6')}>
          {g.part && (
            <h3 className="mb-1.5 px-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-[hsl(var(--r-dim))]">
              {g.part}
            </h3>
          )}
          <ol>
            {g.chapters.map(ch => {
              const mark = progress?.chapters[ch.id];
              const read = !!mark && mark.p >= READ_THRESHOLD;
              const current = ch.id === currentId;
              return (
                <li key={ch.id}>
                  <Link
                    to={href(ch.id)}
                    onClick={onNavigate}
                    aria-current={current ? 'page' : undefined}
                    className={cn(
                      'group relative flex min-h-[44px] items-baseline gap-3 rounded-md px-3 py-2.5 transition-colors',
                      'hover:bg-[hsl(var(--r-surface))]',
                      current && 'bg-[hsl(var(--r-surface))]',
                    )}
                  >
                    {current && (
                      <span aria-hidden="true" className="absolute inset-y-2 left-0 w-[2px] rounded bg-[hsl(var(--r-accent))]" />
                    )}
                    <span className="w-7 shrink-0 font-mono text-[12px] tabular-nums text-[hsl(var(--r-dim))]">
                      {ch.number ?? '·'}
                    </span>
                    <span
                      className={cn(
                        'min-w-0 flex-1 text-[14.5px] leading-snug',
                        current ? 'font-medium text-[hsl(var(--r-strong))]' : read ? 'text-[hsl(var(--r-muted))]' : 'text-[hsl(var(--r-fg))]',
                      )}
                    >
                      {ch.title}
                    </span>
                    <span className="flex shrink-0 items-center gap-2 font-mono text-[11px] tabular-nums text-[hsl(var(--r-dim))]">
                      {read ? (
                        <Check className="h-3.5 w-3.5 text-[hsl(var(--r-accent))]" aria-label="Read" />
                      ) : mark && mark.p > 0.02 ? (
                        <span aria-label={`${Math.round(mark.p * 100)}% read`}>{Math.round(mark.p * 100)}%</span>
                      ) : null}
                    </span>
                  </Link>
                  {current && ch.sections.length > 0 && (
                    <ol className="mb-1 ml-[52px] mt-0.5 border-l border-[hsl(var(--r-border))]">
                      {ch.sections.map(s => (
                        <li key={s.id}>
                          <Link
                            to={href(ch.id, s.id)}
                            onClick={onNavigate}
                            className="flex min-h-[36px] items-center px-3 py-1.5 text-[13px] leading-snug text-[hsl(var(--r-muted))] transition-colors hover:text-[hsl(var(--r-strong))]"
                          >
                            {s.title}
                          </Link>
                        </li>
                      ))}
                    </ol>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
