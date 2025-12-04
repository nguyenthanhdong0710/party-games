"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserSearch, ChevronRight } from "lucide-react";
import DisplayNameDialog from "@/components/DisplayNameDialog";
import { DISPLAY_NAME_KEY } from "@/lib/constants";
import PATH from "@/lib/router-path";

const games = [
  {
    label: "Truy tìm Imposter",
    description: "Tìm ra kẻ mạo danh trong nhóm của bạn",
    link: PATH.onlineImposters,
    icon: UserSearch,
    color: "from-blue-500 to-red-500",
    requiresDisplayName: true,
  },
  {
    label: "Truy tìm Imposter (Offline)",
    description: "Chơi offline trên cùng một thiết bị",
    link: PATH.offlineImposters,
    icon: UserSearch,
    color: "from-purple-500 to-pink-500",
    requiresDisplayName: false,
  },
];

export default function Home() {
  const router = useRouter();
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [pendingLink, setPendingLink] = useState<string | null>(null);

  const handleGameClick = (link: string, requiresDisplayName: boolean) => {
    if (!requiresDisplayName) {
      router.push(link);
      return;
    }

    const savedName = localStorage.getItem(DISPLAY_NAME_KEY);
    if (savedName) {
      router.push(link);
    } else {
      setPendingLink(link);
      setIsNameDialogOpen(true);
    }
  };

  const handleNameSaved = () => {
    if (pendingLink) {
      router.push(pendingLink);
      setPendingLink(null);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setPendingLink(null);
    }
    setIsNameDialogOpen(open);
  };

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      {/* Header */}
      <header className="h-12 flex items-center px-6 border-b">
        <h1 className="text-lg font-bold">Party Games</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-3 py-10">
        <div className="w-full max-w-md space-y-6">
          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Chọn trò chơi</h2>
            <p className="text-muted-foreground text-sm">
              Chọn một trò chơi để bắt đầu vui chơi cùng bạn bè
            </p>
          </div>

          {/* Games Grid */}
          <div className="grid gap-4">
            {games.map((game) => (
              <button
                key={game.link}
                onClick={() => handleGameClick(game.link, game.requiresDisplayName)}
                className="group relative overflow-hidden rounded-xl border bg-card px-3 py-2 transition-all hover:shadow-lg hover:scale-[1.02] text-left w-full"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-xl bg-linear-to-br ${game.color} flex items-center justify-center shrink-0`}
                  >
                    <game.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                      {game.label}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {game.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Display Name Dialog */}
      <DisplayNameDialog
        open={isNameDialogOpen}
        onOpenChange={handleDialogClose}
        onSave={handleNameSaved}
        allowClose={true}
      />
    </div>
  );
}
