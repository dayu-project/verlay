/** Resolve files from `public/` under both local `/` and GitHub Pages `/verlay/`. */
export function publicAsset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}
