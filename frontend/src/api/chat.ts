import axios from 'axios';

export const sendPrompt = async (prompt: string, backendUrl: string) => {
  try {
    const response = await axios.post(`${backendUrl}/api/chat`, { prompt });
    return { response: response.data.response, error: null };
  } catch (error: any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return { response: null, error: `HTTP error! status: ${error.response.status}` };
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      return { response: null, error: "The request was made but no response was received" };
    } else {
      // Something happened in setting up the request that triggered an Error
      return { response: null, error: 'Error: ' + error.message };
    }
  }
};
