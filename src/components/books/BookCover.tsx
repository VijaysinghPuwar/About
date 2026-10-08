import type { Book } from '@/lib/books';
import { cn } from '@/lib/utils';

/**
 * Every cover in the same 2:3 frame, so the shelf reads as one row of books.
 * The source images are not all that shape (spoonstill's is A4, a little
 * narrower); `object-fit: cover` trims the difference from the side margins,
 * which on these covers are empty.
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
      className={cn('book-cover aspect-[2/3]', className)}
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
