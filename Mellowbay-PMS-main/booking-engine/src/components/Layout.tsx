import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { HouseDetailModal } from './HouseDetailModal';
import { PhotoGalleryModal } from './PhotoGalleryModal';
import { CallbackModal } from './CallbackModal';
import { ModalProvider, useModalState } from '../ui/ModalContext';

/**
 * Route changes land at the top of the new page — unless the link carried a hash,
 * in which case honour it (the merged Eat & work page is reached that way).
 */
const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ block: 'start' });
        return;
      }
    }
    // 'instant' matters: the stylesheet sets scroll-behavior: smooth, which would
    // otherwise animate the whole page back to the top on every navigation.
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return null;
};

export const Layout: React.FC = () => {
  const { state, api, close } = useModalState();

  return (
    <ModalProvider api={api}>
      <div className="min-h-screen bg-paper text-ink font-sans antialiased selection:bg-plum selection:text-white">
        <ScrollToTop />
        <Navbar />

        <Outlet />

        {/* Dark ground pulled up behind the slab by exactly one corner radius, so it
            shows through the two corner cut-outs and nowhere else. The bloom gives the
            slab's drop shadow something to fall on — pure ink would swallow it. */}
        <div className="relative z-0 -mt-[56px] pt-[56px] bg-ink overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(150%_220px_at_50%_0%,rgba(255,255,255,0.085),rgba(255,255,255,0)_70%)]"
          />
          <div className="relative">
            <Footer />
          </div>
        </div>

        <HouseDetailModal project={state.room} onClose={close.room} />
        <PhotoGalleryModal isOpen={state.gallery} onClose={close.gallery} />
        <CallbackModal isOpen={state.callback} onClose={close.callback} />
      </div>
    </ModalProvider>
  );
};
