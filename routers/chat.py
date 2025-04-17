from fastapi import APIRouter, HTTPException, Request
from fastapi import APIRouter, HTTPException, Request
import httpx
import json
import os
# Import both RAG retrieval and the original library loading function
from rag_service import retrieve_relevant_chunks
from database import get_libraries # Re-added for chat-ver2

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

@chat_router.post("/chat-rag")
async def chat_handler(request: Request):
    try:
        data = await request.json()
        user_prompt = data.get("prompt")
        selected_model = data.get("model", DEFAULT_MODEL)
        
        if not user_prompt:
            raise HTTPException(status_code=400, detail="Prompt is required.")
        
        # Get selected libraries
        selected_libraries = data.get("selected_libraries", []) # Expecting a list of integers (IDs)

        # Read config files early
        preprompt, endoff, _ = await read_config_files() # retrieval_prompt no longer needed here

        if selected_libraries:
            # Libraries selected, perform RAG retrieval
            print("------ Performing RAG retrieval -------")
            retrieved_docs = retrieve_relevant_chunks(user_prompt, selected_libraries)
            retrieved_context = "\n\n---\n\n".join(retrieved_docs) # Join chunks with separators
            if not retrieved_context:
                 retrieved_context = "No relevant documentation found in the selected libraries."
        else:
            # No libraries selected, skip RAG
            print("------ Skipping RAG retrieval (No Libraries Selected) -------")
            retrieved_context = None # Explicitly set to None when skipped

        # Construct prompt conditionally
        if retrieved_context is not None:
            # Include context if retrieval was performed (even if empty or 'not found' message)
            full_prompt = f"Relevant Documentation:\n{retrieved_context}\n\n---\n\n{preprompt.replace('[INSERT QUESTION]', user_prompt)}"
        else:
            # No libraries selected, use only the base preprompt
            full_prompt = f"{preprompt.replace('[INSERT QUESTION]', user_prompt)}"

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


# Restoring the original two-stage chat handler
@chat_router.post("/chat-pipeline")
async def chat_handler_two_stage(request: Request):
    try:
        data = await request.json()
        user_prompt = data.get("prompt")
        selected_model = data.get("model", DEFAULT_MODEL)

        if not user_prompt:
            raise HTTPException(status_code=400, detail="Prompt is required.")

        # Get the libraries using the original method
        selected_libraries = data.get("selected_libraries", [])
        # Read config files
        preprompt, endoff, retrieval_prompt = await read_config_files()

        if selected_libraries:
            # Libraries selected, proceed with Stage 1 analysis
            content_array = get_libraries(selected_libraries) # Uses the function from database.py
            library_text = "\n---\n".join(content_array)

            # STAGE 1: Analysis and extraction of relevant documentation
            # Replace placeholders in the retrieval prompt
            stage1_prompt = retrieval_prompt.replace("[INSERT QUESTION]", user_prompt).replace("[DOCUMENTATION_TEXT]", library_text)

            print("------ Stage 1 Prompt -------")
            print(stage1_prompt)

            # First LLM call to analyze and extract relevant information
            stage1_response = await generate_llm_response(stage1_prompt, selected_model)

            print("------ Stage 1 Response -------")
            print(stage1_response)
        else:
            # No libraries selected, skip Stage 1 and provide a default message
            stage1_response = "No libraries were selected for analysis."
            print("------ Stage 1 Skipped (No Libraries Selected) -------")


        # STAGE 2: Use the extracted information (or default message) for final response
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


# New endpoint combining RAG retrieval with condensation step
@chat_router.post("/chat-rag-2")
async def chat_handler_rag_2(request: Request):
    try:
        data = await request.json()
        user_prompt = data.get("prompt")
        selected_model = data.get("model", DEFAULT_MODEL)

        if not user_prompt:
            raise HTTPException(status_code=400, detail="Prompt is required.")

        # Get selected libraries
        selected_libraries = data.get("selected_libraries", []) # Expecting a list of integers (IDs)

        # Read config files
        preprompt, endoff, retrieval_prompt = await read_config_files()

        condensed_context = None # Initialize to None

        if selected_libraries:
            # Libraries selected, perform RAG retrieval
            print("------ Performing RAG retrieval (RAG-2) -------")
            retrieved_docs = retrieve_relevant_chunks(user_prompt, selected_libraries)
            raw_retrieved_context = "\n\n---\n\n".join(retrieved_docs) # Join chunks with separators

            if not raw_retrieved_context:
                 raw_retrieved_context = "No relevant documentation found in the selected libraries."
                 condensed_context = raw_retrieved_context # Use the 'not found' message directly
                 print("------ Condensation Skipped (No Docs Found) (RAG-2) -------")
            else:
                # STAGE 1 (Condensation): Use retrieval prompt on RAG results
                condensation_prompt = retrieval_prompt.replace("[INSERT QUESTION]", user_prompt).replace("[DOCUMENTATION_TEXT]", raw_retrieved_context)

                print("------ Condensation Prompt (RAG-2) -------")
                print(condensation_prompt)

                # LLM call to condense/analyze the RAG context
                condensed_context = await generate_llm_response(condensation_prompt, selected_model)

                print("------ Condensed Context (RAG-2) -------")
                print(condensed_context)

        else:
            # No libraries selected, skip RAG and Condensation
            condensed_context = "No libraries were selected for analysis."
            print("------ RAG and Condensation Skipped (No Libraries Selected) (RAG-2) -------")


        # STAGE 2: Use the condensed context (or default message) for final response
        stage2_prompt = f"## Relevant Documentation:\n{condensed_context}\n\n--- End of Relevant Documentation ---\n\n{preprompt.replace('[INSERT QUESTION]', user_prompt)}"

        print("------ Stage 2 Prompt (RAG-2) -------")
        print(stage2_prompt)

        # Final LLM call to generate the answer
        final_response = await generate_llm_response(stage2_prompt, selected_model)

        return {
            "response": final_response,
            "analysis": condensed_context  # Return the condensed context as analysis
        }

    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Ollama API error: {e}")
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail="Invalid JSON response from Ollama API")
    except Exception as e:
        print(f"Unhandled error in chat handler (RAG-2): {e}") # Log the error
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
