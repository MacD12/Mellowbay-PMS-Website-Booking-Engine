/**
 * The booking engine's public surface.
 *
 * Both the frontend and the backend import from here, so a price is computed
 * the same way on each side. The server is still the authority — the browser
 * quotes optimistically for a responsive UI, and the server recomputes before
 * anything is recorded.
 */
export * from './types.js';
export * from './pricing.js';
export * from './validate.js';
