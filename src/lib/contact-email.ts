// The contact address, kept out of plain sight.
//
// What this does: the address is never written out, whole or in halves, in
// this file, in the built bundle, or in the page of a signed-out visitor. It is
// stored reversed and put back together at call time, so a scraper reading the
// HTML or grepping the JavaScript for something shaped like an address finds
// nothing, and neither does a code search of the repository.
//
// What this does not do: it is not access control. The code that rebuilds the
// address ships to every visitor, signed in or not, so anyone who reads it can
// run it. Hiding it from them would take a server that hands the address over
// only after checking a session, which this site does not have for this.
//
// The signed-out UI therefore shows no part of the address at all. It used to
// show the first four letters and the domain with dots in between, which is a
// crossword clue, not a mask.

const REVERSED = ['moc.rawuphgnisyajiv', 'tcatnoc'];

const unreverse = (s: string) => Array.from(s).reverse().join('');

/** Real address. Only call this behind an authentication check. */
export const contactEmail = (): string => REVERSED.map(unreverse).reverse().join('@');
