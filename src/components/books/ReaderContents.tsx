import * as Dialog from '@radix-ui/react-dialog';
import { List, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookCover } from '@/components/books/BookCover';
import { ChapterList } from '@/components/books/ChapterList';
import { type Book, formatDuration, formatPercent } from '@/lib/books';
import type { BookProgress } from '@/lib/reading-progress';
import type { ReaderPage } from '@/lib/reader-settings';

/**
 * The contents drawer. Full width on a phone, a 400px panel from the right
 * elsewhere, in the reader's page colours. It opens scrolled to the current
 * chapter, which in a 41-chapter book is the difference between useful and not.
 */
export function ReaderContents({
  book,
  progress,
  currentId,
  page,
}: {
  book: Book;
  progress?: BookProgress;
  currentId: string;
  page: ReaderPage;
}) {
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      listRef.current
        ?.querySelector('[aria-current="page"]')
        ?.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  const remaining = progress
    ? Math.max(0, Math.round(book.minutes * (1 - progress.percent / 100)))
    : book.minutes;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger aria-label="Contents" className="reader-btn flex h-10 w-10 items-center justify-center">
        <List className="h-[19px] w-[19px]" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-[60] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          style={{ background: page === 'site' ? 'rgba(0,0,0,0.6)' : 'rgba(20,20,24,0.3)' }}
        />
        <Dialog.Content
          data-page={page}
          style={{ background: 'var(--r-bg)' }}
          className="reader reader-panel fixed inset-y-0 right-0 z-[60] flex w-full flex-col border-l outline-none duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-[400px]"
        >
          <div className="flex items-start gap-3.5 border-b border-[hsl(var(--r-border))] px-5 pb-4 pt-[max(16px,env(safe-area-inset-top))]">
            <Link to={`/books/${book.slug}`} onClick={() => setOpen(false)} className="w-11 shrink-0" tabIndex={-1} aria-hidden="true">
              <BookCover book={book} eager />
            </Link>
            <div className="min-w-0 flex-1 pt-0.5">
              <Dialog.Title className="line-clamp-2 text-[15px] font-semibold leading-snug text-[hsl(var(--r-strong))]">
                {book.title}
              </Dialog.Title>
              <Dialog.Description className="mt-1 font-mono text-[11.5px] tabular-nums text-[hsl(var(--r-dim))]">
                {progress ? `${formatPercent(progress.percent)} · ` : ''}
                {formatDuration(remaining)} left
              </Dialog.Description>
            </div>
            <Dialog.Close aria-label="Close contents" className="reader-btn -mr-2 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center">
              <X className="h-[18px] w-[18px]" />
            </Dialog.Close>
          </div>
          <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain px-2 py-4 pb-[max(16px,env(safe-area-inset-bottom))]">
            <ChapterList book={book} progress={progress} currentId={currentId} onNavigate={() => setOpen(false)} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
