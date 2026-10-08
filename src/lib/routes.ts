/** The reader draws its own bar and wants the whole viewport. */
export function isReaderPath(pathname: string): boolean {
  return /^\/books\/[^/]+\/read(\/|$)/.test(pathname);
}
