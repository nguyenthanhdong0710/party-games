"use client";

import { useGeminiApi } from "@/hooks/useApi";
import { AxiosError } from "axios";

interface UseGeminiOptions {
  onSuccess?: (response: string) => void;
  onError?: (error: AxiosError<{ error: string }>) => void;
}

interface UseGeminiReturn {
  executePrompt: (prompt: string) => void;
  isLoading: boolean;
  error: AxiosError<{ error: string }> | null;
  response: string | null;
}

export default function useGemini(options?: UseGeminiOptions): UseGeminiReturn {
  const mutation = useGeminiApi();

  const executePrompt = (prompt: string) => {
    mutation.mutate(prompt, {
      onSuccess: (data) => {
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        options?.onError?.(error as AxiosError<{ error: string }>);
      },
    });
  };

  return {
    executePrompt,
    isLoading: mutation.isPending,
    error: mutation.error as AxiosError<{ error: string }>,
    response: mutation.data || null,
  };
}
