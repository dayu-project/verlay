import footer from "#/content/footer.json";
import { fill } from "#/content/resolve";

export const FOOTER = {
  /*
   * The only prose the footer carries. There was a bottom bar under the wordmark
   * restating "runs entirely on localhost" and the Node version; both are
   * already said where they matter — the first in the FAQ that is actually about
   * it, the second in the install steps you read before running anything — and a
   * footer repeating them was just the page clearing its throat on the way out.
   */
  blurb: fill(footer.blurb),
};
