"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContentFullscreen,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface PlayerRevealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerCount: number;
  imposterCount: number;
  word: string;
  gameKey?: number; // Dùng để reset game state
}

// Hàm tạo số ngẫu nhiên sử dụng Crypto API (ngẫu nhiên hơn Math.random)
function getSecureRandomNumber(max: number): number {
  if (typeof window !== "undefined" && window.crypto) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
  }
  // Fallback cho SSR hoặc môi trường không hỗ trợ
  return Math.floor(Math.random() * max);
}

// Fisher-Yates Shuffle với Crypto API - thuật toán shuffle chuẩn nhất
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = getSecureRandomNumber(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Hàm tạo vị trí imposter ngẫu nhiên sử dụng Fisher-Yates Shuffle
function generateImposterIndices(
  playerCount: number,
  imposterCount: number
): number[] {
  // Tạo mảng các vị trí từ 1 đến playerCount
  const allPositions = Array.from({ length: playerCount }, (_, i) => i + 1);

  // Shuffle mảng và lấy imposterCount phần tử đầu tiên
  const shuffled = shuffleArray(allPositions);
  return shuffled.slice(0, imposterCount);
}

export default function PlayerRevealDialog({
  open,
  onOpenChange,
  playerCount,
  imposterCount,
  word,
  gameKey = 0,
}: PlayerRevealDialogProps) {
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [isRevealed, setIsRevealed] = useState(false);

  // Tạo imposter indices khi gameKey thay đổi (mỗi lần bắt đầu game mới)
  const imposterIndices = useMemo(
    () => generateImposterIndices(playerCount, imposterCount),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gameKey, playerCount, imposterCount]
  );

  const isCurrentPlayerImposter = imposterIndices.includes(currentPlayer);

  const handleCardTap = () => {
    setIsRevealed(true);
  };

  const handleGotIt = () => {
    if (currentPlayer < playerCount) {
      setCurrentPlayer(currentPlayer + 1);
      setIsRevealed(false);
    } else {
      // Kết thúc game
      onOpenChange(false);
      setCurrentPlayer(1);
      setIsRevealed(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setCurrentPlayer(1);
    setIsRevealed(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContentFullscreen
        className="text-white"
        showCloseButton={true}
        aria-describedby={undefined}
        onClick={!isRevealed ? handleCardTap : handleGotIt}
      >
        <div className="sr-only">
          <DialogTitle>Người chơi {currentPlayer}</DialogTitle>
          <DialogDescription>Xem vai trò của bạn</DialogDescription>
        </div>

        <div className="flex flex-col items-center justify-center w-full h-full p-8">
          {/* Card container - fixed height để tránh xô lệch */}
          <div className="h-96 flex items-center justify-center">
            {!isRevealed ? (
              <div
                className="relative w-80 h-96 rounded-3xl overflow-hidden cursor-pointer transform transition-transform hover:scale-105 shadow-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #ef4444 100%)",
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <h2 className="text-4xl font-bold mb-8">
                    Người chơi {currentPlayer}
                  </h2>

                  <div className="w-48 h-48 mb-8 flex items-center justify-center">
                    <div className="text-8xl">🕵️</div>
                  </div>

                  <p className="text-xl font-semibold">Chạm để xem</p>
                </div>
              </div>
            ) : (
              <div
                className="w-80 h-96 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center"
                style={{
                  background: isCurrentPlayerImposter
                    ? "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)"
                    : "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
                }}
              >
                {isCurrentPlayerImposter ? (
                  <>
                    <h2 className="text-5xl font-bold mb-8 text-red-400">
                      Kẻ mạo danh
                    </h2>
                    <div className="text-8xl mb-8">🕵️‍♂️</div>
                  </>
                ) : (
                  <>
                    <p className="text-lg mb-4 opacity-90">
                      Tìm ra kẻ mạo danh
                    </p>
                    <p className="text-lg mb-8 opacity-90">
                      trước khi hết giờ!
                    </p>
                    <h2 className="text-5xl font-bold px-8 text-center">
                      {word}
                    </h2>
                    <div className="text-6xl mt-8">👥</div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Bottom section - fixed height để tránh xô lệch */}
          <div className="h-40 flex flex-col items-center justify-center mt-8">
            {!isRevealed ? (
              <>
                <div className="text-6xl mb-4">👆</div>
                <p className="text-lg text-center">
                  Chạm vào màn hình để xem từ khóa.
                  <br />
                  Đừng để người khác nhìn thấy.
                </p>
              </>
            ) : (
              <>
                <div className="w-80 h-14 flex items-center justify-center text-lg font-semibold bg-blue-600 rounded-2xl">
                  Đã hiểu!
                </div>
                <p className="mt-4 text-sm opacity-75">
                  Chạm vào màn hình để tiếp tục
                </p>
              </>
            )}
          </div>
        </div>
      </DialogContentFullscreen>
    </Dialog>
  );
}
