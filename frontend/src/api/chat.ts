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
    let chat_version: string;

    if (!ver) {
      chat_version = 'api/chat';
    } else if (ver === "1") {
      chat_version = 'api/chat';
    } else if (ver === "2") {
      chat_version = 'api/chat-ver2';
    } else {
      chat_version = `api/chat-ver${ver}`; // or set to a default/fallback
    }

    const response = await axios.post(`${backendUrl}/${chat_version}`, { prompt, model, selected_libraries });
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
