"use client";

import { useState, useCallback, useRef } from "react";
import { useGemini } from "./useApi";

interface UseWordGeneratorOptions {
  onWordReady?: (word: string) => void;
  onError?: (error: string) => void;
}

export function useWordGenerator(options: UseWordGeneratorOptions = {}) {
  const [words, setWords] = useState<string[]>([]);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [isWaitingForApi, setIsWaitingForApi] = useState(false);

  const lastFetchedRef = useRef({ lang: "", cat: "" });
  const isWaitingForApiRef = useRef(false);
  const onWordReadyRef = useRef(options.onWordReady);
  const onErrorRef = useRef(options.onError);
  onWordReadyRef.current = options.onWordReady;
  onErrorRef.current = options.onError;

  const { mutateAsync, isPending } = useGemini();

  const parseWords = (response: string): string[] => {
    return response
      .split("\n")
      .map((w) => w.trim())
      .filter((w) => w.length > 0)
      .slice(0, 10);
  };

  const buildPrompt = (lang: string, cat: string, excludeWords: string[]) => {
    const excludeList =
      excludeWords.length > 0
        ? `\n\nCác từ đã sử dụng (KHÔNG được lặp lại):\n${excludeWords.join(
            ", "
          )}`
        : "";

    const randomSeed = Math.floor(Math.random() * 1000);
    const hints = [
      "Hãy nghĩ đến những thứ ít ai nhớ đến đầu tiên",
      "Ưu tiên những thứ độc đáo, thú vị",
      "Tránh những từ quá phổ biến, hãy sáng tạo hơn",
      "Hãy nghĩ đến những thứ bất ngờ trong chủ đề này",
      "Chọn những thứ mà người ta thường quên mất",
    ];

    return `Bạn là một trợ lý tạo từ vựng cho game Imposter (trò chơi tìm kẻ mạo danh đang nổi tiếng trên TikTok).

Yêu cầu:
- Ngôn ngữ: ${lang}
- Chủ đề: ${cat}
- Random seed: ${randomSeed}

Hãy đưa ra 10 từ vựng NGẪU NHIÊN phù hợp với ngôn ngữ và chủ đề trên.

Quy tắc:
1. ${hints[randomSeed % 5]}
2. KHÔNG chọn những từ quá hiển nhiên hoặc được nhắc đến đầu tiên khi nghĩ về chủ đề
3. Từ phải phổ biến đủ để người chơi có thể mô tả được, nhưng không phải là từ đầu tiên ai cũng nghĩ đến
4. Từ không được quá đơn giản (như "cây", "nhà") hoặc quá khó
5. Từ phải cụ thể, rõ ràng (ví dụ: "xe đạp" thay vì "phương tiện")
6. Mỗi từ trên một dòng riêng
7. Không thêm số thứ tự, dấu ngoặc kép, dấu chấm hay ký tự đặc biệt
8. 10 từ phải khác nhau và đa dạng${excludeList}

Từ vựng:`;
  };

  const fetchWords = useCallback(
    async (lang: string, cat: string, excludeWords: string[] = []) => {
      lastFetchedRef.current = { lang, cat };

      try {
        const response = await mutateAsync(
          buildPrompt(lang, cat, excludeWords)
        );
        console.log("new-words", response);

        const newWords = parseWords(response);

        if (newWords.length > 0) {
          if (isWaitingForApiRef.current) {
            const word = newWords[0];
            setWords(newWords.slice(1));
            setUsedWords((prev) => [...prev, word]);
            isWaitingForApiRef.current = false;
            setIsWaitingForApi(false);
            onWordReadyRef.current?.(word);
          } else {
            setWords((prev) => [...prev, ...newWords]);
          }
        }
      } catch (error) {
        console.error("AI Error:", error);
        isWaitingForApiRef.current = false;
        setIsWaitingForApi(false);
        onErrorRef.current?.((error as Error).message || "Unknown error");
      }
    },
    [mutateAsync]
  );

  const getNextWord = useCallback(
    (lang: string, cat: string): string | null => {
      const hasChanged =
        lang !== lastFetchedRef.current.lang ||
        cat !== lastFetchedRef.current.cat;

      if (hasChanged) {
        setWords([]);
        setUsedWords([]);
        isWaitingForApiRef.current = true;
        setIsWaitingForApi(true);
        fetchWords(lang, cat, []);
        return null;
      }

      if (words.length > 0) {
        const [nextWord, ...remainingWords] = words;
        setWords(remainingWords);
        setUsedWords((prev) => [...prev, nextWord]);

        if (remainingWords.length < 5) {
          fetchWords(lang, cat, [...usedWords, nextWord, ...remainingWords]);
        }

        return nextWord;
      }

      isWaitingForApiRef.current = true;
      setIsWaitingForApi(true);
      fetchWords(lang, cat, usedWords);
      return null;
    },
    [words, usedWords, fetchWords]
  );

  const prefetch = useCallback(
    (lang: string, cat: string) => {
      if (!lastFetchedRef.current.lang && !lastFetchedRef.current.cat) {
        fetchWords(lang, cat, []);
      }
    },
    [fetchWords]
  );

  const reset = useCallback(() => {
    setWords([]);
    setUsedWords([]);
    isWaitingForApiRef.current = false;
    setIsWaitingForApi(false);
    lastFetchedRef.current = { lang: "", cat: "" };
  }, []);

  return {
    words,
    usedWords,
    isLoading: isPending,
    isWaitingForApi,
    hasWords: words.length > 0,
    getNextWord,
    prefetch,
    reset,
    lastFetched: lastFetchedRef.current,
  };
}
