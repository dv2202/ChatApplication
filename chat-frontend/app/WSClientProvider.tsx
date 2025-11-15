"use client";

import { useEffect } from "react";
import { useWebSocket } from "@/store/useWebSocket";

export default function WSClientProvider() {
  const connect = useWebSocket((s) => s.connect);

  useEffect(() => {
    connect();
  }, [connect]);

  return null; 
}
