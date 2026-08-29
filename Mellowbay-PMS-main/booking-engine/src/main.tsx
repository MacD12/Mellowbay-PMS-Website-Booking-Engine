import {StrictMode} from 'react';
import {createRoot, hydrateRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {AppRoutes} from './App.tsx';
import './index.css';

const container = document.getElementById('root')!;

const tree = (
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>
);

// The build prerenders each route into its own index.html, so in production
// there is already markup here to adopt — hydrating keeps it and just attaches
// the handlers, instead of throwing away a painted page and drawing it again.
// `npm run dev` serves an empty root, which is what the else branch is for.
if (container.hasChildNodes()) {
  hydrateRoot(container, tree);
} else {
  createRoot(container).render(tree);
}
