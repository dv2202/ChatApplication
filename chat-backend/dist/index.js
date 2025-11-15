import { WebSocketServer, WebSocket } from "ws";
const wss = new WebSocketServer({ port: 8080 });
let allSockets = [];
function getActiveUsers(roomId) {
    return allSockets
        .filter((u) => u.room === roomId)
        .map((u) => u.username);
}
function broadcastRoomUsers(roomId) {
    const users = getActiveUsers(roomId);
    console.log(`Broadcasting users for room ${roomId}:`, users);
    allSockets.forEach((u) => {
        if (u.room === roomId) {
            u.socket.send(JSON.stringify({
                type: "room_users",
                payload: {
                    roomId,
                    users
                }
            }));
        }
    });
}
wss.on("connection", (socket) => {
    socket.on("message", (message) => {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === "join") {
            const { roomId, username } = parsedMessage.payload;
            const exists = allSockets.some((u) => u.room === roomId && u.username === username);
            if (exists) {
                socket.send(JSON.stringify({
                    type: "join_error",
                    payload: { message: "Username already taken in this room." }
                }));
                return;
            }
            allSockets.push({ socket, room: roomId, username });
            broadcastRoomUsers(roomId);
            socket.send(JSON.stringify({
                type: "join_success",
                payload: { roomId, username }
            }));
            console.log("all sockets:", allSockets);
        }
        if (parsedMessage.type === "chat") {
            const sender = allSockets.find((s) => s.socket === socket);
            if (sender) {
                const { room, username } = sender;
                allSockets.forEach((s) => {
                    if (s.room === room) {
                        s.socket.send(JSON.stringify({
                            type: "message",
                            payload: {
                                username,
                                message: parsedMessage.payload.message
                            }
                        }));
                    }
                });
            }
        }
    });
    socket.on("close", () => {
        console.log("User disconnected 🚪");
        const user = allSockets.find((u) => u.socket === socket);
        if (!user)
            return;
        const { room } = user;
        allSockets = allSockets.filter((u) => u.socket !== socket);
        const isRoomEmpty = !allSockets.some((u) => u.room === room);
        if (isRoomEmpty) {
            console.log(`🗑️ Room "${room}" is now empty. Deleting room.`);
        }
        broadcastRoomUsers(room);
    });
});
//# sourceMappingURL=index.js.map