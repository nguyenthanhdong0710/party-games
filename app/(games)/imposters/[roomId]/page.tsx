"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, Crown, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePartySocket } from "@/hooks/usePartySocket";
import useGemini from "@/hooks/useGemini";
import PlayerRevealDialog from "@/components/PlayerRevealDialog";
import { DISPLAY_NAME_KEY, PLAYER_ID_KEY } from "@/lib/constants";
import { Minus, Plus } from "lucide-react";

export default function ImpostersRoom() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const [playerId, setPlayerId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPlayerReveal, setShowPlayerReveal] = useState(false);

  // Local settings state (for host)
  const [imposterCount, setImposterCount] = useState("1");
  const [language, setLanguage] = useState("");
  const [category, setCategory] = useState("");

  // Words management
  const [words, setWords] = useState<string[]>([]);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [isWaitingForApi, setIsWaitingForApi] = useState(false);
  const lastFetchedRef = useRef<{ lang: string; cat: string }>({
    lang: "",
    cat: "",
  });
  const isInitialFetchDone = useRef(false);

  // Initialize player info
  useEffect(() => {
    const id = localStorage.getItem(PLAYER_ID_KEY) || "";
    const name = localStorage.getItem(DISPLAY_NAME_KEY) || "";
    setPlayerId(id);
    setDisplayName(name);
  }, []);

  // PartyKit connection
  const { state, isConnected, updateSettings, startGame, newRound, leave } =
    usePartySocket({
      roomId,
      playerId,
      displayName,
      onError: (error) => {
        console.error("PartyKit error:", error);
      },
    });

  const isHost = state?.hostId === playerId;
  const playerCount = state?.players.length || 0;
  const myCard = state?.cards?.find((c) => c.playerId === playerId);

  // Gemini for fetching words
  const { executePrompt, isLoading: isLoadingWords } = useGemini({
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
          startGame(word);
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

      const prompt = `Bạn là một trợ lý tạo từ vựng cho game Imposter.

Yêu cầu:
- Ngôn ngữ: ${lang}
- Chủ đề: ${cat}
- Random seed: ${randomSeed}

Hãy đưa ra 10 từ vựng NGẪU NHIÊN phù hợp với ngôn ngữ và chủ đề trên.

Quy tắc:
1. ${randomHint}
2. KHÔNG chọn những từ quá hiển nhiên
3. Từ phải phổ biến đủ để người chơi có thể mô tả được
4. Từ không được quá đơn giản hoặc quá khó
5. Từ phải cụ thể, rõ ràng
6. Mỗi từ trên một dòng riêng
7. Không thêm số thứ tự hay ký tự đặc biệt
8. 10 từ phải khác nhau và đa dạng${excludeList}

Từ vựng:`;

      lastFetchedRef.current = { lang, cat };
      executePrompt(prompt);
    },
    [executePrompt]
  );

  // Initial fetch for host
  useEffect(() => {
    if (isHost && !isInitialFetchDone.current) {
      isInitialFetchDone.current = true;
      fetchWords("tiếng Việt", "bất kỳ", []);
    }
  }, [isHost, fetchWords]);

  // Show card dialog when game starts
  useEffect(() => {
    if (state?.status === "playing" && myCard) {
      setShowPlayerReveal(true);
    }
  }, [state?.status, state?.gameKey, myCard]);

  const handleSettingsChange = (key: string, value: string | number) => {
    if (!isHost) return;

    const newSettings = {
      imposterCount: parseInt(imposterCount),
      language,
      category,
      [key]: typeof value === "string" ? value : value,
    };

    if (key === "imposterCount") {
      setImposterCount(String(value));
      newSettings.imposterCount = value as number;
    } else if (key === "language") {
      setLanguage(value as string);
      newSettings.language = value as string;
    } else if (key === "category") {
      setCategory(value as string);
      newSettings.category = value as string;
    }

    updateSettings(newSettings);
  };

  const handleStart = () => {
    if (!isHost || playerCount < 3) return;

    const lang = language.trim() || "tiếng Việt";
    const cat = category.trim() || "bất kỳ";

    const hasChanged =
      lang !== lastFetchedRef.current.lang ||
      cat !== lastFetchedRef.current.cat;

    if (hasChanged) {
      setWords([]);
      setUsedWords([]);
      setIsWaitingForApi(true);
      fetchWords(lang, cat, []);
    } else if (words.length > 0) {
      const [nextWord, ...remainingWords] = words;
      setWords(remainingWords);
      setUsedWords((prev) => [...prev, nextWord]);
      startGame(nextWord);
      setShowPlayerReveal(true);

      if (remainingWords.length < 5) {
        fetchWords(lang, cat, [...usedWords, nextWord, ...remainingWords]);
      }
    } else {
      setIsWaitingForApi(true);
      fetchWords(lang, cat, usedWords);
    }
  };

  const handleNewRound = () => {
    if (!isHost) return;

    const lang = language.trim() || "tiếng Việt";
    const cat = category.trim() || "bất kỳ";

    if (words.length > 0) {
      const [nextWord, ...remainingWords] = words;
      setWords(remainingWords);
      setUsedWords((prev) => [...prev, nextWord]);
      newRound(nextWord);

      if (remainingWords.length < 5) {
        fetchWords(lang, cat, [...usedWords, nextWord, ...remainingWords]);
      }
    } else {
      setIsWaitingForApi(true);
      fetchWords(lang, cat, usedWords);
    }
  };

  const handleLeave = () => {
    leave();
    router.push("/imposters");
  };

  if (!isConnected || !state) {
    return (
      <div className="w-full max-w-md p-5 text-center">
        <p>Đang kết nối...</p>
      </div>
    );
  }

  return (
    <>
      <PlayerRevealDialog
        open={showPlayerReveal}
        onOpenChange={setShowPlayerReveal}
        displayName={displayName}
        isImposter={myCard?.isImposter || false}
        word={myCard?.word || ""}
      />

      <div className="w-full max-w-md space-y-6 p-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleLeave}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-bold">Phòng {roomId}</h2>
            <p className="text-sm text-muted-foreground">
              {state.status === "waiting" ? "Đang chờ" : "Đang chơi"}
            </p>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted">
            <Users className="w-4 h-4" />
            <span className="font-semibold">{playerCount}</span>
          </div>
        </div>

        {/* Players List */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">
            Người chơi
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {state.players.map((player) => (
              <div
                key={player.playerId}
                className={`p-3 rounded-xl border ${
                  player.playerId === playerId
                    ? "border-primary bg-primary/10"
                    : "bg-card"
                }`}
              >
                <div className="flex items-center gap-2">
                  {player.isHost && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                  <span className="font-medium truncate">
                    {player.displayName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings (Host only) */}
        {isHost && state.status === "waiting" && (
          <div className="space-y-4 p-4 rounded-xl border bg-card">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <h3 className="font-semibold">Cài đặt</h3>
            </div>

            <div className="space-y-2">
              <Label>Số kẻ mạo danh</Label>
              <div className="flex items-center space-x-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    handleSettingsChange(
                      "imposterCount",
                      Math.max(1, parseInt(imposterCount) - 1)
                    )
                  }
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="text"
                  value={imposterCount}
                  onChange={(e) =>
                    handleSettingsChange("imposterCount", parseInt(e.target.value) || 1)
                  }
                  className="text-center w-16"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    handleSettingsChange(
                      "imposterCount",
                      parseInt(imposterCount) + 1
                    )
                  }
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ngôn ngữ</Label>
              <Input
                placeholder="Nhập ngôn ngữ..."
                value={language}
                onChange={(e) => handleSettingsChange("language", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Chủ đề</Label>
              <Input
                placeholder="Nhập chủ đề..."
                value={category}
                onChange={(e) => handleSettingsChange("category", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {isHost && state.status === "waiting" && (
            <Button
              onClick={handleStart}
              className="w-full h-12"
              disabled={playerCount < 3 || isLoadingWords || isWaitingForApi}
            >
              {isLoadingWords || isWaitingForApi
                ? "Đang chuẩn bị..."
                : playerCount < 3
                ? `Cần ít nhất 3 người (${playerCount}/3)`
                : "Bắt đầu"}
            </Button>
          )}

          {isHost && state.status === "playing" && (
            <Button
              onClick={handleNewRound}
              className="w-full h-12"
              disabled={isLoadingWords || isWaitingForApi}
            >
              {isLoadingWords || isWaitingForApi ? "Đang chuẩn bị..." : "Vòng mới"}
            </Button>
          )}

          {!isHost && state.status === "waiting" && (
            <div className="text-center py-4 text-muted-foreground">
              Đang chờ chủ phòng bắt đầu...
            </div>
          )}

          {!isHost && state.status === "playing" && (
            <Button
              onClick={() => setShowPlayerReveal(true)}
              variant="outline"
              className="w-full h-12"
            >
              Xem lại thẻ của tôi
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
