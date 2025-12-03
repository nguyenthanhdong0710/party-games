"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useGemini from "@/hooks/useGemini";

export default function Home() {
  const [language, setLanguage] = useState("");
  const [category, setCategory] = useState("");

  const { executePrompt } = useGemini({
    onSuccess: (response) => {
      console.log("AI Response:", response);
    },
    onError: (error) => {
      console.error("AI Error:", error);
    },
  });

  const handleStart = () => {
    const lang = language.trim() || "tiếng Việt";
    const cat = category.trim() || "bất kỳ";

    const prompt = `Bạn là một trợ lý tạo từ vựng cho game Imposter (trò chơi tìm kẻ mạo danh đang nổi tiếng trên TikTok).

Yêu cầu:
- Ngôn ngữ: ${lang}
- Chủ đề/Category: ${cat}

Hãy đưa ra MỘT từ vựng ngẫu nhiên phù hợp với ngôn ngữ và chủ đề trên.

Quy tắc:
1. Từ phải phổ biến, dễ hiểu để người chơi có thể mô tả được
2. Từ không được quá đơn giản (như "cây", "nhà") hoặc quá khó
3. Từ phải cụ thể, rõ ràng (ví dụ: "xe đạp" thay vì "phương tiện")
4. Chỉ trả về DUY NHẤT từ vựng đó, không giải thích gì thêm
5. Không thêm dấu ngoặc kép, dấu chấm hay ký tự đặc biệt

Từ vựng:`;

    executePrompt(prompt);
  };

  const handleHowToPlay = () => {
    console.log("Hiển thị cách chơi");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-16 flex items-center px-6 border-b">
        <h1 className="text-xl font-bold">LOGO</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm space-y-8 p-5 rounded-xl border bg-card">
          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Imposter Game</h2>
            <p className="text-muted-foreground text-sm">
              Tìm ra kẻ mạo danh trong nhóm của bạn
            </p>
          </div>

          {/* Form */}
          <div className="space-y-5">
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
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                type="text"
                placeholder="Nhập category..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3 pt-2">
            <Button onClick={handleStart} className="w-full h-10 text-base">
              Bắt đầu
            </Button>
            <Button
              onClick={handleHowToPlay}
              variant="outline"
              className="w-full h-10 text-base"
            >
              Cách chơi
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
