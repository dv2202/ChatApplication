import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  socket: WebSocket;
  room: string;
  username: string;
}

let allSockets: User[] = [];

/* --------------------- Helpers --------------------- */

function getUsersInRoom(roomId: string) {
  return allSockets
    .filter((u) => u.room === roomId)
    .map((u) => u.username);
}

function broadcastRoomUsers(roomId: string) {
  const users = getUsersInRoom(roomId);

  allSockets.forEach((u) => {
    if (u.room === roomId) {
      u.socket.send(
        JSON.stringify({
          type: "room_users",
          payload: { roomId, users }
        })
      );
    }
  });
}

/* --------------------- WebSocket Logic --------------------- */

wss.on("connection", (socket) => {
  console.log("New connection");

  socket.on("message", (raw) => {
    let data;

    try {
      data = JSON.parse(raw.toString());
    } catch (e) {
      socket.send(JSON.stringify({ type: "error", payload: { message: "Invalid JSON" } }));
      return;
    }

    /* --------------------- JOIN ROOM --------------------- */

    if (data.type === "join") {
      const { roomId, username } = data.payload;

      if (!roomId || !username) {
        socket.send(
          JSON.stringify({
            type: "join_error",
            payload: { message: "roomId & username required" }
          })
        );
        return;
      }

      // Remove old duplicate socket entries
      allSockets = allSockets.filter((u) => u.socket !== socket);

      // Prevent username conflict
      const exists = allSockets.some(
        (u) => u.room === roomId && u.username === username
      );

      if (exists) {
        socket.send(
          JSON.stringify({
            type: "join_error",
            payload: { message: "Username already taken in this room." }
          })
        );
        return;
      }

      allSockets.push({ socket, room: roomId, username });

      socket.send(
        JSON.stringify({
          type: "join_success",
          payload: { roomId, username }
        })
      );

      broadcastRoomUsers(roomId);
      return;
    }

    /* --------------------- CHAT MESSAGE --------------------- */

    if (data.type === "chat") {
      const sender = allSockets.find((u) => u.socket === socket);

      // Not joined → reject
      if (!sender) {
        socket.send(
          JSON.stringify({
            type: "chat_error",
            payload: { message: "You must join a room before sending messages." }
          })
        );
        return;
      }

      const { room, username } = sender;

      // Validate payload
      if (!data.payload?.message) {
        socket.send(
          JSON.stringify({
            type: "chat_error",
            payload: { message: "Message cannot be empty." }
          })
        );
        return;
      }

      // Prevent room spoofing (payload roomId ignored)
      // Prevent username spoofing (payload username ignored)

      // Broadcast chat message
      allSockets.forEach((u) => {
        if (u.room === room) {
          u.socket.send(
            JSON.stringify({
              type: "message",
              payload: {
                username,
                message: data.payload.message
              }
            })
          );
        }
      });
      return;
    }
  });

  /* --------------------- DISCONNECT --------------------- */

  socket.on("close", () => {
    const user = allSockets.find((u) => u.socket === socket);

    if (!user) return;

    const { room } = user;

    allSockets = allSockets.filter((u) => u.socket !== socket);

    broadcastRoomUsers(room);
  });
});
