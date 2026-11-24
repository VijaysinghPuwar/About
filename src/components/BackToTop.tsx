import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { isReaderPath } from '@/lib/routes';

/*
  Shown and hidden with two classes, not an animation library.

  This button was the only thing in the entry bundle that used framer-motion,
  so the whole library was fetched and parsed before first paint to fade one
  44px square. It was also fighting the stylesheet: every control on the site
  already has a CSS transition on `transform` and `opacity` (see the top of
  index.css), so each frame the library wrote was eased a second time.

  It stays mounted and goes `invisible` when hidden, which takes it out of the
  tab order and away from the pointer without unmounting it mid-fade.

  It only exists where the page has a margin for it to stand in. The content
  column is 1180px; from about 1340px there is room beside it. Narrower than
  that the button floated over the column, and on a phone it sat on top of
  whatever was right-aligned or centred at the bottom of the screen: the age
  of a repository, the end of a heading. A phone already has a way back to the
  top (the status bar, and the logo in the fixed bar); it did not need a
  second one that covers the text.
*/
export function BackToTop() {
  const [show, setShow] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (isReaderPath(pathname)) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      // 44px, and lifted clear of the iOS home indicator: at `bottom-6` on a
      // notched phone the button sat in the gesture strip, where the swipe-up
      // wins and the tap does not register.
      style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      className={cn(
        'panel panel-hover fixed right-6 z-50 hidden h-11 w-11 items-center justify-center rounded-md text-primary min-[1340px]:flex',
        show ? 'visible scale-100 opacity-100' : 'invisible scale-90 opacity-0',
      )}
      aria-label="Back to top"
    >
      <ArrowUp className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
