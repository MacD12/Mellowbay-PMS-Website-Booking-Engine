import React, { useEffect, useState } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
  /**
   * Rendered on the server and on the first client pass. Give it the height the
   * real content will take, or the page jumps when the swap happens — which
   * trades a hydration warning for a Cumulative Layout Shift, and CLS is the
   * one a visitor can actually see.
   */
  fallback?: React.ReactNode;
}

/**
 * Defers a subtree until after hydration.
 *
 * For anything whose first render depends on the moment it runs. The booking
 * engine seeds its calendar from today's date: prerendered, that date is the
 * date of the build, and on the visitor's machine it is today — so the server
 * markup and the client's first render disagree, and React throws the whole
 * prerendered tree away rather than adopting it.
 *
 * Rendering the same placeholder in both passes makes them agree. The real
 * content mounts immediately afterwards, in an effect, when there is no server
 * to disagree with.
 *
 * This costs nothing in search terms: the booking widget is an application, not
 * content. The copy a crawler should read is in the page around it.
 */
export const ClientOnly: React.FC<ClientOnlyProps> = ({ children, fallback = null }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return <>{mounted ? children : fallback}</>;
};
