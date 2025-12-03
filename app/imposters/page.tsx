"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import HowToPlayDialog from "@/components/HowToPlayDialog";
import GameSettingsForm from "@/components/GameSettingsForm";
import PlayerRevealDialog from "@/components/PlayerRevealDialog";
import useGemini from "@/hooks/useGemini";

export default function Home() {
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

  // Lưu trữ lang/cat đã dùng để fetch
  const lastFetchedRef = useRef<{ lang: string; cat: string }>({
    lang: "",
    cat: "",
  });
  const isInitialFetchDone = useRef(false);

  const { executePrompt, isLoading } = useGemini({
    onSuccess: (response) => {
      console.log("AI Response:", response);
      // Parse 2 từ từ response
      const newWords = response
        .split("\n")
        .map((w: string) => w.trim())
        .filter((w: string) => w.length > 0)
        .slice(0, 2);

      if (newWords.length > 0) {
        setWords((prev) => [...prev, ...newWords]);

        // Nếu đang chờ API để bắt đầu game
        if (isWaitingForApi && newWords.length > 0) {
          setCurrentWord(newWords[0]);
          setWords(newWords.slice(1));
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
    (lang: string, cat: string) => {
      const prompt = `Bạn là một trợ lý tạo từ vựng cho game Imposter (trò chơi tìm kẻ mạo danh đang nổi tiếng trên TikTok).

Yêu cầu:
- Ngôn ngữ: ${lang}
- Chủ đề: ${cat}

Hãy đưa ra 2 từ vựng ngẫu nhiên phù hợp với ngôn ngữ và chủ đề trên.

Quy tắc:
1. Từ phải phổ biến, dễ hiểu để người chơi có thể mô tả được
2. Từ không được quá đơn giản (như "cây", "nhà") hoặc quá khó
3. Từ phải cụ thể, rõ ràng (ví dụ: "xe đạp" thay vì "phương tiện")
4. Mỗi từ trên một dòng riêng
5. Không thêm số thứ tự, dấu ngoặc kép, dấu chấm hay ký tự đặc biệt
6. 2 từ phải khác nhau

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
      fetchWords("tiếng Việt", "bất kỳ");
    }
  }, [fetchWords]);

  const handleStart = () => {
    const lang = language.trim() || "tiếng Việt";
    const cat = category.trim() || "bất kỳ";

    const hasChanged =
      lang !== lastFetchedRef.current.lang ||
      cat !== lastFetchedRef.current.cat;

    if (hasChanged) {
      // Lang/cat đã thay đổi -> xóa words cũ và fetch mới
      setWords([]);
      setCurrentWord(null);
      setIsWaitingForApi(true);
      setGameKey((prev) => prev + 1);
      fetchWords(lang, cat);
    } else if (words.length > 0) {
      // Không thay đổi và có từ sẵn -> dùng từ đầu tiên
      const [nextWord, ...remainingWords] = words;
      setCurrentWord(nextWord);
      setWords(remainingWords);
      setGameKey((prev) => prev + 1);
      setShowPlayerReveal(true);

      // Nếu còn ít từ thì fetch thêm
      if (remainingWords.length < 2) {
        fetchWords(lang, cat);
      }
    }
  };

  const handleHowToPlay = () => {
    setShowHowToPlay(true);
  };

  const handleRefresh = () => {
    const lang = language.trim() || "tiếng Việt";
    const cat = category.trim() || "bất kỳ";
    setWords([]);
    fetchWords(lang, cat);
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

      {/* Header */}
      <header className="h-16 flex items-center px-6 border-b">
        <h1 className="text-xl font-bold">LOGO</h1>
      </header>

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
          onRefresh={handleRefresh}
          isRefreshing={isLoading}
        />
      </main>
    </div>
  );
}
