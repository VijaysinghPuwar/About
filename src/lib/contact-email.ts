// The address is assembled at call time, never written as one literal.
//
// This matters at BUILD time, not just in the DOM: esbuild constant-folds an
// inline template like `${'contact'}@${'example.com'}` into a single plaintext
// string, which is how the Command Palette chunk previously shipped the real
// address to logged-out visitors. Joining an array is not folded, so the two
// halves stay separate in the bundle.

const LOCAL = 'contact';
const DOMAIN = 'vijaysinghpuwar.com';

/** Real address. Only call this behind an authentication check. */
export const contactEmail = (): string => [LOCAL, DOMAIN].join('@');

/** `cont••••@domain` — safe to render for logged-out visitors. */
export const maskedContactEmail = (): string =>
  [LOCAL.slice(0, 4) + '••••', DOMAIN].join('@');
