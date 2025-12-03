import { useMutation } from "@tanstack/react-query";
import axios from "axios";

// API functions
const api = {
  // Gemini API
  geminiApi: (prompt: string): Promise<string> => {
    if (!prompt.trim()) {
      throw new Error("Prompt cannot be empty");
    }
    return axios.post("/api/gemini", { prompt }).then((res) => {
      if (!res.data.response) {
        throw new Error("No response from Gemini API");
      }
      return res.data.response;
    });
  },
};

// Gemini Hook
export const useGeminiApi = () => {
  return useMutation({
    mutationFn: api.geminiApi,
  });
};
