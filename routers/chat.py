from fastapi import APIRouter, HTTPException, Request
from fastapi import APIRouter, HTTPException, Request
import httpx
import json
import os
# Removed: from database import get_libraries
# Import the RAG retrieval function
from rag_service import retrieve_relevant_chunks

chat_router = APIRouter()

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
DEFAULT_MODEL = "llama3.2:3b"

async def read_config_files():
    try:
        with open("config/preprompt-2.txt", "r") as f:
            preprompt = f.read()
        with open("config/endoff.txt", "r") as f:
            endoff = f.read()
        with open("config/retrieval.txt", "r") as f:
            retrieval_prompt = f.read()
        return preprompt, endoff, retrieval_prompt
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Configuration files not found.")

async def generate_llm_response(prompt, model=DEFAULT_MODEL):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{OLLAMA_HOST}/api/generate",
            json={
                "prompt": prompt,
                "model": model,
                "stream": False,
                "options": {
                    "temperature": 0.85,
                    "top_p": 0.75,
                    "repeat_penalty": 1.05,
                    "presence_penalty": 0.015,
                    "frequency_penalty": 0.015,
                },
            },
            timeout=None
        )
        response.raise_for_status()
        response_data = response.json()
        return response_data["response"]

@chat_router.post("/chat")
async def chat_handler(request: Request):
    try:
        data = await request.json()
        user_prompt = data.get("prompt")
        selected_model = data.get("model", DEFAULT_MODEL)
        
        if not user_prompt:
            raise HTTPException(status_code=400, detail="Prompt is required.")
        
        # Get selected libraries
        selected_libraries = data.get("selected_libraries", []) # Expecting a list of integers (IDs)

        # Retrieve relevant chunks using RAG
        retrieved_docs = retrieve_relevant_chunks(user_prompt, selected_libraries)
        retrieved_context = "\n\n---\n\n".join(retrieved_docs) # Join chunks with separators

        # Construct prompt using retrieved context
        preprompt, endoff, _ = await read_config_files() # retrieval_prompt no longer needed here

        if not retrieved_context:
            retrieved_context = "No relevant documentation found in the selected libraries."

        full_prompt = f"Relevant Documentation:\n{retrieved_context}\n\n---\n\n{preprompt.replace('[INSERT QUESTION]', user_prompt)}"

        # endoff logic remains unused
        
        print("------full prompt -------")
        print(full_prompt)

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{OLLAMA_HOST}/api/generate",
                json={
                    "prompt": full_prompt,
                    "model": selected_model,
                    "stream": False,
                      "options": {
                        "temperature": 0.85,
                        "top_p": 0.75,
                        "repeat_penalty": 1.05,
                        "presence_penalty": 0.015,
                        "frequency_penalty": 0.015,
                    },
                },
                timeout=None
            )
            response.raise_for_status()
            response_data = response.json()
            return {"response": response_data["response"]}
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Ollama API error: {e}")
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail="Invalid JSON response from Ollama API")
    except Exception as e: # Catch broader exceptions
        print(f"Unhandled error in chat handler: {e}") # Log the error
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

# Removed the /chat-ver2 endpoint and chat_handler_two_stage function
