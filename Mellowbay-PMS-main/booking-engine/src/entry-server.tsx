import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
// v7 merged the server entry points into the main package; there is no longer a
// 'react-router-dom/server' subpath.
import { StaticRouter } from 'react-router-dom';
import { AppRoutes } from './App';
import { buildHead } from './seo/head';

// Re-exported for scripts/prerender.mjs, which cannot import the TypeScript
// sources directly — this bundle is the only build of them Node can load.
export { buildSitemapEntries } from './seo/head';
export { SEO_ROUTES, SITE_URL } from './seo/siteConfig';

/**
 * Renders one route to a string, for the prerender step.
 *
 * No effects run here, so anything the components do with `window` inside a
 * `useEffect` is simply skipped — which is why the carousel, the tilt handlers
 * and the scroll listeners need no guarding. Only render-time code has to be
 * server-safe.
 */
export function render(path: string) {
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={path}>
        <AppRoutes />
      </StaticRouter>
    </StrictMode>,
  );

  return { html, head: buildHead(path) };
}
