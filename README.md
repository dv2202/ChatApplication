# Chat Application

A real-time, room-based chat app with no accounts or sign-up. Pick a room ID and a username, join instantly, and chat with everyone in that room over WebSockets.

## Features

- **Room-based chat** — create or join any room by ID (e.g. `team-chat`, `study-group`)
- **No accounts** — choose a display name each time you join
- **Real-time messaging** — messages broadcast instantly over WebSockets
- **Live presence** — every client sees the up-to-date list of users in the room
- **Username conflict prevention** — the server rejects duplicate usernames in the same room
- **Identity spoofing protection** — the server uses the joined `username`/`room` for outbound messages; the client's payload identity is ignored

## Tech stack

| Layer    | Technologies                                                            |
| -------- | ----------------------------------------------------------------------- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS, Zustand, Radix UI       |
| Backend  | Node.js, TypeScript, [`ws`](https://github.com/websockets/ws)            |

## Project structure

```
ChatApplication/
├── chat-frontend/         # Next.js web app (default: http://localhost:3000)
│   ├── app/               # Pages and layout
│   ├── components/        # UI and chat components
│   └── store/             # WebSocket state (Zustand)
└── chat-backend/          # WebSocket server (ws://localhost:8080)
    └── src/index.ts       # Server logic
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- npm (included with Node.js)

## Getting started

Run the backend and frontend in **two separate terminals**.

### 1. Start the WebSocket server

```bash
cd chat-backend
npm install
npm run dev
```

The server listens on **port 8080**. You should see `New connection` in the console when clients connect.

### 2. Start the frontend

```bash
cd chat-frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Use the app

1. Enter a **room ID** on the landing page.
2. Enter a **username**.
3. Click **Join Room** and start chatting.
4. Open another browser tab or window with the same room ID to test multi-user chat.

## WebSocket protocol

Clients connect to `ws://localhost:8080` and exchange JSON messages of the shape:

```json
{ "type": "<event>", "payload": { ... } }
```

### Client → server

| `type` | `payload`                         | Description                                                                              |
| ------ | --------------------------------- | ---------------------------------------------------------------------------------------- |
| `join` | `{ roomId, username }`            | Join a room                                                                              |
| `chat` | `{ message }`                     | Send a message to your joined room (server uses your joined `username`/`roomId`)         |

### Server → client

| `type`          | `payload`                  | Description                                              |
| --------------- | -------------------------- | -------------------------------------------------------- |
| `join_success`  | `{ roomId, username }`     | Join accepted                                            |
| `join_error`    | `{ message }`              | Join failed (e.g. username already taken)                |
| `room_users`    | `{ roomId, users }`        | Updated list of usernames in the room                    |
| `message`       | `{ username, message }`    | Chat message from a user in the room                     |
| `chat_error`    | `{ message }`              | Send failed (e.g. not in a room, empty message)          |
| `error`         | `{ message }`              | Invalid JSON or other protocol error                     |

## Scripts

### Frontend (`chat-frontend`)

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Production build         |
| `npm run start` | Run production build     |
| `npm run lint` | Run ESLint                |

### Backend (`chat-backend`)

| Command       | Description                              |
| ------------- | ---------------------------------------- |
| `npm run dev` | Compile TypeScript and start the server  |

## License

ISC
