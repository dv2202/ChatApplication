"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, LogOut, Users, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWebSocket } from "@/store/useWebSocket"

interface ChatRoomProps {
  roomId: string;
  username: string;
}

interface Message {
  id: string
  text: string
  sender: string
  timestamp: Date
  isOwn: boolean
}

export function ChatRoom({ roomId, username }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [activeUsers, setActiveUsers] = useState(Math.floor(Math.random() * 5) + 2)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const { roomUsers, disconnect, sendMessage, lastEvent } = useWebSocket();
  useEffect(() => {
    setMounted(true)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (!lastEvent) return;

    if (lastEvent.type === "message") {
      const { username: senderName, message } = lastEvent.payload;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: message,
          sender: senderName,
          timestamp: new Date(),
          isOwn: senderName === username,
        },
      ]);
    }
}, [lastEvent]);

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const newActiveUsers = roomUsers.length ;
    setActiveUsers(newActiveUsers);
  }, [roomUsers])

  const onLeaveRoom = () => {
    disconnect();
    window.location.reload();
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    sendMessage(roomId, username, inputMessage);
    setInputMessage("");
  };


  return (
    <div className={cn("min-h-screen flex flex-col relative", mounted && "animate-scale-in")}>
      <div className="absolute inset-0 pointer-events-none overflow-x-hidden ">
        <div className="absolute inset-0 bg-linear-to-br from-background via-background to-muted/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float animation-delay-500" />
      </div>

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-10 animate-slide-up-fade">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">{roomId}</h1>
                <Circle className="w-2 h-2 fill-green-500 text-green-500 animate-pulse" />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="transition-all duration-300">
                  {activeUsers} {activeUsers === 1 ? "user" : "users"} active
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={onLeaveRoom}
              className="hover:scale-105 transition-transform bg-transparent h-10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {"Leave"}
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 relative z-10">
        <div className="max-w-5xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-16 space-y-2 animate-slide-up-fade animation-delay-200">
              <div className="text-4xl mb-4 animate-float">💬</div>
              <p className="text-muted-foreground">{"No messages yet. Start the conversation!"}</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={message.id}
                className={cn("flex gap-3 animate-slide-up-fade", message.isOwn && "flex-row-reverse")}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Avatar className="w-10 h-10 animate-scale-in" style={{ animationDelay: `${index * 50 + 100}ms` }}>
                  <AvatarFallback
                    className={cn(
                      "text-xs font-medium",
                      message.isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {message.sender.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className={cn("flex-1 max-w-lg space-y-1", message.isOwn && "items-end")}>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {!message.isOwn && <span className="font-medium">{message.sender}</span>}
                    <span>{message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div
                    className={cn(
                      "rounded-lg px-4 py-3 text-sm leading-relaxed transition-all duration-300 hover:shadow-md",
                      message.isOwn ? "bg-primary text-primary-foreground" : "bg-card border border-border",
                    )}
                  >
                    {message.text}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card/50 backdrop-blur-xl relative z-10 animate-slide-up-fade animation-delay-300">
        <div className="max-w-5xl mx-auto p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              type="text"
              placeholder="Type a message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 h-12 bg-background/50 backdrop-blur-sm transition-all duration-300 focus:shadow-lg"
            />
            <Button
              type="submit"
              disabled={!inputMessage.trim()}
              className="h-12 px-6 hover:scale-105 transition-transform"
            >
              <Send className="w-4 h-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
