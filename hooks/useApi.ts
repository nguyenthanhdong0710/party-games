import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import type { GameType, IRoom } from "@/lib/models/Room";

// Types
interface AuthVerifyResponse {
  authenticated: boolean;
}

interface AuthLoginResponse {
  success: boolean;
  message?: string;
}

interface RoomsResponse {
  rooms: IRoom[];
}

interface RoomResponse {
  room: IRoom;
}

interface CreateRoomParams {
  gameType: GameType;
  hostId: string;
  hostName: string;
}

interface UpdateRoomParams {
  roomId: string;
  data: Partial<Pick<IRoom, "settings" | "status" | "currentWord" | "words" | "usedWords">>;
}

// Query Keys
export const queryKeys = {
  auth: ["auth"] as const,
  rooms: (gameType: GameType) => ["rooms", gameType] as const,
  room: (roomId: string) => ["room", roomId] as const,
};

// API functions
const api = {
  // Auth APIs
  checkAuth: (): Promise<AuthVerifyResponse> =>
    axios.get("/api/auth/verify").then((res) => res.data),

  login: (password: string): Promise<AuthLoginResponse> =>
    axios
      .post("/api/auth/verify", { password })
      .then((res) => res.data)
      .catch((err) => {
        if (err.response?.data) {
          return err.response.data;
        }
        throw err;
      }),

  // Gemini API
  geminiApi: (prompt: string): Promise<string> => {
    if (!prompt.trim()) {
      throw new Error("Prompt cannot be empty");
    }
    return axios.post("/api/gemini", { prompt }).then((res) => {
      if (!res.data.response) {
        throw new Error("No response from Gemini API");
      }
      return res.data.response;
    });
  },

  // Rooms API
  getRooms: (gameType: GameType): Promise<RoomsResponse> =>
    axios.get(`/api/rooms?gameType=${gameType}`).then((res) => res.data),

  getRoom: (roomId: string): Promise<RoomResponse> =>
    axios.get(`/api/rooms/${roomId}`).then((res) => res.data),

  createRoom: (params: CreateRoomParams): Promise<RoomResponse> =>
    axios.post("/api/rooms", params).then((res) => res.data),

  updateRoom: ({ roomId, data }: UpdateRoomParams): Promise<RoomResponse> =>
    axios.patch(`/api/rooms/${roomId}`, data).then((res) => res.data),

  deleteRoom: (roomId: string): Promise<{ success: boolean }> =>
    axios.delete(`/api/rooms/${roomId}`).then((res) => res.data),
};

// Auth Hooks
export const useCheckAuth = () => {
  return useQuery({
    queryKey: queryKeys.auth,
    queryFn: api.checkAuth,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: api.login,
  });
};

// Gemini Hook
export const useGeminiApi = () => {
  return useMutation({
    mutationFn: api.geminiApi,
  });
};

// Rooms Hooks
export const useRooms = (gameType: GameType) => {
  return useQuery({
    queryKey: queryKeys.rooms(gameType),
    queryFn: () => api.getRooms(gameType),
    refetchInterval: 5000, // Refresh every 5 seconds
  });
};

export const useRoom = (roomId: string) => {
  return useQuery({
    queryKey: queryKeys.room(roomId),
    queryFn: () => api.getRoom(roomId),
    enabled: !!roomId,
  });
};

export const useCreateRoom = () => {
  return useMutation({
    mutationFn: api.createRoom,
  });
};

export const useUpdateRoom = () => {
  return useMutation({
    mutationFn: api.updateRoom,
  });
};

export const useDeleteRoom = () => {
  return useMutation({
    mutationFn: api.deleteRoom,
  });
};
