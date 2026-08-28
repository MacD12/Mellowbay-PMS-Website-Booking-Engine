import React, { createContext, useContext, useMemo, useState } from 'react';
import { RoomType } from '../types';

interface ModalApi {
  openGallery: () => void;
  openCallback: () => void;
  openRoom: (room: RoomType) => void;
}

const ModalContext = createContext<ModalApi | null>(null);

/** Modals live in the layout so any page or the nav can open them. */
export const useModals = (): ModalApi => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModals must be used inside <ModalProvider>');
  return ctx;
};

interface ModalState {
  gallery: boolean;
  callback: boolean;
  room: RoomType | null;
}

export const useModalState = () => {
  const [state, setState] = useState<ModalState>({
    gallery: false,
    callback: false,
    room: null,
  });

  const api = useMemo<ModalApi>(
    () => ({
      openGallery: () => setState((s) => ({ ...s, gallery: true })),
      openCallback: () => setState((s) => ({ ...s, callback: true })),
      openRoom: (room) => setState((s) => ({ ...s, room })),
    }),
    [],
  );

  const close = useMemo(
    () => ({
      gallery: () => setState((s) => ({ ...s, gallery: false })),
      callback: () => setState((s) => ({ ...s, callback: false })),
      room: () => setState((s) => ({ ...s, room: null })),
    }),
    [],
  );

  return { state, api, close };
};

export const ModalProvider: React.FC<{ api: ModalApi; children: React.ReactNode }> = ({
  api,
  children,
}) => <ModalContext.Provider value={api}>{children}</ModalContext.Provider>;
