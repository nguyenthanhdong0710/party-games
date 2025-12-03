import Link from "next/link";
import { UserSearch, ChevronRight } from "lucide-react";

const games = [
  {
    label: "Truy tìm KMD",
    description: "Tìm ra kẻ mạo danh trong nhóm của bạn",
    link: "/imposters",
    icon: UserSearch,
    color: "from-blue-500 to-red-500",
  },
];

export default function Home() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
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
              <Link
                key={game.link}
                href={game.link}
                className="group relative overflow-hidden rounded-xl border bg-card px-3 py-2 transition-all hover:shadow-lg hover:scale-[1.02]"
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
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
