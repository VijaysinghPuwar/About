import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })}
          // 44px, and lifted clear of the iOS home indicator: at `bottom-6`
          // on a notched phone the button sat in the gesture strip, where the
          // swipe-up wins and the tap does not register.
          style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
          className="panel panel-hover fixed right-5 z-50 flex h-11 w-11 items-center justify-center rounded-md text-primary sm:right-6"
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
