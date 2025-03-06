import { useState } from 'react';
import { sendPrompt } from './api/chat';

const DEFAULT_BACKEND_URL = 'http://localhost:8000';

function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [backendUrl, setBackendUrl] = useState(DEFAULT_BACKEND_URL);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    const { response, error } = await sendPrompt(prompt, backendUrl);
    if (error) {
      setError(error);
      setResponse('');
    } else {
      setResponse(response || '');
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-tr from-green-200 from-0% to-violet-300 to-100%">

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

      <h1 className="text-4xl text-black font-bold text-center pt-12 pb-6">
        Local Reason
      </h1>

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

      <div className='w-3/4 pb-8'>
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
            <h2 className="text-2xl font-bold mb-2 text-black">Response:</h2>
            <div className="whitespace-pre-wrap p-4 border border-black bg-white text-black">
              {response}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default App;
