"use client";

import { useState, useCallback, useRef } from "react";
import useGemini from "./useGemini";

interface UseWordGeneratorOptions {
  onWordReady?: (word: string) => void;
  onError?: (error: string) => void;
}

export function useWordGenerator(options: UseWordGeneratorOptions = {}) {
  const [words, setWords] = useState<string[]>([]);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [isWaitingForApi, setIsWaitingForApi] = useState(false);

  const lastFetchedRef = useRef<{ lang: string; cat: string }>({
    lang: "",
    cat: "",
  });

  const onWordReadyRef = useRef(options.onWordReady);
  onWordReadyRef.current = options.onWordReady;

  const { executePrompt, isLoading } = useGemini({
    onSuccess: (response) => {
      const newWords = response
        .split("\n")
        .map((w: string) => w.trim())
        .filter((w: string) => w.length > 0)
        .slice(0, 10);

      if (newWords.length > 0) {
        setWords((prev) => [...prev, ...newWords]);

        if (isWaitingForApi && newWords.length > 0) {
          const word = newWords[0];
          setWords(newWords.slice(1));
          setUsedWords((prev) => [...prev, word]);
          setIsWaitingForApi(false);
          onWordReadyRef.current?.(word);
        }
      }
    },
    onError: (error) => {
      console.error("AI Error:", error);
      setIsWaitingForApi(false);
      options.onError?.(error.message || "Unknown error");
    },
  });

  const fetchWords = useCallback(
    (lang: string, cat: string, excludeWords: string[] = []) => {
      const excludeList =
        excludeWords.length > 0
          ? `\n\nCác từ đã sử dụng (KHÔNG được lặp lại):\n${excludeWords.join(", ")}`
          : "";

      const randomSeed = Math.floor(Math.random() * 1000);
      const randomHint = [
        "Hãy nghĩ đến những thứ ít ai nhớ đến đầu tiên",
        "Ưu tiên những thứ độc đáo, thú vị",
        "Tránh những từ quá phổ biến, hãy sáng tạo hơn",
        "Hãy nghĩ đến những thứ bất ngờ trong chủ đề này",
        "Chọn những thứ mà người ta thường quên mất",
      ][randomSeed % 5];

      const prompt = `Bạn là một trợ lý tạo từ vựng cho game Imposter (trò chơi tìm kẻ mạo danh đang nổi tiếng trên TikTok).

Yêu cầu:
- Ngôn ngữ: ${lang}
- Chủ đề: ${cat}
- Random seed: ${randomSeed}

Hãy đưa ra 10 từ vựng NGẪU NHIÊN phù hợp với ngôn ngữ và chủ đề trên.

Quy tắc:
1. ${randomHint}
2. KHÔNG chọn những từ quá hiển nhiên hoặc được nhắc đến đầu tiên khi nghĩ về chủ đề
3. Từ phải phổ biến đủ để người chơi có thể mô tả được, nhưng không phải là từ đầu tiên ai cũng nghĩ đến
4. Từ không được quá đơn giản (như "cây", "nhà") hoặc quá khó
5. Từ phải cụ thể, rõ ràng (ví dụ: "xe đạp" thay vì "phương tiện")
6. Mỗi từ trên một dòng riêng
7. Không thêm số thứ tự, dấu ngoặc kép, dấu chấm hay ký tự đặc biệt
8. 10 từ phải khác nhau và đa dạng${excludeList}

Từ vựng:`;

      lastFetchedRef.current = { lang, cat };
      executePrompt(prompt);
    },
    [executePrompt]
  );

  const getNextWord = useCallback(
    (lang: string, cat: string): string | null => {
      const hasChanged =
        lang !== lastFetchedRef.current.lang ||
        cat !== lastFetchedRef.current.cat;

      if (hasChanged) {
        // Settings changed - reset and fetch new words
        setWords([]);
        setUsedWords([]);
        setIsWaitingForApi(true);
        fetchWords(lang, cat, []);
        return null;
      }

      if (words.length > 0) {
        // Use available word
        const [nextWord, ...remainingWords] = words;
        setWords(remainingWords);
        setUsedWords((prev) => [...prev, nextWord]);

        // Prefetch if running low
        if (remainingWords.length < 5) {
          fetchWords(lang, cat, [...usedWords, nextWord, ...remainingWords]);
        }

        return nextWord;
      }

      // No words available - fetch and wait
      setIsWaitingForApi(true);
      fetchWords(lang, cat, usedWords);
      return null;
    },
    [words, usedWords, fetchWords]
  );

  const prefetch = useCallback(
    (lang: string, cat: string) => {
      if (
        lastFetchedRef.current.lang === "" &&
        lastFetchedRef.current.cat === ""
      ) {
        fetchWords(lang, cat, []);
      }
    },
    [fetchWords]
  );

  const reset = useCallback(() => {
    setWords([]);
    setUsedWords([]);
    setIsWaitingForApi(false);
    lastFetchedRef.current = { lang: "", cat: "" };
  }, []);

  return {
    words,
    usedWords,
    isLoading,
    isWaitingForApi,
    getNextWord,
    prefetch,
    reset,
    lastFetched: lastFetchedRef.current,
  };
}
