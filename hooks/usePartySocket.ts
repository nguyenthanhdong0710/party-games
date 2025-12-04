"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import PartySocket from "partysocket";
import type {
  RoomState,
  ClientMessage,
  ServerMessage,
  GameSettings,
} from "@/lib/types/party";

const PARTYKIT_HOST =
  process.env.NEXT_PUBLIC_PARTYKIT_HOST || "localhost:1999";

interface UsePartySocketOptions {
  roomId: string;
  playerId: string;
  displayName: string;
  onStateChange?: (state: RoomState) => void;
  onError?: (error: string) => void;
}

export function usePartySocket({
  roomId,
  playerId,
  displayName,
  onStateChange,
  onError,
}: UsePartySocketOptions) {
  const [state, setState] = useState<RoomState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<PartySocket | null>(null);
  const hasJoinedRef = useRef(false);
  
  // Store callbacks in refs to avoid re-creating socket on callback changes
  const onStateChangeRef = useRef(onStateChange);
  const onErrorRef = useRef(onError);
  
  useEffect(() => {
    onStateChangeRef.current = onStateChange;
    onErrorRef.current = onError;
  }, [onStateChange, onError]);

  useEffect(() => {
    if (!roomId || !playerId || !displayName) return;

    // Don't create new socket if one already exists for this room
    if (socketRef.current) {
      return;
    }

    const socket = new PartySocket({
      host: PARTYKIT_HOST,
      room: roomId,
      party: "imposters",
    });

    socketRef.current = socket;

    socket.addEventListener("open", () => {
      setIsConnected(true);
      if (!hasJoinedRef.current) {
        socket.send(
          JSON.stringify({
            type: "join",
            playerId,
            displayName,
          } as ClientMessage)
        );
        hasJoinedRef.current = true;
      }
    });

    socket.addEventListener("message", (event) => {
      try {
        const message: ServerMessage = JSON.parse(event.data);

        if (message.type === "sync") {
          setState(message.state);
          onStateChangeRef.current?.(message.state);
        } else if (message.type === "error") {
          onErrorRef.current?.(message.message);
        }
      } catch (e) {
        console.error("Failed to parse message:", e);
      }
    });

    socket.addEventListener("close", () => {
      setIsConnected(false);
      socketRef.current = null;
      hasJoinedRef.current = false;
    });

    socket.addEventListener("error", () => {
      onErrorRef.current?.("Connection error");
    });

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "leave",
            playerId,
          } as ClientMessage)
        );
      }
      socket.close();
      socketRef.current = null;
      hasJoinedRef.current = false;
    };
  }, [roomId, playerId, displayName]);

  const send = useCallback((message: ClientMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, []);

  const updateSettings = useCallback(
    (settings: Partial<GameSettings>) => {
      send({
        type: "settings-update",
        playerId,
        settings,
      });
    },
    [send, playerId]
  );

  const startGame = useCallback(
    (word: string) => {
      send({
        type: "start-game",
        playerId,
        word,
      });
    },
    [send, playerId]
  );

  const newRound = useCallback(
    (word: string) => {
      send({
        type: "new-round",
        playerId,
        word,
      });
    },
    [send, playerId]
  );

  const leave = useCallback(() => {
    send({
      type: "leave",
      playerId,
    });
  }, [send, playerId]);

  const resetGame = useCallback(() => {
    send({
      type: "reset-game",
      playerId,
    });
  }, [send, playerId]);

  return {
    state,
    isConnected,
    updateSettings,
    startGame,
    newRound,
    leave,
    resetGame,
  };
}
