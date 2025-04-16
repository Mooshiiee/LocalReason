from fastapi import APIRouter, HTTPException, Request
import httpx
import json
import os
from database import get_libraries

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
        
        # get the libraries
        selected_libraries = data.get("selected_libraries", [])
        content_array = get_libraries(selected_libraries)
        library_text = "\n---\n".join(content_array)
    
        # construct prompt
        preprompt, endoff, retrival = await read_config_files() 
        # not using endoff statement
        
        #full_prompt = preprompt.replace("[INSERT QUESTION]", user_prompt)
        full_prompt = f"Relevant Documentation:\n{library_text}\n\n---\n\n{preprompt.replace('[INSERT QUESTION]', user_prompt)}"

        # endoff logic (currently unused)
        # full_prompt += endoff
        
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

@chat_router.post("/chat-ver2")
async def chat_handler_two_stage(request: Request):
    try:
        data = await request.json()
        user_prompt = data.get("prompt")
        selected_model = data.get("model", DEFAULT_MODEL)
        
        if not user_prompt:
            raise HTTPException(status_code=400, detail="Prompt is required.")
        
        # Get the libraries
        selected_libraries = data.get("selected_libraries", [])
        content_array = get_libraries(selected_libraries)
        library_text = "\n---\n".join(content_array)
        
        # Read config files
        preprompt, endoff, retrieval_prompt = await read_config_files()
        
        # STAGE 1: Analysis and extraction of relevant documentation
        # Replace placeholders in the retrieval prompt
        stage1_prompt = retrieval_prompt.replace("[INSERT QUESTION]", user_prompt).replace("[DOCUMENTATION_TEXT]", library_text)
        
        
        print("------ Stage 1 Prompt -------")
        print(stage1_prompt)

        # First LLM call to analyze and extract relevant information
        stage1_response = await generate_llm_response(stage1_prompt, selected_model)
        
        print("------ Stage 1 Response -------")
        print(stage1_response)
        
        # STAGE 2: Use the extracted information for final response
        # Use the retrieved context in the final prompt
        stage2_prompt = f"## Relevant Documentation:\n{stage1_response}\n\n--- End of Relevant Documentation ---\n\n{preprompt.replace('[INSERT QUESTION]', user_prompt)}"
        
        print("------ Stage 2 Prompt -------")
        print(stage2_prompt)
        
        # Second LLM call to generate the final answer
        stage2_response = await generate_llm_response(stage2_prompt, selected_model)
        
        return {
            "response": stage2_response,
            "analysis": stage1_response  # Optionally return the first stage analysis
        }
        
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Ollama API error: {e}")
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail="Invalid JSON response from Ollama API")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")