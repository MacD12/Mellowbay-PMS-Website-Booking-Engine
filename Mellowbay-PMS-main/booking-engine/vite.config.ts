import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type ProxyOptions} from 'vite';

/**
 * Where the PMS API is, as seen from the machine running this dev server.
 *
 * The browser never learns this address. It asks this site's own origin for
 * /api/... and Vite forwards the request here, which is what lets a phone on
 * the same Wi-Fi use the site: it talks to whatever host it loaded the page
 * from, and the localhost hop happens on the development machine. It also
 * means the API's CORS_ORIGIN has no say in it — the request is not
 * cross-origin any more.
 *
 * The arrangement before this compiled the machine's own Wi-Fi address into the
 * bundle, and every request timed out as soon as the router handed out a
 * different one.
 *
 * Note the dev server still only listens on localhost by default; run
 * `npm run dev -- --host` for the phone to be able to reach it at all.
 */
const API_TARGET = process.env.HELIO_API_URL ?? 'http://localhost:8080';

const proxy: Record<string, ProxyOptions> = {
  '/api': {
    target: API_TARGET,
    changeOrigin: true,
  },
};

export default defineConfig(() => {
  return {
    // Served from https://ravinduyas.github.io/mellow-bay/ on GitHub Pages.
    // Overridable so `npm run dev` and other hosts can serve from the root.
    base: process.env.BASE_PATH ?? '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Listen on the LAN, not just localhost. The check-in QR code sends a
      // guest's own phone to /register on this server, and a phone cannot reach
      // a server bound to ::1.
      host: true,
      // The PMS builds that QR from HELIO_BOOKING_SITE_URL, which names a port.
      // Vite's default is to step quietly to 5174 when 5173 is busy, which
      // leaves the QR pointing at a port with nothing behind it — so fail
      // loudly instead and let whoever is on 5173 be dealt with.
      port: 5173,
      strictPort: true,
      proxy,
    },
    // `vite preview` serves the built bundle and needs the same hop, or a build
    // checked locally reaches nothing.
    preview: {
      proxy,
    },
  };
});
