"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users, Crown, Settings, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePartySocket } from "@/hooks/usePartySocket";
import { useWordGenerator } from "@/hooks/useWordGenerator";
import PlayerRevealDialog from "@/components/imposters/PlayerRevealDialog";
import PATH from "@/lib/router-path";
import { usePlayer } from "@/providers/player-provider";

export default function ImpostersRoom() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const { playerId, displayName } = usePlayer();
  const [showPlayerReveal, setShowPlayerReveal] = useState(false);

  // Local settings state (for host)
  const [imposterCount, setImposterCount] = useState("1");
  const [language, setLanguage] = useState("");
  const [category, setCategory] = useState("");

  const isInitialFetchDone = useRef(false);

  // PartyKit connection
  const {
    state,
    isConnected,
    updateSettings,
    startGame,
    newRound,
    leave,
    resetGame,
    updateDisplayName,
  } = usePartySocket({
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

  // Update PartyKit when displayName changes
  useEffect(() => {
    if (isConnected && displayName) {
      updateDisplayName(displayName);
    }
  }, [displayName, isConnected, updateDisplayName]);

  // Word generator
  const {
    isLoading: isLoadingWords,
    isWaitingForApi,
    getNextWord,
    prefetch,
  } = useWordGenerator({
    onWordReady: (word) => {
      startGame(word);
      setShowPlayerReveal(true);
    },
  });

  // Initial fetch for host
  useEffect(() => {
    if (isHost && !isInitialFetchDone.current) {
      isInitialFetchDone.current = true;
      prefetch("tiếng Việt", "bất kỳ");
    }
  }, [isHost, prefetch]);

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
      [key]: value,
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

    const word = getNextWord(lang, cat);
    if (word) {
      startGame(word);
      setShowPlayerReveal(true);
    }
  };

  const handleNewRound = () => {
    if (!isHost) return;

    const lang = language.trim() || "tiếng Việt";
    const cat = category.trim() || "bất kỳ";

    const word = getNextWord(lang, cat);
    if (word) {
      newRound(word);
    }
  };

  const handleLeave = () => {
    leave();
    router.push(PATH.onlineImposters);
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

      <div className="w-full max-w-md space-y-6 px-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3">
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
        <div
          className={
            isHost && state.status === "waiting"
              ? "space-y-2"
              : "space-y-2 flex-1"
          }
        >
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

        {/* Players waiting */}
        {!isHost && state.status === "waiting" && (
          <div className="text-center py-4 text-muted-foreground flex-1">
            Đang chờ chủ phòng bắt đầu...
          </div>
        )}

        {/* Settings (Host only) */}
        {isHost && state.status === "waiting" && (
          <div className="space-y-4 p-4 rounded-xl border bg-card flex-1">
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
                    handleSettingsChange(
                      "imposterCount",
                      parseInt(e.target.value) || 1
                    )
                  }
                  className="text-center w-full"
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
                onChange={(e) =>
                  handleSettingsChange("language", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Chủ đề</Label>
              <Input
                placeholder="Nhập chủ đề..."
                value={category}
                onChange={(e) =>
                  handleSettingsChange("category", e.target.value)
                }
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 mb-10">
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
              {isLoadingWords || isWaitingForApi
                ? "Đang chuẩn bị..."
                : "Vòng mới"}
            </Button>
          )}

          {state.status === "playing" && (
            <Button
              onClick={() => setShowPlayerReveal(true)}
              variant="outline"
              className="w-full h-12"
            >
              Xem lại thẻ của tôi
            </Button>
          )}
          {isHost && state.status === "playing" && (
            <Button onClick={resetGame} variant="ghost" className="w-full h-12">
              Bắt đầu lại
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
