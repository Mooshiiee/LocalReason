import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { LibraryProvider } from './context/LibraryContext.tsx'; // Import the provider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LibraryProvider> {/* Wrap App with the provider */}
      <App />
    </LibraryProvider>
  </StrictMode>,
);
