"use client"

import { useState } from "react"
import { LandingPage } from "@/components/landing-page"
import { ChatRoom } from "@/components/chat-room"

export default function Home() {
  const [roomId, setRoomId] = useState<string | null>(null)
  const [username, setUsername] = useState<string>(""); 
  return (
    <main className="min-h-screen">
      {!roomId ? (
        <LandingPage onJoinRoom={(room, user) => {
            setRoomId(room);
            setUsername(user);
          }} />
      ) : (
        <ChatRoom roomId={roomId} username={username} />
      )}
    </main>
  )
}
