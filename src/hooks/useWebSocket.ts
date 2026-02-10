// src/hooks/useWebSocket.ts (with socket.io-client)
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type { Appointment } from "@/types/appointment";

interface UseWebSocketProps {
  token: string | null;
  tenantId: string | null;
}

export const useWebSocket = ({ token, tenantId }: UseWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [webSocketData, setWebSocketData] = useState<Appointment[] | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connectSocket = useCallback(() => {
    if (!token) {
      console.error("Token is required for Socket.IO connection");
      return;
    }

    // Cleanup existing socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    console.log("Connecting to Socket.IO...");
    
    // Create Socket.IO connection
    const socket = io("wss://prod.aaravpos.com", {
      path: "/socket.io/",
      transports: ["websocket"],
      query: {
        token: token,
        EIO: "4",
        transport: "websocket"
      },
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket.IO connected successfully");
      setIsConnected(true);
      setConnectionStatus("Connected");
      reconnectAttemptsRef.current = 0;
    });

    socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
      setIsConnected(false);
      setConnectionStatus(`Error: ${error.message}`);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket.IO disconnected:", reason);
      setIsConnected(false);
      setConnectionStatus("Disconnected");
    });

    socket.on("queue_update", (data: any) => {
      console.log("Received queue_update:", data);
      if (data && Array.isArray(data.appointments)) {
        const appointments: Appointment[] = data.appointments.map((item: any) => ({
          appointmentId: item.id || item.appointmentId,
          customerName: `${item.customer?.firstName || item.customer?.first_name || ""} ${item.customer?.lastName || item.customer?.last_name || ""}`.trim(),
          appointmentTime: item.startLocal || item.appointmentTime || item.startTime,
          status: item.status,
          outletId: item.outletId || tenantId || "",
          isWalkIn: item.isWalkIn || false,
          queuePosition: item.queuePosition || 0,
          staffName: `${item.staff?.firstName || ""} ${item.staff?.lastName || ""}`.trim(),
          services: item.services?.map((s: any) => s.name || s.service?.name).join(", ") || "",
          paymentStatus: item.paymentStatus || "PENDING",
          startUtc: item.startUtc || item.startTime,
          endUtc: item.endUtc || item.endTime,
        }));
        
        console.log(`Processed ${appointments.length} appointments`);
        setWebSocketData(appointments);
      }
    });

    socket.on("appointment_created", (data: any) => {
      console.log("New appointment created:", data);
    });

    socket.on("appointment_updated", (data: any) => {
      console.log("Appointment updated:", data);
    });

    socket.on("appointment_cancelled", (data: any) => {
      console.log("Appointment cancelled:", data);
    });
  }, [token, tenantId]);

  const handleReconnect = useCallback(() => {
    console.log("Manual reconnect triggered");
    reconnectAttemptsRef.current = 0;
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    connectSocket();
  }, [connectSocket]);

  // Connect on mount
  useEffect(() => {
    if (token && tenantId) {
      console.log("Credentials available, connecting Socket.IO");
      connectSocket();
    } else {
      console.log("Waiting for credentials to connect Socket.IO");
    }

    return () => {
      console.log("useWebSocket cleanup on unmount");
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token, tenantId, connectSocket]);

  return {
    isConnected,
    connectionStatus,
    webSocketData,
    handleReconnect
  };
};