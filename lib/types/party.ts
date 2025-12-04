// PartyKit Message Types
export type PartyMessageType =
  | "join"
  | "leave"
  | "sync"
  | "settings-update"
  | "start-game"
  | "deal-cards"
  | "new-round"
  | "end-game"
  | "error";

export interface PartyPlayer {
  playerId: string;
  displayName: string;
  isHost: boolean;
  isReady: boolean;
}

export interface GameSettings {
  imposterCount: number;
  language: string;
  category: string;
}

export interface PlayerCard {
  playerId: string;
  displayName: string;
  isImposter: boolean;
  word: string | null;
}

export interface RoomState {
  roomId: string;
  hostId: string;
  players: PartyPlayer[];
  settings: GameSettings;
  status: "waiting" | "playing" | "finished";
  currentWord?: string;
  cards?: PlayerCard[];
  gameKey: number;
}

// Messages from client to server
export interface JoinMessage {
  type: "join";
  playerId: string;
  displayName: string;
}

export interface LeaveMessage {
  type: "leave";
  playerId: string;
}

export interface SettingsUpdateMessage {
  type: "settings-update";
  playerId: string;
  settings: Partial<GameSettings>;
}

export interface StartGameMessage {
  type: "start-game";
  playerId: string;
  word: string;
}

export interface NewRoundMessage {
  type: "new-round";
  playerId: string;
  word: string;
}

export type ClientMessage =
  | JoinMessage
  | LeaveMessage
  | SettingsUpdateMessage
  | StartGameMessage
  | NewRoundMessage;

// Messages from server to client
export interface SyncMessage {
  type: "sync";
  state: RoomState;
}

export interface ErrorMessage {
  type: "error";
  message: string;
}

export type ServerMessage = SyncMessage | ErrorMessage;
