"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import HowToPlayDialog from "@/components/imposters/HowToPlayDialog";
import GameSettingsFormOffline from "@/components/imposters/GameSettingsFormOffline";
import PlayerRevealDialogOffline from "@/components/imposters/PlayerRevealDialogOffline";
import { useWordGenerator } from "@/hooks/useWordGenerator";

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
  const [currentWord, setCurrentWord] = useState<string | null>(null);

  const isInitialFetchDone = useRef(false);

  const { isLoading, isWaitingForApi, getNextWord, prefetch } = useWordGenerator({
    onWordReady: (word) => {
      setCurrentWord(word);
      setShowPlayerReveal(true);
    },
  });

  // Fetch ngay khi vào trang
  useEffect(() => {
    if (!isInitialFetchDone.current) {
      isInitialFetchDone.current = true;

      const langParam = searchParams.get("lang");
      const catParam = searchParams.get("cat");

      if (langParam) setLanguage(langParam);
      if (catParam) setCategory(catParam);

      prefetch(langParam || "tiếng Việt", catParam || "bất kỳ");
    }
  }, [prefetch, searchParams]);

  const handleStart = () => {
    const lang = language.trim() || "tiếng Việt";
    const cat = category.trim() || "bất kỳ";

    // Cập nhật URL search params
    const params = new URLSearchParams();
    if (language.trim()) params.set("lang", language.trim());
    if (category.trim()) params.set("cat", category.trim());
    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : "/imposters/offline", {
      scroll: false,
    });

    setGameKey((prev) => prev + 1);

    const word = getNextWord(lang, cat);
    if (word) {
      setCurrentWord(word);
      setShowPlayerReveal(true);
    }
  };

  const handleHowToPlay = () => {
    setShowHowToPlay(true);
  };

  return (
    <>
      <HowToPlayDialog open={showHowToPlay} onOpenChange={setShowHowToPlay} />
      <PlayerRevealDialogOffline
        open={showPlayerReveal}
        onOpenChange={setShowPlayerReveal}
        playerCount={parseInt(playerCount)}
        imposterCount={parseInt(imposterCount)}
        word={currentWord || ""}
        gameKey={gameKey}
      />

      <GameSettingsFormOffline
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
        isLoading={isLoading || isWaitingForApi}
      />
    </>
  );
}
