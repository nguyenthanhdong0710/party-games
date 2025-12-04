import mongoose, { Schema, Document } from "mongoose";

export type GameType = "imposters";
export type RoomStatus = "waiting" | "playing" | "finished";

export interface IPlayer {
  playerId: string;
  displayName: string;
  joinedAt: Date;
}

export interface IRoomSettings {
  imposterCount: number;
  language: string;
  category: string;
}

export interface IRoom extends Document {
  roomId: string;
  gameType: GameType;
  hostId: string;
  hostName: string;
  players: IPlayer[];
  settings: IRoomSettings;
  status: RoomStatus;
  currentWord?: string;
  words: string[];
  usedWords: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PlayerSchema = new Schema({
  playerId: { type: String, required: true },
  displayName: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
});

const RoomSettingsSchema = new Schema({
  imposterCount: { type: Number, default: 1 },
  language: { type: String, default: "" },
  category: { type: String, default: "" },
});

const RoomSchema = new Schema<IRoom>(
  {
    roomId: { type: String, required: true, unique: true, index: true },
    gameType: { type: String, required: true, enum: ["imposters"] },
    hostId: { type: String, required: true },
    hostName: { type: String, required: true },
    players: { type: [PlayerSchema], default: [] },
    settings: { type: RoomSettingsSchema, default: {} },
    status: {
      type: String,
      enum: ["waiting", "playing", "finished"],
      default: "waiting",
    },
    currentWord: { type: String },
    words: { type: [String], default: [] },
    usedWords: { type: [String], default: [] },
  },
  { timestamps: true }
);

RoomSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export const Room =
  mongoose.models.Room || mongoose.model<IRoom>("Room", RoomSchema);
