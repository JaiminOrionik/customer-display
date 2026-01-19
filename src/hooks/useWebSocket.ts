// src/hooks/useWebSocket.ts
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { WebSocketMessage, Appointment } from "@/types/appointment";

interface UseWebSocketProps {
  token: string | null;
  tenantId: string | null;
}

export const useWebSocket = ({ token, tenantId }: UseWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [webSocketData, setWebSocketData] = useState<Appointment[] | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Prevent unnecessary re-renders
  const tokenRef = useRef(token);
  const tenantIdRef = useRef(tenantId);

  useEffect(() => {
    tokenRef.current = token;
    tenantIdRef.current = tenantId;
  }, [token, tenantId]);

  const connectWebSocket = useCallback(() => {
    // Don't connect if no credentials
    if (!tokenRef.current || !tenantIdRef.current) {
      console.log("No credentials available, skipping WebSocket connection");
      return () => {};
    }

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    const wsUrl = `wss://api.aaravpos.com/ws/queue?tenantId=${tenantIdRef.current}&token=${tokenRef.current}`;
    console.log("Attempting WebSocket connection to:", wsUrl.substring(0, 50) + "...");
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    const onOpen = () => {
      console.log("WebSocket connected successfully");
      setIsConnected(true);
      setConnectionStatus("Connected");
      reconnectAttemptsRef.current = 0; // Reset reconnect attempts
      
      ws.send(JSON.stringify({
        type: 'subscribe',
        channel: 'queue_updates'
      }));
    };
    
    const onMessage = (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        if (message.type === 'INITIAL_DATA' || message.type === 'queue_update') {
          if (Array.isArray(message.data)) {
            setWebSocketData(message.data);
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
    
    const onError = (error: Event) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
      setConnectionStatus("Error");
    };
    
    const onClose = (event: CloseEvent) => {
      console.log("WebSocket closed:", event.code, event.reason);
      setIsConnected(false);
      setConnectionStatus("Disconnected");
      
      // Don't reconnect if closed intentionally or due to auth failure
      if (event.code === 1000 || event.code === 1008) { // Normal closure or policy violation
        console.log("WebSocket closed intentionally, not reconnecting");
        return;
      }
      
      // Exponential backoff for reconnection
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        
        console.log(`Reconnecting attempt ${reconnectAttemptsRef.current} in ${delay}ms`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          if (tokenRef.current && tenantIdRef.current) {
            connectWebSocket();
          }
        }, delay);
      } else {
        console.log("Max reconnection attempts reached");
        setConnectionStatus("Disconnected - Max retries reached");
      }
    };
    
    ws.onopen = onOpen;
    ws.onmessage = onMessage;
    ws.onerror = onError;
    ws.onclose = onClose;
    
    return () => {
      console.log("Cleaning up WebSocket connection");
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close(1000, "Component unmounting");
      }
    };
  }, []); // Empty dependency array - only create once

  const handleReconnect = useCallback(() => {
    console.log("Manual reconnect triggered");
    reconnectAttemptsRef.current = 0;
    connectWebSocket();
  }, [connectWebSocket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("useWebSocket cleanup");
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounting");
        wsRef.current = null;
      }
    };
  }, []);

  return {
    isConnected,
    connectionStatus,
    webSocketData,
    handleReconnect
  };
};