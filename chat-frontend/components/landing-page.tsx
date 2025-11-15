"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { MessageSquare, ArrowRight, Sparkles } from "lucide-react"
import * as z from "zod";
import { useWebSocket } from "@/store/useWebSocket"

interface LandingPageProps {
  onJoinRoom: (roomId: string) => void
}

export function LandingPage({ onJoinRoom }: LandingPageProps) {
  const [roomId, setRoomId] = useState("")
  const [currentText, setCurrentText] = useState("")
  const fullText = "Space where no one is looking at you"
  const [showInput, setShowInput] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [userName, setUserName] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const userNameSchema = z.string().min(3).max(20).regex(/^[a-zA-Z0-9-_]+$/);
  const {joinRoom, lastEvent } = useWebSocket();

  const handleJoin = () => { 
    joinRoom(roomId, userName);
  };

  useEffect(() => {
    if (!lastEvent) return;

    if (lastEvent.type === "join_success") {
      onJoinRoom(lastEvent.payload.roomId);
    }

    if (lastEvent.type === "join_error") {
      setUsernameError(lastEvent.payload.message);
    }
  }, [lastEvent]);


  useEffect(() => {
    let index = 0
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setCurrentText(fullText.slice(0, index))
        index++
      } else {
        clearInterval(timer)
        setTimeout(() => setShowInput(true), 500)
      }
    }, 50)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (roomId) {
      setIsTyping(true)
      const timeout = setTimeout(() => setIsTyping(false), 2000)
      return () => clearTimeout(timeout)
    }
  }, [roomId])

  const handleAutoAssignUsername = () => {
    const randomUsername = `User${Math.floor(Math.random() * 10000)}`;
    setUserName(randomUsername);
    setUsernameError("");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        {/* Animated aurora background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-background animate-aurora" />

        {/* Reduced to 3 optimized gradient orbs with will-change for better performance */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-3xl animate-float will-change-transform" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-accent/25 to-primary/25 rounded-full blur-3xl animate-float-delayed will-change-transform" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-primary/15 to-accent/15 rounded-full blur-3xl animate-float-slow will-change-transform" />

        {/* Static grid pattern - removed animation for better performance */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(128,128,128,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(128,128,128,0.08)_1px,transparent_1px)] bg-[size:64px_64px]" />

        {/* Reduced particles to 15 for better performance */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary/40 rounded-full animate-glow-pulse will-change-transform"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Optimized typing effects with fewer particles */}
        {isTyping && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 animate-gradient-shift" />
            {[...Array(20)].map((_, i) => (
              <div
                key={`typing-${i}`}
                className="absolute w-3 h-3 bg-accent/50 rounded-full animate-particle-burst will-change-transform"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
      {/* </CHANGE> */}

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="max-w-2xl w-full space-y-12 relative z-10">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-3 mb-6 animate-scale-in-bounce">
            <div className="p-4 bg-card rounded-2xl border-2 border-border shadow-2xl relative overflow-hidden group hover:scale-110 transition-transform duration-300 will-change-transform">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 opacity-50 group-hover:opacity-100 transition-opacity" />
              <MessageSquare className="w-10 h-10 relative z-10 text-primary" />
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold text-balance leading-tight tracking-tight animate-slide-up-fade-large">
            {currentText}
            <span className="animate-cursor-blink text-primary">|</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-md mx-auto leading-relaxed animate-slide-up-fade animation-delay-200">
            {"Private, anonymous chat rooms. No accounts, no tracking, just conversation."}
          </p>
        </div>

        {showInput && (
          <div className="animate-scale-in-bounce space-y-4">
            <div className="bg-card/90 border-2 border-border rounded-3xl p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-transform duration-300 hover:scale-[1.01] will-change-transform">
              {/* Simplified gradient border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-0 hover:opacity-100 transition-opacity duration-500" />

              <form onSubmit={(e) => {
                e.preventDefault();
                handleJoin();
              }}
                className="space-y-6 relative z-10">
                <div className="space-y-3">
                  <label htmlFor="roomId" className="text-base font-semibold text-foreground flex items-center gap-2">
                    {"Enter Room ID"}
                    {isTyping && <Sparkles className="w-5 h-5 text-primary animate-spin-slow" />}
                  </label>
                  <Input
                    id="roomId"
                    type="text"
                    placeholder="e.g., secret-room-123"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="h-14 text-lg bg-background/50 backdrop-blur-sm border-2 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 rounded-xl"
                    autoFocus
                  />
                  <p className="text-sm text-muted-foreground">{"Create or join an existing room with any ID"}</p>
                </div>
                <div className="space-y-3">
                  <label htmlFor="username" className="text-base font-semibold text-foreground">
                    Username
                  </label>
                  <div className="flex flex-row gap-3">
                    <div className="flex flex-col gap-1 w-[100%]">
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter username"
                        value={userName}
                        onChange={(e) => {
                          const value = e.target.value;
                          setUserName(value);

                          const result = userNameSchema.safeParse(value);

                          if (!result.success) {
                            setUsernameError("Username must be 3–20 characters and use only letters, numbers, - , _");
                          } else {
                            setUsernameError("");
                          }
                        }}
                        className="h-14 text-lg bg-background/50 backdrop-blur-sm border-2 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 rounded-xl"
                      />

                      {usernameError && (
                        <p className="text-sm text-red-500 pl-1">{usernameError}</p>
                      )}
                    </div>
                    <Button type="button" className="h-14 cursor-pointer" onClick={() => handleAutoAssignUsername()} >
                      {"Auto assign Username"}
                    </Button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-semibold group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  disabled={!roomId.trim()}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {"Join Room"}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                </Button>

              </form>
            </div>
            {/* </CHANGE> */}

            <div className="text-center space-y-3 animate-slide-up-fade animation-delay-300">
              <p className="text-sm font-medium text-muted-foreground">{"Quick suggestions"}</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {["team-chat", "study-group", "random-talks"].map((suggestion, index) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => setRoomId(suggestion)}
                    className="text-sm hover:scale-105 hover:bg-primary hover:text-primary-foreground transition-all duration-300 animate-slide-up-fade border-2 will-change-transform"
                    style={{ animationDelay: `${400 + index * 100}ms` }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
