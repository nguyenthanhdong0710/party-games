"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContentFullscreen,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface PlayerRevealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  displayName: string;
  isImposter: boolean;
  word: string;
}

export default function PlayerRevealDialog({
  open,
  onOpenChange,
  displayName,
  isImposter,
  word,
}: PlayerRevealDialogProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleCardTap = () => {
    if (!isRevealed) {
      setIsRevealed(true);
    }
  };

  const handleGotIt = () => {
    // Flip back to "tap to reveal" state instead of closing
    setIsRevealed(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setIsRevealed(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContentFullscreen
        className="text-white"
        showCloseButton
        aria-describedby={undefined}
        onClick={!isRevealed ? handleCardTap : handleGotIt}
      >
        <div className="sr-only">
          <DialogTitle>{displayName}</DialogTitle>
          <DialogDescription>Xem vai trò của bạn</DialogDescription>
        </div>

        <div className="flex flex-col items-center justify-center w-full h-full p-8">
          {/* Card container */}
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
                  <h2 className="text-3xl font-bold mb-8 text-center px-4">
                    {displayName}
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
                  background: isImposter
                    ? "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)"
                    : "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
                }}
              >
                {isImposter ? (
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

          {/* Bottom section */}
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
                  Chạm để ẩn thẻ • Ấn X để đóng
                </p>
              </>
            )}
          </div>
        </div>
      </DialogContentFullscreen>
    </Dialog>
  );
}
