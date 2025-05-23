# LocalReason

LocalReason is a local-first AI reasoning engine that performs initial Chain-of-Thought (CoT) reasoning using llama3.2:3B before querying stronger LLMs. It supports Retrieval-Augmented Generation (RAG) from user-selected documentation and enables structured, explainable prompt expansion entirely offline. Built with FastAPI and Vite, it offers a modular, privacy-friendly solution for intelligent local inference for coding related tasks.

## Features

*   **Chat Interface:** Provides a user interface for interacting with an LLM and producing expanded prompt
*   **Library Management:** Allows users to add, update, and manage document libraries used for RAG.
*   **RAG Integration:** Leverages ChromaDB to index and retrieve relevant information from local document libraries to enhance LLM responses.
*   **Configurable Prompts:** Utilizes different prompt templates stored in the `config/` directory for various chat modes (e.g., plain generation, RAG, or two-step pipeline).
*   **Multiple Chat Endpoints:** Offers different API endpoints (`/chat`, `/chat-rag`, `/chat-pipeline`, `/chat-rag-2`) implementing various chat strategies. 

## Tech Stack

    *   Python
    *   FastAPI (Web framework)
    *   Ollama
    *   ChromaDB (Vector database for RAG)
    *   SQLite3
    *   Vite

## Project Structure

```
.
├── chroma_db/        # ChromaDB vector store (will be generated on startup)
├── config/           # Prompt templates and configuration files
├── frontend/         # React/Vite frontend application source
├── routers/          # FastAPI backend API route definitions
├── database.db       # SQLite database (likely for library metadata via SQLModel)
├── database.py       # SQLModel definitions and database interaction logic
├── main.py           # FastAPI application entry point
├── rag_service.py    # Core logic for RAG indexing and retrieval
├── requirements.txt  # Python dependencies
└── README.md         # This file
```

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd LocalReason
    ```

2.  **Backend Setup:**
    *   Ensure you have Python installed (check `.python-version` if applicable, or use a recent version like 3.10+).
    *   Create and activate a virtual environment (recommended):
        ```bash
        python -m venv venv
        source venv/bin/activate  # On Windows use `venv\Scripts\activate`
        ```
    *   Install Python dependencies:
        ```bash
        pip install -r requirements.txt
        ```
    *   Ensure Ollama is running and accessible (defaults to `http://localhost:11434`). You might need to pull the required model (e.g., `ollama pull llama3.2:3b`).


 ## Start the Application Server:**
   ** Steps **
    *   From the root directory (LocalReason/):
  ```bash
  cd frontend
  npm i
  npm run build
  cd .. 
  fastapi run main.py

  -- IF ShadCN ERROR :
  cd frontend
  npx shadcn@latest add utils
  cd ..
  fastapi run main.py
  ```
  Connects to Ollama API via default port 
  
  The backend API will typically be available at `http://127.0.0.1:8000`.



