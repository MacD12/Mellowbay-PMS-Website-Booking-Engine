/**
 * Turns the built SPA into one real HTML file per route.
 *
 * Why this exists: the site is client-rendered, and a client-rendered page is
 * an empty <div> until JavaScript runs. Googlebot will run it, eventually, in a
 * second pass. The crawlers behind WhatsApp, LinkedIn, Slack, Facebook and X
 * will not run it at all — so a shared link showed a blank card no matter what
 * the React tree set at runtime. Everything else here follows from that.
 *
 * The shape of it:
 *
 *   dist/index.html            the client build, used as the template
 *   dist-ssr/entry-server.js   the same components, built for Node
 *
 * For each route we call `render(path)`, drop the markup into the template's
 * empty root div, rewrite the head from the same `buildHead` the runtime uses,
 * and write the result to its own directory. `dist/coworking/index.html` is then
 * a page a crawler can read without executing anything.
 *
 * Run by `npm run build`. It is a post-step, not a plugin, so a failure here
 * cannot leave a half-written dist behind — the client build is already done
 * and valid on its own.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist');
const ssrEntry = join(root, 'dist-ssr', 'entry-server.js');

const { render, SEO_ROUTES, SITE_URL, buildSitemapEntries } = await import(
  pathToFileURL(ssrEntry).href
);

const template = await readFile(join(distDir, 'index.html'), 'utf8');

/** Escapes the five characters that can break out of an attribute or a tag. */
const escapeAttr = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * `</script>` inside JSON-LD would close the script element early. Escaping the
 * slash keeps the JSON valid and the tag intact.
 */
const escapeJsonLd = (json) => json.replace(/</g, '\\u003c');

const renderTag = ({ tag, attrs }) => {
  const pairs = Object.entries(attrs)
    .map(([name, value]) => `${name}="${escapeAttr(value)}"`)
    .join(' ');
  return `    <${tag} ${pairs} />`;
};

/**
 * Swaps the template's defaults for this route's real values.
 *
 * The title, description and canonical are replaced in place rather than
 * appended: two <title> tags or two canonicals is worse than one wrong one,
 * because a crawler resolves the conflict by ignoring both.
 */
function buildHtml(path, { html, head }) {
  // The template already has a title, description, robots and canonical to be
  // replaced in place. Everything else — Open Graph, Twitter, geo, hreflang —
  // has no placeholder and is appended before </head>.
  const REPLACED_IN_PLACE = new Set([
    'meta[name="description"]',
    'meta[name="robots"]',
    'link[rel="canonical"]',
  ]);

  const appended = head.tags
    .filter((t) => !REPLACED_IN_PLACE.has(t.selector))
    .map(renderTag)
    .join('\n');

  const robots = head.tags.find((t) => t.selector === 'meta[name="robots"]');

  return template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeAttr(head.title)}</title>`)
    .replace(
      /<meta\s+name="description"[\s\S]*?\/>/,
      `<meta name="description" content="${escapeAttr(head.description)}" />`,
    )
    .replace(
      /<meta name="robots"[^>]*\/>/,
      `<meta name="robots" content="${escapeAttr(robots.attrs.content)}" />`,
    )
    .replace(
      /<link rel="canonical"[^>]*\/>/,
      `<link rel="canonical" href="${escapeAttr(head.canonical)}" />`,
    )
    .replace(
      '</head>',
      `${appended}\n    <script type="application/ld+json">${escapeJsonLd(head.jsonLd)}</script>\n  </head>`,
    )
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`);
}

let written = 0;

for (const path of SEO_ROUTES) {
  const result = render(path);
  const html = buildHtml(path, result);

  // '/' is dist/index.html; '/rooms' is dist/rooms/index.html, so a static host
  // serves it at /rooms with no rewrite rule and no redirect.
  const outFile =
    path === '/' ? join(distDir, 'index.html') : join(distDir, path.slice(1), 'index.html');

  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, html, 'utf8');

  written += 1;
  const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
  console.log(`  prerendered ${path.padEnd(12)} -> ${outFile.replace(root, '.')}  ${kb} kB`);
}

// ---------------------------------------------------------------- sitemap ---

// Generated rather than hand-kept, so a new route cannot be added to the site
// and forgotten here. The image entries matter as much as the page entries:
// every photograph on this site is behind a React render, and some are behind
// a modal, so an image crawler has no other way to reach them.

const today = new Date().toISOString().slice(0, 10);
const entries = buildSitemapEntries();

const xmlEscape = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const urlBlock = (entry) =>
  [
    '  <url>',
    `    <loc>${xmlEscape(entry.url)}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    `    <changefreq>${entry.changeFrequency}</changefreq>`,
    `    <priority>${entry.priority.toFixed(1)}</priority>`,
    ...entry.images.map((img) =>
      [
        '    <image:image>',
        `      <image:loc>${xmlEscape(img.loc)}</image:loc>`,
        `      <image:title>${xmlEscape(img.title)}</image:title>`,
        '    </image:image>',
      ].join('\n'),
    ),
    '  </url>',
  ].join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.map(urlBlock).join('\n')}
</urlset>
`;

await writeFile(join(distDir, 'sitemap.xml'), sitemap, 'utf8');

const robots = `# https://www.robotstxt.org/
User-agent: *
Allow: /

# Guest check-in pages are reached by scanning a code at the desk. They are
# per-guest and have nothing to index.
Disallow: /register/

Sitemap: ${SITE_URL}/sitemap.xml
`;

await writeFile(join(distDir, 'robots.txt'), robots, 'utf8');

const imageCount = entries.reduce((n, e) => n + e.images.length, 0);

console.log(`\n  ${written} routes prerendered`);
console.log(`  sitemap.xml  ${entries.length} urls, ${imageCount} images`);
console.log('  robots.txt   written\n');
