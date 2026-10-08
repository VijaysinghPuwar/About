import type { Book } from '@/lib/books';
import { cn } from '@/lib/utils';

/**
 * A cover at its own proportions. The two books are not the same shape
 * (2:3 and A4), and squeezing them into one box would crop one of them, so
 * the shelf aligns covers on their bottom edge the way a real shelf does.
 */
export function BookCover({
  book,
  className,
  eager = false,
}: {
  book: Book;
  className?: string;
  eager?: boolean;
}) {
  if (!book.cover) {
    return (
      <div
        className={cn('book-cover flex aspect-[2/3] items-end p-4', className)}
        aria-hidden="true"
      >
        <span className="text-sm font-semibold text-foreground">{book.title}</span>
      </div>
    );
  }
  return (
    <div
      className={cn('book-cover', className)}
      style={{ aspectRatio: `${book.cover.width} / ${book.cover.height}` }}
    >
      <img
        src={book.cover.src}
        width={book.cover.width}
        height={book.cover.height}
        alt=""
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        // The cover is the largest thing on the shelf, so it is the LCP.
        {...(eager ? { fetchpriority: 'high' } : {})}
      />
    </div>
  );
}
