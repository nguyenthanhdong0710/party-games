"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  DISPLAY_NAME_KEY,
  DEFAULT_DISPLAY_NAME,
  PLAYER_ID_KEY,
} from "@/lib/constants";
import { nanoid } from "nanoid";

function getOrCreatePlayerId(): string {
  if (typeof window === "undefined") return "";
  let playerId = localStorage.getItem(PLAYER_ID_KEY);
  if (!playerId) {
    playerId = nanoid();
    localStorage.setItem(PLAYER_ID_KEY, playerId);
  }
  return playerId;
}

interface PlayerContextType {
  playerId: string;
  displayName: string;
  setDisplayName: (name: string) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [playerId, setPlayerId] = useState("");
  const [displayName, setDisplayNameState] = useState(DEFAULT_DISPLAY_NAME);

  useEffect(() => {
    setPlayerId(getOrCreatePlayerId());
    const savedName = localStorage.getItem(DISPLAY_NAME_KEY);
    if (savedName) {
      setDisplayNameState(savedName);
    }
  }, []);

  const setDisplayName = useCallback((name: string) => {
    setDisplayNameState(name);
    localStorage.setItem(DISPLAY_NAME_KEY, name);
  }, []);

  return (
    <PlayerContext.Provider value={{ playerId, displayName, setDisplayName }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within PlayerProvider");
  }
  return context;
}
