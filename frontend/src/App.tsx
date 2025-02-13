import React from 'react';

function App() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-tr from-green-200 from-0% to-violet-300 to-100%">

      <h1 className="text-4xl text-black font-bold text-center pt-12 pb-6">
        Local Reason
      </h1>

      <textarea
        className="w-3/4 h-64 p-4 border border-black rounded-lg resize-none text-black border bg-white"
        placeholder="Enter your text here..."
      />

      <a
        className="group relative inline-block text-sm font-medium text-indigo-600 focus:ring-1 focus:outline-hidden my-4"
        href="#"
      >
        <span
          className="absolute inset-0 translate-x-0 translate-y-0 bg-indigo-600 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"
        ></span>

        <span className="relative block border border-current bg-white px-8 py-3"> Download </span>
      </a>

    </div>
  );
}

export default App;