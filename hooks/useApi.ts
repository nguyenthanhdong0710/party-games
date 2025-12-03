import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";

// Types
interface AuthVerifyResponse {
  authenticated: boolean;
}

interface AuthLoginResponse {
  success: boolean;
  message?: string;
}

// Query Keys
export const queryKeys = {
  auth: ["auth"] as const,
};

// API functions
const api = {
  // Auth APIs
  checkAuth: (): Promise<AuthVerifyResponse> =>
    axios.get("/api/auth/verify").then((res) => res.data),

  login: (password: string): Promise<AuthLoginResponse> =>
    axios
      .post("/api/auth/verify", { password })
      .then((res) => res.data)
      .catch((err) => {
        if (err.response?.data) {
          return err.response.data;
        }
        throw err;
      }),

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

// Auth Hooks
export const useCheckAuth = () => {
  return useQuery({
    queryKey: queryKeys.auth,
    queryFn: api.checkAuth,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: api.login,
  });
};

// Gemini Hook
export const useGeminiApi = () => {
  return useMutation({
    mutationFn: api.geminiApi,
  });
};
