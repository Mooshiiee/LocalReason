import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom'; // Import routing components
import { sendPrompt } from './api/chat';
import { LibraryToggle } from './components/LibraryToggle';
import { LibraryFormPage } from './pages/LibraryFormPage'; // Import the actual page component

const DEFAULT_BACKEND_URL = 'http://localhost:8000';
const DEFAULT_MODEL = "llama3.2:3b";
const RECOMMENDED_MODELS = [
  "llama3.2:3b",
  "mistralai/Mistral-7B-Instruct-v0.1",
  "codellama/CodeLlama-7b-Instruct-hf"
];

function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [backendUrl, setBackendUrl] = useState(DEFAULT_BACKEND_URL);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResponse(''); // Clear previous response
    setIsLoading(true);

    try {
      const { response, error } = await sendPrompt(prompt, backendUrl, selectedModel);
      if (error) {
        setError(error);
      } else {
        setResponse(response || '');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // This fetch seems unrelated to the main prompt/response logic,
  // consider if it's still needed or should be moved/removed.
  const fetchLibraries = async () => {
    const response = await fetch(`${backendUrl}/db/libraries`);
    const data = await response.json();
    console.log(data); // Logs library data to console on initial load
  }

  useEffect(() => {
    fetchLibraries();
  }, []); // Empty dependency array means this runs once on mount

  // Component for the main page content (rendered at '/')
  const MainPage = () => (
    <>
      {/* Backend URL Input */}
      <div className="w-3/4 flex items-center justify-between mb-4 pt-4">
        <label htmlFor="backend-url" className="mr-2 font-medium text-black">
          Backend URL:
        </label>
        <input
          type="text"
          id="backend-url"
          className="p-2 border border-black text-black flex-grow bg-white"
          value={backendUrl}
          onChange={(e) => setBackendUrl(e.target.value)}
        />
        <button
          type="button"
          className="group relative inline-block text-sm font-medium text-indigo-600 focus:ring-1 focus:outline-hidden ml-4"
          onClick={() => setBackendUrl(DEFAULT_BACKEND_URL)}
        >
          <span className="absolute inset-0 translate-x-0 translate-y-0 bg-indigo-600 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"></span>
          <span className="relative block border border-current bg-white px-4 py-2 text-sm">
            Reset to Default
          </span>
        </button>
      </div>

      {/* Model Selection */}
      <div className="w-3/4 flex items-center justify-between mb-4">
        <label htmlFor="model-select" className="mr-2 font-medium text-black">
          Model:
        </label>
        <select
          id="model-select"
          className="p-2 border border-black text-black flex-grow bg-white"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          {RECOMMENDED_MODELS.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>

      {/* Library Toggle Component */}
      <LibraryToggle />

      {/* Prompt Form */}
      <form onSubmit={handleSubmit} className="w-3/4">
        <textarea
          className="w-full h-64 p-4 border border-black resize-none text-black border bg-white"
          placeholder="Enter your prompt here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          type="submit"
          className="group relative inline-block text-sm font-medium text-indigo-600 focus:ring-1 focus:outline-hidden my-4"
        >
          <span
            className="absolute inset-0 translate-x-0 translate-y-0 bg-indigo-600 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"
          ></span>
          <span className="relative block border border-current bg-white px-8 py-3">
            Submit
          </span>
        </button>
      </form>

      {/* Response/Error Display */}
      <div className='w-3/4 pb-8'>
        {isLoading && (
          <div className="mt-4">
            <h2 className="text-2xl font-bold mb-2 text-black animate-pulse">Loading...</h2>
          </div>
        )}
        {error && (
          <div className="mt-4">
            <h2 className="text-2xl font-bold mb-2 text-red-600">Error:</h2>
            <div className="whitespace-pre-wrap p-4 border border-black bg-white text-red-600">
              {error}
            </div>
          </div>
        )}
        {response && (
          <div className="mt-4">
            <div className="flex flex-row items-center justify-between m-1">
              <h2 className="text-2xl font-bold mb-2 text-black">Response:</h2>
              <button
                onClick={() => {navigator.clipboard.writeText(response)}}
                type='button'
                className='bg-purple-600 text-white px-4 py-2 hover:bg-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50'
              >
                Copy
              </button>
            </div>
            <div className="whitespace-pre-wrap border p-4 border-black bg-white text-black">
              {response}
            </div>
          </div>
        )}
      </div>
    </>
  );

  // Main App return statement with routing
  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-tr from-green-200 from-0% to-violet-300 to-100%">
      {/* Static Header */}
      <h1 className="text-4xl text-black font-bold text-center pt-12 pb-6">
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
