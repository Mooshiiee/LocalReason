import { VersionType } from '@/components/VersionToggle';
import axios from 'axios';


interface AxiosError extends Error {
  response?: {
    status: number;
  };
  request?: unknown;
}
export const sendPrompt = async (prompt: string, backendUrl: string, model: string, selected_libraries: number[], ver: VersionType) => {
  try {
    let chat_endpoint: string;

    // Map VersionType to the correct API endpoint
    switch (ver) {
      case "1":
        chat_endpoint = 'api/chat-pipeline'; // Version 1 is Pipeline
        break;
      case "2":
        chat_endpoint = 'api/chat-rag'; // Version 2 is RAG
        break;
      case "3":
        chat_endpoint = 'api/chat-rag-2'; // Version 3 is RAG-2
        break;
      default:
        // Default to RAG if ver is somehow invalid (shouldn't happen with TypeScript)
        console.warn(`Invalid version type received: ${ver}. Defaulting to RAG.`);
        chat_endpoint = 'api/chat-rag'; 
    }

    const response = await axios.post(`${backendUrl}/${chat_endpoint}`, { prompt, model, selected_libraries });
    return { response: response.data.response, error: null };
  } catch (error: unknown) {
    if (error instanceof Error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        return { response: null, error: `HTTP error! status: ${axiosError.response.status}` };
      } else if (axiosError.request) {
        // The request was made but no response was received
        return { response: null, error: "The request was made but no response was received" };
      } else {
        return { response: null, error: 'Error: ' + error.message };
      }
    }
    return {response: null, error: "An unknown error occurred"}
  }
};
