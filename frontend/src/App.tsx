import { useState } from 'react';
import { Routes, Route } from 'react-router-dom'; // Import routing components
import { sendPrompt } from './api/chat';
import { LibraryToggle } from './components/LibraryToggle';
import { LibraryFormPage } from './pages/LibraryFormPage'; // Import the actual page component
import { Button } from './components/ui/button';
import { useLibrary } from './context/LibraryContext';
import { VersionToggleGroup, VersionType } from './components/VersionToggle'; // Import VersionType here

const DEFAULT_BACKEND_URL = 'http://localhost:8000';
const DEFAULT_MODEL = "llama3.2:3b";
const RECOMMENDED_MODELS = [
  "llama3.2:3b",
  "mistralai/Mistral-7B-Instruct-v0.1",
  "codellama/CodeLlama-7b-Instruct-hf"
];

// Define MainPage outside the App component to prevent re-creation on App re-renders
const MainPage = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [backendUrl, setBackendUrl] = useState(DEFAULT_BACKEND_URL);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedLibraries } = useLibrary();

  const [version, setVersion] = useState<VersionType>("1") // Use imported VersionType

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResponse(''); // Clear previous response
    setIsLoading(true);

    try {
      const { response, error } = await sendPrompt(prompt, backendUrl, selectedModel, selectedLibraries, version);
      if (error) {
        setError(error);
      } else {
        setResponse(response || '');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backend URL Input */}
      <div className="w-3/4 flex items-center justify-between mb-4 pt-4">
        <label htmlFor="backend-url" className="mr-2 font-medium text-foreground"> {/* text-black -> text-foreground */}
          Backend URL:
        </label>
        <input
          type="text"
          id="backend-url"
          className="p-2 border border-border text-foreground flex-grow bg-input" /* border-black -> border-border, text-black -> text-foreground, bg-white -> bg-input */
          value={backendUrl}
          onChange={(e) => setBackendUrl(e.target.value)}
        />
        <button
          type="button"
          className="group relative inline-block text-sm font-medium text-primary focus:ring-1 focus:outline-hidden ml-4" /* text-indigo-600 -> text-primary */
          onClick={() => setBackendUrl(DEFAULT_BACKEND_URL)}
        >
          <span className="absolute inset-0 translate-x-0 translate-y-0 bg-primary transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"></span> {/* bg-indigo-600 -> bg-primary */}
          <span className="relative block border border-current bg-card px-4 py-2 text-sm"> {/* bg-white -> bg-card */}
            Reset to Default
          </span>
        </button>
      </div>

      {/* Model Selection */}
      <div className="w-3/4 flex items-center justify-between mb-4 gap-3">
        <label htmlFor="model-select" className="mr-2 font-medium text-foreground"> {/* text-black -> text-foreground */}
          Model:
        </label>
        <select
          id="model-select"
          className="p-2 border border-border text-foreground flex-grow bg-input" /* border-black -> border-border, text-black -> text-foreground, bg-white -> bg-input */
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          {RECOMMENDED_MODELS.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
        
        <VersionToggleGroup version={version} setVersion={setVersion} />

      </div>
        
      <div className='p-4' >
      </div>

      {/* Library Toggle Component */}

      <LibraryToggle />

      {/* Prompt Form */}
      <form onSubmit={handleSubmit} className="w-3/4">
        <textarea
          className="w-full h-64 p-4 border border-border resize-none text-foreground bg-input placeholder:text-muted-foreground" /* border-black -> border-border, text-black -> text-foreground, bg-white -> bg-input, added placeholder style */
          placeholder="Enter your prompt here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          type="submit"
          className="group relative inline-block text-sm font-medium text-primary focus:ring-1 focus:outline-hidden my-4" /* text-indigo-600 -> text-primary */
        >
          <span
            className="absolute inset-0 translate-x-0 translate-y-0 bg-primary transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" /* bg-indigo-600 -> bg-primary */
          ></span>
          <span className="relative block border border-current bg-card px-8 py-3"> {/* bg-white -> bg-card */}
            Submit
          </span>
        </button>
      </form>

      <Button onClick={() => {console.log(selectedLibraries)}}>
          Check selected libraries
      </Button>

      {/* Response/Error Display */}
      <div className='w-3/4 pb-8'>
        {isLoading && (
          <div className="mt-4">
            <h2 className="text-2xl font-bold mb-2 text-foreground animate-pulse">Loading...</h2> {/* text-black -> text-foreground */}
          </div>
        )}
        {error && (
          <div className="mt-4">
            <h2 className="text-2xl font-bold mb-2 text-destructive">Error:</h2> {/* text-red-600 -> text-destructive */}
            <div className="whitespace-pre-wrap p-4 border border-border bg-card text-destructive"> {/* border-black -> border-border, bg-white -> bg-card, text-red-600 -> text-destructive */}
              {error}
            </div>
          </div>
        )}
        {response && (
          <div className="mt-4">
            <div className="flex flex-row items-center justify-between m-1">
              <h2 className="text-2xl font-bold mb-2 text-foreground">Response:</h2> {/* text-black -> text-foreground */}
              <button
                onClick={() => {navigator.clipboard.writeText(response)}}
                type='button'
                className='bg-primary text-primary-foreground px-4 py-2 hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50' /* bg-purple-600 -> bg-primary, text-white -> text-primary-foreground, hover:bg-purple-300 -> hover:bg-primary/80, focus:ring-purple-600 -> focus:ring-primary */
              >
                Copy
              </button>
            </div>
            <div className="whitespace-pre-wrap border p-4 border-border bg-card text-foreground"> {/* border-black -> border-border, bg-white -> bg-card, text-black -> text-foreground */}
              {response}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

function App() {
  // Main App return statement with routing
  return (
    // Removed gradient, added dark class, using theme background/foreground
    <div className="dark flex flex-col items-center min-h-screen bg-background text-foreground">
      {/* Static Header */}
      <h1 className="text-4xl text-foreground font-bold text-center pt-12 pb-6"> {/* text-black -> text-foreground */}
        Local Reason
      </h1>

      {/* Define application routes */}
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/library/new" element={<LibraryFormPage />} /> {/* Use actual component */}
        <Route path="/library/edit/:id" element={<LibraryFormPage />} /> {/* Use actual component */}
        {/* Add other routes here if needed */}
      </Routes>
    </div>
  );
}

export default App;
