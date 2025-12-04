"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRooms, useCreateRoom } from "@/hooks/useApi";
import PATH from "@/lib/router-path";
import HowToPlayDialog from "@/components/imposters/HowToPlayDialog";
import { usePlayer } from "@/providers/player-provider";

export default function ImpostersLobby() {
  const router = useRouter();
  const { playerId, displayName } = usePlayer();

  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const { data, isLoading, refetch } = useRooms("imposters");
  const createRoom = useCreateRoom();

  const handleCreateRoom = async () => {
    if (!playerId || !displayName) return;

    try {
      const result = await createRoom.mutateAsync({
        gameType: "imposters",
        hostId: playerId,
        hostName: displayName,
      });
      router.push(PATH.onlineImpostersRoom(result.room.roomId));
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  const handleJoinRoom = (roomId: string) => {
    router.push(PATH.onlineImpostersRoom(roomId));
  };

  const rooms = data?.rooms || [];

  return (
    <>
      <HowToPlayDialog open={showHowToPlay} onOpenChange={setShowHowToPlay} />

      <div className="w-full max-w-md space-y-6 p-5">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Truy tìm KMD</h2>
          <p className="text-muted-foreground text-sm">
            Chọn phòng để tham gia hoặc tạo phòng mới
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleCreateRoom}
            className="flex-1 h-12"
            disabled={createRoom.isPending}
          >
            <Plus className="w-5 h-5 mr-2" />
            {createRoom.isPending ? "Đang tạo..." : "Tạo phòng"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {/* Room List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">
            Phòng đang chờ ({rooms.filter((r) => r.status === "waiting").length}
            )
          </h3>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Đang tải...
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border rounded-xl">
              Chưa có phòng nào. Hãy tạo phòng mới!
            </div>
          ) : (
            <div className="space-y-2">
              {rooms.map((room) => (
                <button
                  key={room.roomId}
                  onClick={() => handleJoinRoom(room.roomId)}
                  disabled={room.status === "playing"}
                  className="w-full p-4 rounded-xl border bg-card hover:bg-accent transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">
                        Phòng của {room.hostName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Mã phòng: {room.roomId}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="w-4 h-4" />
                        {room.players?.length || 1}
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-xs ${
                          room.status === "waiting"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-yellow-500/20 text-yellow-500"
                        }`}
                      >
                        {room.status === "waiting" ? "Chờ" : "Đang chơi"}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* How to Play */}
        <Button
          onClick={() => setShowHowToPlay(true)}
          variant="outline"
          className="w-full h-10"
        >
          Cách chơi
        </Button>
      </div>
    </>
  );
}
