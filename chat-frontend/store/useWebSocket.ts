import { create } from "zustand";

interface WSMessage {
  type: string;
  payload?: any;
}

interface WSState {
  socket: WebSocket | null;
  lastEvent: WSMessage | null;
  chatMessages: { username: string; message: string }[];

  roomUsers: string[];

  connect: () => void;
  disconnect: () => void;

  joinRoom: (roomId: string, username: string) => void;
  sendMessage: (message: string) => void;
}

export const useWebSocket = create<WSState>((set, get) => ({
  socket: null,
  lastEvent: null,
  chatMessages: [],

  roomUsers: [],

  connect: () => {
    const existing = get().socket;
    if (existing && existing.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("WS connected");
    };

    ws.onclose = () => {
      console.log("WS closed");
      set({ socket: null });
    };

    ws.onerror = (err) => console.log("WS Error:", err);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      set({ lastEvent: data });

      if (data.type === "message") {
        set((state) => ({
          chatMessages: [
            ...state.chatMessages,
            {
              username: data.payload.username,
              message: data.payload.message
            }
          ]
        }));
      }

      if (data.type === "room_users") {
        set({ roomUsers: data.payload.users });
      }

      console.log("WS Message:", data);
    };

    set({ socket: ws });
  },

  disconnect: () => {
    const ws = get().socket;
    if (ws) ws.close();
    set({ socket: null });
  },

  joinRoom: (roomId, username) => {
    const ws = get().socket;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(
      JSON.stringify({
        type: "join",
        payload: { roomId, username }
      })
    );
  },

  sendMessage: (message) => {
    const ws = get().socket;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(
      JSON.stringify({
        type: "chat",
        payload: { message }
      })
    );
  }
}));
