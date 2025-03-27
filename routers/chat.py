from fastapi import APIRouter, HTTPException, Request
import httpx
import json
import os

chat_router = APIRouter()

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
DEFAULT_MODEL = "llama3.2:3b"

async def read_config_files():
    try:
        with open("config/preprompt.txt", "r") as f:
            preprompt = f.read()
        with open("config/endoff.txt", "r") as f:
            endoff = f.read()
        return preprompt, endoff
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Configuration files not found.")

@chat_router.post("/chat")
async def chat_handler(request: Request):
    try:
        data = await request.json()
        user_prompt = data.get("prompt")
        selected_model = data.get("model", DEFAULT_MODEL)
        if not user_prompt:
            raise HTTPException(status_code=400, detail="Prompt is required.")

        preprompt, endoff = await read_config_files()
        full_prompt = preprompt.replace("[INSERT QUESTION]", user_prompt)
        # endoff logic (currently unused)
        # full_prompt += endoff

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
                timeout=70.0
            )
            response.raise_for_status()
            response_data = response.json()
            return {"response": response_data["response"]}

    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Ollama API error: {e}")
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail="Invalid JSON response from Ollama API")
