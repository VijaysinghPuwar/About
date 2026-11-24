/**
 * Holds the page still behind an overlay.
 *
 * The lock goes on the root element, because that is what scrolls. It used to
 * be set on `<body>` in two places, and did nothing in either: with
 * `overflow-x: hidden` on the root, the root is the viewport's scroller, and a
 * `<body>` told to hide its overflow is a box that was never scrolling. The
 * page went on moving under the mobile menu and under the project dialog.
 *
 * Counted, so two layers open at once (the project index, then a project from
 * it) release in either order without the first to close unlocking the page
 * under the second. `scrollbar-gutter: stable` on the root keeps the layout
 * from shifting when the bar goes.
 */
let locks = 0;
let previous = '';

export function lockScroll(): () => void {
  const root = document.documentElement;
  if (locks === 0) {
    previous = root.style.overflowY;
    root.style.overflowY = 'hidden';
  }
  locks += 1;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks -= 1;
    if (locks === 0) root.style.overflowY = previous;
  };
}
