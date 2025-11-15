"use client"

import { useState } from "react"
import { LandingPage } from "@/components/landing-page"
import { ChatRoom } from "@/components/chat-room"

export default function Home() {
  const [roomId, setRoomId] = useState<string | null>(null)

  return (
    <main className="min-h-screen">
      {!roomId ? (
        <LandingPage onJoinRoom={setRoomId} />
      ) : (
        <ChatRoom roomId={roomId} onLeaveRoom={() => setRoomId(null)} />
      )}
    </main>
  )
}
