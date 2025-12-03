"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import HowToPlayDialog from "@/components/HowToPlayDialog";
import GameSettingsForm from "@/components/GameSettingsForm";
import PlayerRevealDialog from "@/components/PlayerRevealDialog";
import useGemini from "@/hooks/useGemini";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [playerCount, setPlayerCount] = useState("4");
  const [imposterCount, setImposterCount] = useState("1");
  const [language, setLanguage] = useState("");
  const [category, setCategory] = useState("");
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showPlayerReveal, setShowPlayerReveal] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  // Lưu trữ các từ đã fetch
  const [words, setWords] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState<string | null>(null);
  const [isWaitingForApi, setIsWaitingForApi] = useState(false);

  // Lưu trữ tất cả các từ đã sử dụng để tránh lặp lại
  const [usedWords, setUsedWords] = useState<string[]>([]);

  // Lưu trữ lang/cat đã dùng để fetch
  const lastFetchedRef = useRef<{ lang: string; cat: string }>({
    lang: "",
    cat: "",
  });
  const isInitialFetchDone = useRef(false);

  const { executePrompt, isLoading } = useGemini({
    onSuccess: (response) => {
      console.log("AI Response:", response);
      // Parse 10 từ từ response
      const newWords = response
        .split("\n")
        .map((w: string) => w.trim())
        .filter((w: string) => w.length > 0)
        .slice(0, 10);

      if (newWords.length > 0) {
        setWords((prev) => [...prev, ...newWords]);

        // Nếu đang chờ API để bắt đầu game
        if (isWaitingForApi && newWords.length > 0) {
          setCurrentWord(newWords[0]);
          setWords(newWords.slice(1));
          setUsedWords((prev) => [...prev, newWords[0]]);
          setShowPlayerReveal(true);
          setIsWaitingForApi(false);
        }
      }
    },
    onError: (error) => {
      console.error("AI Error:", error);
      setIsWaitingForApi(false);
    },
  });

  const fetchWords = useCallback(
    (lang: string, cat: string, excludeWords: string[] = []) => {
      const excludeList =
        excludeWords.length > 0
          ? `\n\nCác từ đã sử dụng (KHÔNG được lặp lại):\n${excludeWords.join(
              ", "
            )}`
          : "";

      // Tạo seed ngẫu nhiên để đa dạng hóa kết quả
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

  // Fetch ngay khi vào trang
  useEffect(() => {
    if (!isInitialFetchDone.current) {
      isInitialFetchDone.current = true;

      // Đọc lang và cat từ URL search params
      const langParam = searchParams.get("lang");
      const catParam = searchParams.get("cat");

      if (langParam) setLanguage(langParam);
      if (catParam) setCategory(catParam);

      fetchWords(langParam || "tiếng Việt", catParam || "bất kỳ", []);
    }
  }, [fetchWords, searchParams]);

  const handleStart = () => {
    const lang = language.trim() || "tiếng Việt";
    const cat = category.trim() || "bất kỳ";

    // Cập nhật URL search params
    const params = new URLSearchParams();
    if (language.trim()) params.set("lang", language.trim());
    if (category.trim()) params.set("cat", category.trim());
    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : "/imposters", {
      scroll: false,
    });

    const hasChanged =
      lang !== lastFetchedRef.current.lang ||
      cat !== lastFetchedRef.current.cat;

    if (hasChanged) {
      // Lang/cat đã thay đổi -> xóa words cũ, reset usedWords và fetch mới
      setWords([]);
      setUsedWords([]);
      setCurrentWord(null);
      setIsWaitingForApi(true);
      setGameKey((prev) => prev + 1);
      fetchWords(lang, cat, []);
    } else if (words.length > 0) {
      // Không thay đổi và có từ sẵn -> dùng từ đầu tiên
      const [nextWord, ...remainingWords] = words;
      setCurrentWord(nextWord);
      setWords(remainingWords);
      setUsedWords((prev) => [...prev, nextWord]);
      setGameKey((prev) => prev + 1);
      setShowPlayerReveal(true);

      // Nếu còn ít từ thì fetch thêm
      if (remainingWords.length < 5) {
        fetchWords(lang, cat, [...usedWords, nextWord, ...remainingWords]);
      }
    } else {
      // Không thay đổi nhưng không có từ -> fetch và chờ để start game
      setIsWaitingForApi(true);
      setGameKey((prev) => prev + 1);
      fetchWords(lang, cat, usedWords);
    }
  };

  const handleHowToPlay = () => {
    setShowHowToPlay(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HowToPlayDialog open={showHowToPlay} onOpenChange={setShowHowToPlay} />
      <PlayerRevealDialog
        open={showPlayerReveal}
        onOpenChange={setShowPlayerReveal}
        playerCount={parseInt(playerCount)}
        imposterCount={parseInt(imposterCount)}
        word={currentWord || ""}
        gameKey={gameKey}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <GameSettingsForm
          playerCount={playerCount}
          setPlayerCount={setPlayerCount}
          imposterCount={imposterCount}
          setImposterCount={setImposterCount}
          language={language}
          setLanguage={setLanguage}
          category={category}
          setCategory={setCategory}
          onStart={handleStart}
          onHowToPlay={handleHowToPlay}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
