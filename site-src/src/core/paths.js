/**
 * Resolve a public-folder path against the deployment base.
 *
 * Vite rewrites `/foo` references it can see in HTML and CSS at build time, but not strings built
 * in JS — those would 404 under a project-page subpath. Everything fetched at runtime goes
 * through here, so the site works at the site root and at /Portfolio/ alike.
 */
const BASE = import.meta.env.BASE_URL || '/';

export const asset = (p) => BASE + String(p).replace(/^\/+/, '');
