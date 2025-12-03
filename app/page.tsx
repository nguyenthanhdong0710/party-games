"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useGemini from "@/hooks/useGemini";

export default function Home() {
  const [playerCount, setPlayerCount] = useState("4");
  const [imposterCount, setImposterCount] = useState("1");
  const [language, setLanguage] = useState("");
  const [category, setCategory] = useState("");
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  
  // Lưu trữ các từ đã fetch
  const [words, setWords] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState<string | null>(null);
  
  // Lưu trữ lang/cat đã dùng để fetch
  const lastFetchedRef = useRef<{ lang: string; cat: string }>({ lang: "", cat: "" });
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
      }
    },
    onError: (error) => {
      console.error("AI Error:", error);
    },
  });

  const fetchWords = useCallback((lang: string, cat: string) => {
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
  }, [executePrompt]);

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
      fetchWords(lang, cat);
    } else if (words.length > 0) {
      // Không thay đổi và có từ sẵn -> dùng từ đầu tiên
      const [nextWord, ...remainingWords] = words;
      setCurrentWord(nextWord);
      setWords(remainingWords);
      
      // Nếu còn ít từ thì fetch thêm
      if (remainingWords.length < 2) {
        fetchWords(lang, cat);
      }
    }
    
    console.log("Bắt đầu game với từ:", currentWord || words[0]);
  };

  const handleHowToPlay = () => {
    setShowHowToPlay(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* How to Play Dialog */}
      <Dialog open={showHowToPlay} onOpenChange={setShowHowToPlay}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              Cách chơi
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Section 1: Role Distribution */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-500 rounded shrink-0" />
                <div>
                  <h3 className="font-bold text-base">Phân chia vai trò</h3>
                  <p className="text-sm text-muted-foreground">
                    Mỗi người chơi nhận một vai trò bí mật:
                  </p>
                </div>
              </div>
              <ul className="space-y-1 text-sm ml-2">
                <li>
                  <span className="text-blue-500 font-semibold">• Người chơi:</span>{" "}
                  Biết từ khóa bí mật.
                </li>
                <li>
                  <span className="text-red-500 font-semibold">• Kẻ mạo danh:</span>{" "}
                  Không biết từ khóa - phải giả vờ như biết.
                </li>
              </ul>
            </div>

            {/* Section 2: Questions & Answers */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-500 rounded shrink-0" />
                <div>
                  <h3 className="font-bold text-base">Hỏi & Đáp</h3>
                  <p className="text-sm text-muted-foreground">
                    Lần lượt đặt câu hỏi tinh tế về từ khóa.
                  </p>
                </div>
              </div>
              <ul className="space-y-1 text-sm ml-2">
                <li>• Giữ câu hỏi mơ hồ, không quá rõ ràng.</li>
                <li>• Ví dụ:</li>
                <ul className="ml-4 space-y-1">
                  <li>• &quot;Nóng hay lạnh?&quot;</li>
                  <li>• &quot;Đông đúc hay yên tĩnh?&quot;</li>
                  <li>• &quot;Dùng ở nhà hay ngoài trời?&quot;</li>
                </ul>
              </ul>
            </div>

            {/* Section 3: Final Move */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-500 rounded shrink-0" />
                <div>
                  <h3 className="font-bold text-base">Kết thúc</h3>
                  <p className="text-sm text-muted-foreground">
                    Bất cứ lúc nào, người chơi có thể tố cáo ai đó là{" "}
                    <span className="text-red-500 font-semibold">Kẻ mạo danh</span>.
                  </p>
                </div>
              </div>
              <ul className="space-y-1 text-sm ml-2">
                <li>
                  • Nếu tìm đúng Kẻ mạo danh,{" "}
                  <span className="text-blue-500 font-semibold">Người chơi thắng</span>.
                </li>
                <li>
                  • Nếu Kẻ mạo danh đoán đúng từ khóa,{" "}
                  <span className="text-red-500 font-semibold">Kẻ mạo danh thắng!</span>
                </li>
                <li>
                  • Nếu hết thời gian,{" "}
                  <span className="text-red-500 font-semibold">Kẻ mạo danh</span> phải
                  đoán từ khóa để thắng.
                </li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="h-16 flex items-center px-6 border-b">
        <h1 className="text-xl font-bold">LOGO</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
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
                <Input
                  id="playerCount"
                  type="number"
                  min="3"
                  placeholder="VD: 4"
                  value={playerCount}
                  onChange={(e) => setPlayerCount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imposterCount">Số kẻ mạo danh</Label>
                <Input
                  id="imposterCount"
                  type="number"
                  min="1"
                  placeholder="VD: 1"
                  value={imposterCount}
                  onChange={(e) => setImposterCount(e.target.value)}
                />
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
