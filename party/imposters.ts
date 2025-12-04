import type * as Party from "partykit/server";

// Types inline to avoid import issues with PartyKit bundler
interface PartyPlayer {
  playerId: string;
  displayName: string;
  isHost: boolean;
  isReady: boolean;
}

interface GameSettings {
  imposterCount: number;
  language: string;
  category: string;
}

interface PlayerCard {
  playerId: string;
  displayName: string;
  isImposter: boolean;
  word: string | null;
}

interface RoomState {
  roomId: string;
  hostId: string;
  players: PartyPlayer[];
  settings: GameSettings;
  status: "waiting" | "playing" | "finished";
  currentWord?: string;
  cards?: PlayerCard[];
  gameKey: number;
}

interface JoinMessage {
  type: "join";
  playerId: string;
  displayName: string;
}

interface LeaveMessage {
  type: "leave";
  playerId: string;
}

interface SettingsUpdateMessage {
  type: "settings-update";
  playerId: string;
  settings: Partial<GameSettings>;
}

interface StartGameMessage {
  type: "start-game";
  playerId: string;
  word: string;
}

interface NewRoundMessage {
  type: "new-round";
  playerId: string;
  word: string;
}

interface ResetGameMessage {
  type: "reset-game";
  playerId: string;
}

type ClientMessage =
  | JoinMessage
  | LeaveMessage
  | SettingsUpdateMessage
  | StartGameMessage
  | NewRoundMessage
  | ResetGameMessage;

import { shuffleArray } from "../lib/random";

// Generate cards for all players
function dealCards(
  players: PartyPlayer[],
  imposterCount: number,
  word: string
): PlayerCard[] {
  const playerIds = players.map((p) => p.playerId);
  const shuffledIds = shuffleArray(playerIds);
  const imposterIds = new Set(shuffledIds.slice(0, imposterCount));

  return players.map((player) => ({
    playerId: player.playerId,
    displayName: player.displayName,
    isImposter: imposterIds.has(player.playerId),
    word: imposterIds.has(player.playerId) ? null : word,
  }));
}

export default class ImpostersRoom implements Party.Server {
  state: RoomState;

  constructor(readonly room: Party.Room) {
    this.state = {
      roomId: room.id,
      hostId: "",
      players: [],
      settings: {
        imposterCount: 1,
        language: "",
        category: "",
      },
      status: "waiting",
      gameKey: 0,
    };
  }

  async onStart() {
    const stored = await this.room.storage.get<RoomState>("state");
    if (stored) {
      this.state = stored;
    }
  }

  async saveState() {
    await this.room.storage.put("state", this.state);
  }

  async syncToMongoDB() {
    const apiUrl =
      (this.room.env.NEXT_PUBLIC_APP_URL as string) || "http://localhost:3090";

    try {
      const players = this.state.players.map((p) => ({
        playerId: p.playerId,
        displayName: p.displayName,
        joinedAt: new Date(),
      }));

      const response = await fetch(`${apiUrl}/api/rooms/${this.state.roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: this.state.status,
          players,
        }),
      });

      if (!response.ok) {
        console.error("Sync failed:", response.status, await response.text());
      }
    } catch (error) {
      console.error("Sync error:", error);
    }
  }

  broadcast() {
    this.room.broadcast(
      JSON.stringify({
        type: "sync",
        state: this.state,
      })
    );
  }

  onConnect(conn: Party.Connection) {
    conn.send(
      JSON.stringify({
        type: "sync",
        state: this.state,
      })
    );
  }

  async onMessage(message: string, sender: Party.Connection) {
    try {
      const data: ClientMessage = JSON.parse(message);

      switch (data.type) {
        case "join":
          this.handleJoin(data.playerId, data.displayName);
          break;

        case "leave":
          this.handleLeave(data.playerId);
          break;

        case "settings-update":
          this.handleSettingsUpdate(data.playerId, data.settings);
          break;

        case "start-game":
          this.handleStartGame(data.playerId, data.word);
          break;

        case "new-round":
          this.handleNewRound(data.playerId, data.word);
          break;

        case "reset-game":
          this.handleResetGame(data.playerId);
          break;
      }

      await this.saveState();
      this.broadcast();

      // Sync to MongoDB for lobby display
      if (["join", "leave", "start-game", "reset-game"].includes(data.type)) {
        this.syncToMongoDB();
      }
    } catch {
      sender.send(
        JSON.stringify({
          type: "error",
          message: "Invalid message format",
        })
      );
    }
  }

  handleJoin(playerId: string, displayName: string) {
    const existingPlayer = this.state.players.find(
      (p) => p.playerId === playerId
    );
    if (existingPlayer) {
      existingPlayer.displayName = displayName;
      return;
    }

    const isHost = this.state.players.length === 0;
    if (isHost) {
      this.state.hostId = playerId;
    }

    this.state.players.push({
      playerId,
      displayName,
      isHost,
      isReady: false,
    });
  }

  handleLeave(playerId: string) {
    this.state.players = this.state.players.filter(
      (p) => p.playerId !== playerId
    );

    if (this.state.hostId === playerId && this.state.players.length > 0) {
      this.state.hostId = this.state.players[0].playerId;
      this.state.players[0].isHost = true;
    }

    if (this.state.cards) {
      this.state.cards = this.state.cards.filter(
        (c) => c.playerId !== playerId
      );
    }

    // Delete room from MongoDB if no players left
    if (this.state.players.length === 0) {
      this.deleteRoomFromMongoDB();
    }
  }

  async deleteRoomFromMongoDB() {
    const apiUrl =
      (this.room.env.NEXT_PUBLIC_APP_URL as string) || "http://localhost:3090";

    try {
      await fetch(`${apiUrl}/api/rooms/${this.state.roomId}`, {
        method: "DELETE",
      });
    } catch {
      // Silently fail
    }
  }

  handleSettingsUpdate(playerId: string, settings: Partial<GameSettings>) {
    if (playerId !== this.state.hostId) return;
    if (this.state.status !== "waiting") return;

    this.state.settings = {
      ...this.state.settings,
      ...settings,
    };
  }

  handleStartGame(playerId: string, word: string) {
    if (playerId !== this.state.hostId) return;
    if (this.state.players.length < 3) return;

    this.state.status = "playing";
    this.state.currentWord = word;
    this.state.gameKey += 1;
    this.state.cards = dealCards(
      this.state.players,
      this.state.settings.imposterCount,
      word
    );
  }

  handleNewRound(playerId: string, word: string) {
    if (playerId !== this.state.hostId) return;

    this.state.currentWord = word;
    this.state.gameKey += 1;
    this.state.cards = dealCards(
      this.state.players,
      this.state.settings.imposterCount,
      word
    );
  }

  handleResetGame(playerId: string) {
    if (playerId !== this.state.hostId) return;

    this.state.status = "waiting";
    this.state.currentWord = undefined;
    this.state.cards = undefined;
  }

  onClose(_conn: Party.Connection) {
    // Connection closed - player might reconnect
  }
}
