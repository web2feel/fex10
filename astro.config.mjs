// @ts-check
import { defineConfig } from 'astro/config';

// For GitHub Pages project sites set BASE_PATH=/<repo-name> (the deploy workflow does this automatically).
const base = process.env.BASE_PATH || '/';

/** Prefix root-relative links inside Markdown with the site base path. */
function rehypeBaseLinks() {
  const prefix = base.replace(/\/$/, '');
  /** @param {any} node */
  const walk = (node) => {
    if (node.type === 'element' && node.tagName === 'a') {
      const href = node.properties?.href;
      if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')) {
        node.properties.href = prefix + href;
      }
    }
    node.children?.forEach(walk);
  };
  return (/** @type {any} */ tree) => walk(tree);
}

export default defineConfig({
  site: process.env.SITE_URL || undefined,
  base,
  trailingSlash: 'ignore',
  markdown: {
    shikiConfig: { theme: 'github-dark-dimmed', wrap: true },
    rehypePlugins: [rehypeBaseLinks],
  },
});
