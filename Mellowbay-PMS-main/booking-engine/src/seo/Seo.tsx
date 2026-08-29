import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { buildHead } from './head';

/**
 * Keeps the document head in step with the route.
 *
 * The tags are already correct when the page arrives — the prerender step
 * writes them from the same `buildHead` call. This exists for what happens
 * next: a click on a nav link changes the route without a page load, and a
 * title and canonical left over from the previous page is one of the easier
 * ways to get a site half-indexed.
 *
 * Every tag is updated in place, found by the attribute that identifies it.
 * Appending instead would leave the prerendered tag sitting above the new one,
 * and two canonicals mean no canonical.
 */
const upsert = (tag: 'meta' | 'link', selector: string, attrs: Record<string, string>) => {
  let el = document.head.querySelector<HTMLElement>(selector);

  if (!el) {
    el = document.createElement(tag);
    // Marks the tags this module owns, so a future head audit can tell them
    // apart from whatever the build injected.
    el.dataset.seo = '';
    document.head.appendChild(el);
  }

  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value);
};

export const Seo: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const head = buildHead(pathname);

    document.title = head.title;

    for (const { tag, selector, attrs } of head.tags) {
      upsert(tag, selector, attrs);
    }

    // JSON-LD is replaced wholesale rather than patched — it is one blob, and
    // a stale half of a graph is worse than none.
    let ld = document.head.querySelector<HTMLScriptElement>('script[type="application/ld+json"]');
    if (!ld) {
      ld = document.createElement('script');
      ld.type = 'application/ld+json';
      document.head.appendChild(ld);
    }
    ld.textContent = head.jsonLd;
  }, [pathname]);

  return null;
};
