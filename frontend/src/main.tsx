import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import './index.css';
import App from './App.tsx';
import { LibraryProvider } from './context/LibraryContext.tsx'; // Import the provider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter> {/* Wrap everything with BrowserRouter */}
      <LibraryProvider> {/* Wrap App with the provider */}
        <App />
      </LibraryProvider>
    </BrowserRouter>
  </StrictMode>,
);
