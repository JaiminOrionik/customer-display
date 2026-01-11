"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/LogoutButton"

type Appointment = {
  appointmentId: string;
  customerName: string;
  appointmentTime: string; 
  barberName: string;
  outletName: string;
  outletId: string;
  startTime: string;
  endTime: string;
  status: string;
  queuePosition: number;
};

type Row = {
  id: number;
  name: string;
  appointmentId: string;
  appointmentTime: string;
  status: string;
  minutesToAppointment: number;
  outletId: string;
};

type WebSocketMessage = {
  type: string;
  data: Appointment[];
  timestamp: string;
};

// Helper functions
const decodeJWT = (token: string): any | null => {
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return null;
    
    const payload = tokenParts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

// Extract start time from "13:30 - 14:00"
const extractStartTime = (appointmentTime: string): string => {
  const match = appointmentTime.match(/^(\d{1,2}):(\d{2})/);
  return match ? match[0] : ""; // Returns "13:30"
};

// Parse time string "13:30" to hours and minutes
const parseTimeString = (timeStr: string): { hours: number; minutes: number } | null => {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  
  return { hours, minutes };
};

// Calculate minutes difference between current time and appointment start time
const calculateMinutesToAppointment = (appointmentTime: string): number => {
  const startTimeStr = extractStartTime(appointmentTime);
  if (!startTimeStr) return 0;
  
  const parsedTime = parseTimeString(startTimeStr);
  if (!parsedTime) return 0;
  
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTotalMinutes = currentHours * 60 + currentMinutes;
  const appointmentTotalMinutes = parsedTime.hours * 60 + parsedTime.minutes;
  
  return appointmentTotalMinutes - currentTotalMinutes;
};

export default function Home() {
  const [allRows, setAllRows] = useState<Row[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [screenHeight, setScreenHeight] = useState(0);
  const [screenWidth, setScreenWidth] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [currentOutletId, setCurrentOutletId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Get token, tenantId, and outletId from TOKEN
  const getAuthData = useCallback(() => {
    if (typeof window === 'undefined') return { token: null, tenantId: null, outletId: null };
    
    const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    
    let tenantId = null;
    let outletId = null;
    
    if (token) {
      try {
        const decodedToken = decodeJWT(token);
        if (decodedToken) {
          tenantId = decodedToken.tenantId;
          outletId = decodedToken.outletId;
        }
      } catch (e) {
        console.error("Error extracting data from token:", e);
      }
    }
    
    return { token, tenantId, outletId };
  }, []);

  // Filter appointments by outletId
  const filterAppointmentsByOutlet = useCallback((appointments: Appointment[], outletId: string | null): Appointment[] => {
    if (!outletId) return appointments;
    return appointments.filter(app => app.outletId === outletId);
  }, []);

  // Format appointment data to rows
  const formatAppointmentsToRows = useCallback((appointments: Appointment[], outletId: string | null): Row[] => {
    // Filter by outlet
    const filteredAppointments = filterAppointmentsByOutlet(appointments, outletId);
    
    // Format rows with time calculation
    const rows = filteredAppointments.map((app, index) => {
      const minutesToAppointment = calculateMinutesToAppointment(app.appointmentTime);
      
      return {
        id: index + 1,
        name: app.customerName,
        appointmentId: app.appointmentId,
        appointmentTime: app.appointmentTime,
        status: app.status,
        minutesToAppointment,
        outletId: app.outletId
      };
    });
    
    // Sort: CHECKED_IN first, then by time (closest first)
    return rows.sort((a, b) => {
      if (a.status === 'CHECKED_IN' && b.status !== 'CHECKED_IN') return -1;
      if (a.status !== 'CHECKED_IN' && b.status === 'CHECKED_IN') return 1;
      return a.minutesToAppointment - b.minutesToAppointment;
    })
    .map((row, index) => ({
      ...row,
      id: index + 1
    }));
  }, [filterAppointmentsByOutlet]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'INITIAL_DATA' || message.type === 'queue_update') {
      if (Array.isArray(message.data)) {
        const formattedRows = formatAppointmentsToRows(message.data, currentOutletId);
        setAllRows(formattedRows);
      }
    }
  }, [formatAppointmentsToRows, currentOutletId]);

  // Initialize WebSocket connection
  const connectWebSocket = useCallback(() => {
    const { token, tenantId, outletId } = getAuthData();
    
    setCurrentOutletId(outletId);
    
    if (!token || !tenantId) {
      router.push("/");
      return () => {};
    }
    
    const wsUrl = `wss://api.aaravpos.com/ws/queue?tenantId=${tenantId}&token=${token}`;
    
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    const onOpen = () => {
      setIsConnected(true);
      setConnectionStatus("Connected");
      
      ws.send(JSON.stringify({
        type: 'subscribe',
        channel: 'queue_updates'
      }));
    };
    
    const onMessage = (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
    
    const onError = (error: Event) => {
      setConnectionStatus("Error - Reconnecting...");
      setIsConnected(false);
    };
    
    const onClose = () => {
      setIsConnected(false);
      setConnectionStatus("Disconnected - Reconnecting...");
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      reconnectTimeoutRef.current = setTimeout(() => {
        const { token, tenantId } = getAuthData();
        if (!token || !tenantId) return;
        
        connectWebSocket();
      }, 3000);
    };
    
    ws.onopen = onOpen;
    ws.onmessage = onMessage;
    ws.onerror = onError;
    ws.onclose = onClose;
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [getAuthData, router, handleWebSocketMessage]);

  // Update screen size
  useEffect(() => {
    const updateScreenSize = () => {
      setScreenWidth(window.innerWidth);
      setScreenHeight(window.innerHeight);
      setIsMobile(window.innerWidth < 768);
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // Update current time display
  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }));
    };

    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize WebSocket
  useEffect(() => {
    const { token, tenantId } = getAuthData();
    if (!token || !tenantId) {
      router.push("/");
      return;
    }
    
    const cleanup = connectWebSocket();
    
    return () => {
      if (cleanup) cleanup();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket, getAuthData, router]);

  // Split rows into columns
  const getColumns = () => {
    if (isMobile || allRows.length <= 8) {
      return [allRows];
    }
    
    const middleIndex = Math.ceil(allRows.length / 2);
    return [allRows.slice(0, middleIndex), allRows.slice(middleIndex)];
  };

  const handleReconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
    connectWebSocket();
  };

  const columns = getColumns();

  return (
    <div className="min-h-screen bg-white" ref={containerRef}>
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Image
            src="/logo/AaravPOS-Logo.png"
            alt="AaravPOS"
            width={120}
            height={32}
            className="w-24 sm:w-32 md:w-40"
            priority
          />
          <div className="flex flex-col ml-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-slate-600">{connectionStatus}</span>
              {!isConnected && (
                <button
                  onClick={handleReconnect}
                  className="text-xs px-2 py-1 bg-slate-100 rounded hover:bg-slate-200"
                >
                  Reconnect
                </button>
              )}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Current time: {currentTime}
            </div>
            {currentOutletId && (
              <div className="text-xs text-blue-600 mt-1">
                Outlet: {currentOutletId.substring(0, 8)}...
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-sm text-slate-600">
            {allRows.length} appointments
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="px-4 sm:px-6 pb-6">
        <div className="mx-auto w-full max-w-6xl bg-white">
          <div className="overflow-y-auto" style={{ 
            maxHeight: `calc(100vh - 180px)`,
            minHeight: '300px'
          }}>
            <div className={`grid gap-0 ${columns.length > 1 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
              {columns.map((column, colIndex) => (
                <div key={colIndex} className="relative">
                  <div className="px-4 sm:px-6">
                    {column.length === 0 ? (
                      <div className="flex items-center justify-center h-32 text-slate-400">
                        No appointments
                      </div>
                    ) : (
                      column.map((row) => (
                        <CountdownRowItem 
                          key={`${row.id}-${row.appointmentId}`} 
                          row={row} 
                          colIndex={colIndex}
                        />
                      ))
                    )}
                  </div>
                  
                  {colIndex === 0 && columns.length > 1 && (
                    <div className="hidden md:block absolute right-0 top-0 bottom-0 w-px bg-slate-300" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface CountdownRowItemProps {
  row: Row;
  colIndex: number;
}

function CountdownRowItem({ row, colIndex }: CountdownRowItemProps) {
  const [timeDisplay, setTimeDisplay] = useState<string>("");

  const formatTimeDisplay = (minutes: number): string => {
    // Always show 0 min for CHECKED_IN appointments
    if (row.status === 'CHECKED_IN') {
      return "0 min";
    }
    
    // For BOOKED appointments
    if (minutes < 0) {
      return "0 min";
    }
    
    if (minutes === 0) {
      return "Now";
    }
    
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hr`;
    }
    
    return `${hours} hr ${remainingMinutes} min`;
  };

  const calculateCurrentMinutes = () => {
    const startTimeStr = extractStartTime(row.appointmentTime);
    if (!startTimeStr) return 0;
    
    const parsedTime = parseTimeString(startTimeStr);
    if (!parsedTime) return 0;
    
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;
    const appointmentTotalMinutes = parsedTime.hours * 60 + parsedTime.minutes;
    
    return appointmentTotalMinutes - currentTotalMinutes;
  };

  useEffect(() => {
    const updateDisplay = () => {
      const minutes = calculateCurrentMinutes();
      setTimeDisplay(formatTimeDisplay(minutes));
    };

    updateDisplay();
    const interval = setInterval(updateDisplay, 1000);
    
    return () => clearInterval(interval);
  }, [row.appointmentTime, row.status]);

  return (
    <div className="flex items-center justify-between border-b border-slate-200 py-3 text-sm hover:bg-slate-50 transition-colors duration-150 bg-white">
      <div className="flex w-full items-center gap-4">
        <div className="w-8 text-slate-700 flex items-center gap-1">
          {row.id}.
          {colIndex === 0 && (
            <span className="text-xs text-blue-500">←</span>
          )}
          {colIndex === 1 && (
            <span className="text-xs text-green-500">→</span>
          )}
        </div>
        
        {/* LEFT SIDE: ONLY CUSTOMER NAME */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-slate-900 truncate">
            {row.name}
          </div>
        </div>
        
        {/* RIGHT SIDE: ONLY TIME */}
        <div className="w-20 text-right">
          <div className="font-medium text-slate-700">
            {timeDisplay}
          </div>
        </div>
      </div>
    </div>
  );
}   