import axios from 'axios';

interface AxiosError extends Error {
  response?: {
    status: number;
  };
  request?: unknown;
}
export const sendPrompt = async (prompt: string, backendUrl: string, model: string) => {
  try {
    const response = await axios.post(`${backendUrl}/api/chat`, { prompt, model });
    return { response: response.data.response, error: null };
  } catch (error: unknown) {
    if (error instanceof Error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return { response: null, error: `HTTP error! status: ${axiosError.response.status}` };
      } else if (axiosError.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        return { response: null, error: "The request was made but no response was received" };
      } else {
        // Something happened in setting up the request that triggered an Error
        return { response: null, error: 'Error: ' + error.message };
      }
    }
    return {response: null, error: "An unknown error occurred"}
  }
};
