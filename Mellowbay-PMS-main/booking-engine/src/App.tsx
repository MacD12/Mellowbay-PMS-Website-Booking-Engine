import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Seo } from './seo/Seo';
import { Home } from './pages/Home';
import { Rooms } from './pages/Rooms';
import { Coworking } from './pages/Coworking';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Book } from './pages/Book';

/**
 * Guest check-in, reached only by scanning a code at the desk. Nobody browsing
 * the site will ever open it, so it has no business in the bundle every page
 * downloads. It is never prerendered either — the route table below is public
 * pages only — so the server never reaches this boundary.
 */
const Register = lazy(() => import('./pages/Register').then((m) => ({ default: m.Register })));

/**
 * The route table on its own, with no router around it.
 *
 * The browser wraps this in a BrowserRouter (src/main.tsx) and the prerender
 * step wraps it in a StaticRouter (src/entry-server.tsx). Keeping the router
 * out of here is what lets the same tree render in both places.
 */
export const AppRoutes: React.FC = () => (
  <>
    {/* Inside the router, outside the Layout, so it also covers /register —
        which it marks noindex. */}
    <Seo />

    <Routes>
      {/* Outside the Layout on purpose: the guest opens this by scanning a
          code at the desk, and a site header inviting them to browse rooms
          is the last thing that moment needs. */}
      <Route
        path="/register/:token"
        element={
          <Suspense fallback={<div className="min-h-screen bg-paper" />}>
            <Register />
          </Suspense>
        }
      />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/coworking" element={<Coworking />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/book" element={<Book />} />

        {/* Old paths, kept so existing links and anything already indexed still
            resolve. The static host should serve these as 301s; these client
            redirects are the backstop for a direct in-app navigation. */}
        <Route path="/eat-and-work" element={<Navigate to="/coworking" replace />} />
        <Route path="/restaurant" element={<Navigate to="/coworking" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  </>
);
