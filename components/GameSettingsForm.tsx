"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GameSettingsFormProps {
  playerCount: string;
  setPlayerCount: (value: string) => void;
  imposterCount: string;
  setImposterCount: (value: string) => void;
  language: string;
  setLanguage: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  onStart: () => void;
  onHowToPlay: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export default function GameSettingsForm({
  playerCount,
  setPlayerCount,
  imposterCount,
  setImposterCount,
  language,
  setLanguage,
  category,
  setCategory,
  onStart,
  onHowToPlay,
  onRefresh,
  isRefreshing,
}: GameSettingsFormProps) {
  return (
    <div className="w-full max-w-sm space-y-8 p-5 rounded-xl border bg-card">
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Truy tìm KMD</h2>
        <p className="text-muted-foreground text-sm">
          Tìm ra kẻ mạo danh trong nhóm của bạn
        </p>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* Player Count & Imposter Count */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="playerCount">Số người chơi</Label>
            <div className="flex items-center space-x-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setPlayerCount(String(Math.max(3, Number(playerCount) - 1)))}
              >
                -
              </Button>
              <Input
                id="playerCount"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="4"
                value={playerCount}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (newValue === "" || /^[0-9]*$/.test(newValue)) {
                    setPlayerCount(newValue);
                  }
                }}
                className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setPlayerCount(String(Number(playerCount) + 1))}
              >
                +
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="imposterCount">Số kẻ mạo danh</Label>
            <div className="flex items-center space-x-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setImposterCount(String(Math.max(1, Number(imposterCount) - 1)))}
              >
                -
              </Button>
              <Input
                id="imposterCount"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="1"
                value={imposterCount}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (newValue === "" || /^[0-9]*$/.test(newValue)) {
                    setImposterCount(newValue);
                  }
                }}
                className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setImposterCount(String(Number(imposterCount) + 1))}
              >
                +
              </Button>
            </div>
          </div>
        </div>

        {/* Language Input */}
        <div className="space-y-2">
          <Label htmlFor="language">Ngôn ngữ</Label>
          <Input
            id="language"
            type="text"
            placeholder="Nhập ngôn ngữ..."
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          />
        </div>

        {/* Category Input */}
        <div className="space-y-2">
          <Label htmlFor="category">Chủ đề</Label>
          <Input
            id="category"
            type="text"
            placeholder="Nhập chủ đề..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-3 pt-2">
        <Button onClick={onStart} className="w-full h-10 text-base"     disabled={isRefreshing}
        >
          {isRefreshing ? "Đang làm mới..." : "Bắt đầu"}
        </Button>
        <Button
          onClick={onRefresh}
          variant="outline"
          className="w-full h-10 text-base"
          disabled={isRefreshing}
        >
          {isRefreshing ? "Đang làm mới..." : "Làm mới"}
        </Button>
        <Button
          onClick={onHowToPlay}
          variant="outline"
          className="w-full h-10 text-base"
        >
          Cách chơi
        </Button>
      </div>
    </div>
  );
}
