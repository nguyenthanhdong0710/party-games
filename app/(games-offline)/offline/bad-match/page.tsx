"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, RotateCcw, X } from "lucide-react";
import { shuffleArray } from "@/lib/random";

type MatchState = "normal" | "pulling" | "pulled" | "burned";

interface Match {
  id: number;
  state: MatchState;
  isBurned: boolean;
}

export default function BadMatchPage() {
  const [matchCount, setMatchCount] = useState(6);
  const [gameState, setGameState] = useState<"setup" | "playing" | "ended">(
    "setup"
  );
  const [matches, setMatches] = useState<Match[]>([]);

  const startGame = () => {
    const count = Math.max(2, Math.min(20, matchCount));
    const indices = Array.from({ length: count }, (_, i) => i);
    const shuffled = shuffleArray(indices);
    const burnedIdx = shuffled[0];

    setMatches(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        state: "normal" as MatchState,
        isBurned: i === burnedIdx,
      }))
    );
    setGameState("playing");
  };

  const pullMatch = useCallback(
    (index: number) => {
      if (gameState !== "playing") return;
      const match = matches[index];
      if (!match || match.state !== "normal") return;

      // Start pulling animation
      setMatches((prev) =>
        prev.map((m, i) => (i === index ? { ...m, state: "pulling" } : m))
      );

      // After pull animation, reveal result
      setTimeout(() => {
        const isBurned = match.isBurned;
        setMatches((prev) =>
          prev.map((m, i) =>
            i === index ? { ...m, state: isBurned ? "burned" : "pulled" } : m
          )
        );
        if (isBurned) {
          setGameState("ended");
        }
      }, 500);
    },
    [matches, gameState]
  );

  const replay = () => startGame();
  const leave = () => {
    setGameState("setup");
    setMatches([]);
  };

  if (gameState === "setup") {
    return (
      <div className="w-full max-w-md space-y-8 p-5">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Rút Diêm</h2>
          <p className="text-muted-foreground text-sm">
            Chọn số que diêm và bắt đầu
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMatchCount((c) => Math.max(2, c - 1))}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Input
              type="number"
              value={matchCount}
              onChange={(e) =>
                setMatchCount(Math.max(2, parseInt(e.target.value) || 2))
              }
              className="w-20 text-center text-xl font-bold"
              min={2}
              max={20}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMatchCount((c) => Math.min(20, c + 1))}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <Button onClick={startGame} className="w-full h-14 text-lg">
            BẮT ĐẦU
          </Button>
        </div>
      </div>
    );
  }

  // Calculate gap based on match count to spread across screen
  const gapClass =
    matches.length <= 4
      ? "gap-8"
      : matches.length <= 8
      ? "gap-4"
      : matches.length <= 12
      ? "gap-2"
      : "gap-1";

  return (
    <div className="w-full max-w-md flex-1 flex flex-col">
      {/* Match area - horizontal layout, matches hidden on right */}
      <div
        className={`flex-1 flex flex-col justify-evenly py-4 overflow-hidden ${gapClass}`}
      >
        {matches.map((match, index) => {
          const isPulled =
            match.state === "pulling" ||
            match.state === "pulled" ||
            match.state === "burned";

          return (
            <div
              key={match.id}
              role="button"
              tabIndex={0}
              onPointerDown={(e) => {
                e.preventDefault();
                if (gameState === "playing" && match.state === "normal") {
                  pullMatch(index);
                }
              }}
              className={`
                relative flex items-center select-none touch-none
                transition-transform duration-500 ease-out
                ${
                  gameState === "playing" && match.state === "normal"
                    ? "cursor-pointer active:translate-x-2"
                    : "cursor-default"
                }
              `}
              style={{
                // Start with head hidden off-screen right, pull to reveal
                transform: isPulled
                  ? "translateX(0)"
                  : "translateX(calc(100% - 120px))",
              }}
            >
              {/* Match stick (horizontal) */}
              <div
                className={`
                  h-3 w-32 rounded-l-sm transition-colors duration-300
                  ${
                    match.state === "burned"
                      ? "bg-gradient-to-r from-amber-200 via-amber-800 to-stone-900"
                      : match.state === "pulled"
                      ? "bg-gradient-to-r from-gray-300 to-gray-500"
                      : "bg-gradient-to-r from-amber-100 to-amber-200"
                  }
                `}
              />

              {/* Match head container - keeps flame in place */}
              <div className="relative flex items-center">
                {/* Match head */}
                <div
                  className={`
                    w-5 h-5 rounded-full -ml-1 z-10 transition-all duration-300
                    ${
                      match.state === "burned"
                        ? "bg-gradient-to-r from-stone-800 to-stone-600"
                        : match.state === "pulled"
                        ? "bg-gradient-to-r from-gray-600 to-gray-400"
                        : "bg-gradient-to-r from-red-700 to-red-500"
                    }
                  `}
                />

                {/* Flame effect - positioned relative to head */}
                {match.state === "burned" && (
                  <div className="absolute left-0 -top-6 w-6 h-8 animate-pulse pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-500 via-yellow-400 to-transparent rounded-full blur-sm" />
                    <div className="absolute inset-1 bg-gradient-to-t from-red-500 via-orange-400 to-yellow-300 rounded-full" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center py-4">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={leave}
        >
          <X className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={replay}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
