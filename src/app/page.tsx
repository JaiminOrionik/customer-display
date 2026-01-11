// // "use client";

// // import Image from "next/image";
// // import { useState, useEffect, useRef, useCallback } from "react";
// // import { useRouter } from "next/navigation";

// // type Appointment = {
// //   appointmentId: string;
// //   customerName: string;
// //   appointmentTime: string;
// //   barberName: string;
// //   outletName: string;
// //   outletId: string;
// //   startTime: string;
// //   endTime: string;
// //   status: string;
// //   queuePosition: number;
// // };

// // type Row = {
// //   id: number;
// //   name: string;
// //   waitMins: number;
// //   appointmentId: string;
// //   customerName: string;
// //   appointmentTime: string;
// //   barberName: string;
// //   startTime: string;
// //   status: string;
// //   queuePosition: number;
// //   minutesToAppointment: number;
// // };

// // type WebSocketMessage = {
// //   type: string;
// //   data: Appointment[];
// //   timestamp: string;
// // };

// // export default function Home() {
// //   const [allRows, setAllRows] = useState<Row[]>([]);
// //   const [isMobile, setIsMobile] = useState(false);
// //   const [screenHeight, setScreenHeight] = useState(0);
// //   const [screenWidth, setScreenWidth] = useState(0);
// //   const [isConnected, setIsConnected] = useState(false);
// //   const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  
// //   const containerRef = useRef<HTMLDivElement>(null);
// //   const wsRef = useRef<WebSocket | null>(null);
// //   const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
// //   const router = useRouter();

// //   // Get today's date in YYYY-MM-DD format
// //   const getTodayDateString = useCallback((): string => {
// //     const today = new Date();
// //     return today.toISOString().split('T')[0]; // Returns YYYY-MM-DD
// //   }, []);

// //   // Check if appointment is today
// //   const isAppointmentToday = useCallback((startTime: string): boolean => {
// //     const appointmentDate = new Date(startTime).toISOString().split('T')[0];
// //     const today = getTodayDateString();
// //     return appointmentDate === today;
// //   }, [getTodayDateString]);

// //   // Get token and tenantId from storage
// //   const getAuthData = useCallback(() => {
// //     if (typeof window === 'undefined') return { token: null, tenantId: null };
    
// //     const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
// //     const userDataStr = localStorage.getItem("user_data") || sessionStorage.getItem("user_data");
// //     let tenantId = null;
    
// //     if (userDataStr) {
// //       try {
// //         const userData = JSON.parse(userDataStr);
// //         tenantId = userData.store?.tenantId || userData.user?.tenantId;
// //       } catch (e) {
// //         console.error("Error parsing user data:", e);
// //       }
// //     }
    
// //     return { token, tenantId };
// //   }, []);

// //   // Calculate minutes to appointment from current time
// //   const calculateMinutesToAppointment = useCallback((startTime: string): number => {
// //     if (!startTime) return 0;
    
// //     const appointmentTime = new Date(startTime).getTime();
// //     const now = new Date().getTime(); // Always use current time
// //     const diffMinutes = Math.floor((appointmentTime - now) / (1000 * 60));
    
// //     return diffMinutes;
// //   }, []);

// //   // Format appointment data to rows - ONLY TODAY'S APPOINTMENTS
// //   const formatAppointmentsToRows = useCallback((appointments: Appointment[]): Row[] => {
// //     // Filter only BOOKED appointments for TODAY and calculate wait times
// //     const todayAppointments = appointments
// //       .filter(app => app.status === "BOOKED" && isAppointmentToday(app.startTime))
// //       .map((app, index) => {
// //         const minutesToAppointment = calculateMinutesToAppointment(app.startTime);
        
// //         return {
// //           id: index + 1,
// //           name: app.customerName,
// //           waitMins: minutesToAppointment < 0 ? 0 : minutesToAppointment,
// //           appointmentId: app.appointmentId,
// //           customerName: app.customerName,
// //           appointmentTime: app.appointmentTime,
// //           barberName: app.barberName,
// //           startTime: app.startTime,
// //           status: app.status,
// //           queuePosition: app.queuePosition,
// //           minutesToAppointment
// //         };
// //       });
    
// //     // Sort by minutes to appointment (closest first)
// //     return todayAppointments.sort((a, b) => {
// //       // If both have future appointments
// //       if (a.minutesToAppointment >= 0 && b.minutesToAppointment >= 0) {
// //         return a.minutesToAppointment - b.minutesToAppointment;
// //       }
// //       // If one is in the past, put it last
// //       if (a.minutesToAppointment < 0) return 1;
// //       if (b.minutesToAppointment < 0) return -1;
      
// //       return a.queuePosition - b.queuePosition;
// //     })
// //     // Update IDs after sorting
// //     .map((row, index) => ({
// //       ...row,
// //       id: index + 1
// //     }));
// //   }, [calculateMinutesToAppointment, isAppointmentToday]);

// //   // Handle WebSocket messages
// //   const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
// //     console.log("WebSocket message received:", message);
    
// //     switch (message.type) {
// //       case 'INITIAL_DATA':
// //       case 'queue_update':
// //         // Update the entire queue
// //         if (Array.isArray(message.data)) {
// //           const formattedRows = formatAppointmentsToRows(message.data);
// //           setAllRows(formattedRows);
// //         }
// //         break;
        
// //       case 'new_customer':
// //         // Add new customer to queue
// //         if (message.data && Array.isArray(message.data)) {
// //           const newRows = formatAppointmentsToRows(message.data);
// //           setAllRows(prev => {
// //             // Merge and deduplicate by appointmentId
// //             const merged = [...prev];
// //             newRows.forEach(newRow => {
// //               const existingIndex = merged.findIndex(r => r.appointmentId === newRow.appointmentId);
// //               if (existingIndex >= 0) {
// //                 merged[existingIndex] = newRow;
// //               } else {
// //                 merged.push(newRow);
// //               }
// //             });
// //             return formatAppointmentsToRows(merged.map(row => ({
// //               appointmentId: row.appointmentId,
// //               customerName: row.name,
// //               appointmentTime: row.appointmentTime,
// //               barberName: row.barberName,
// //               startTime: row.startTime,
// //               status: row.status,
// //               queuePosition: row.queuePosition,
// //               // Add other required fields
// //               outletName: "",
// //               outletId: "",
// //               endTime: ""
// //             })));
// //           });
// //         }
// //         break;
        
// //       case 'customer_served':
// //       case 'appointment_completed':
// //         // Remove served customer from queue
// //         const servedAppointmentId = message.data?.[0]?.appointmentId;
// //         if (servedAppointmentId) {
// //           setAllRows(prev => prev.filter(row => row.appointmentId !== servedAppointmentId));
// //         }
// //         break;
        
// //       case 'heartbeat':
// //         // Update connection status
// //         setConnectionStatus("Connected");
// //         break;
        
// //       default:
// //         console.log("Unknown message type:", message.type);
// //     }
// //   }, [formatAppointmentsToRows]);

// //   // Initialize WebSocket connection
// //   const connectWebSocket = useCallback(() => {
// //     const { token, tenantId } = getAuthData();
    
// //     // Check if we have required data
// //     if (!token || !tenantId) {
// //       console.error("No token or tenantId found");
// //       router.push("/login");
// //       return () => {};
// //     }
    
// //     // Check token expiration
// //     try {
// //       const tokenParts = token.split('.');
// //       if (tokenParts.length === 3) {
// //         const payload = JSON.parse(atob(tokenParts[1]));
// //         const exp = payload.exp * 1000; // Convert to milliseconds
// //         if (Date.now() > exp) {
// //           console.error("Token expired");
// //           router.push("/login");
// //           return () => {};
// //         }
// //       }
// //     } catch (e) {
// //       console.error("Error parsing token:", e);
// //     }
    
// //     // Construct WebSocket URL
// //     const wsUrl = `wss://api.aaravpos.com/ws/queue?tenantId=${tenantId}&token=${token}`;
    
// //     // Close existing connection if any
// //     if (wsRef.current) {
// //       wsRef.current.close();
// //     }
    
// //     // Create new WebSocket connection
// //     const ws = new WebSocket(wsUrl);
// //     wsRef.current = ws;
    
// //     const onOpen = () => {
// //       console.log("WebSocket connected");
// //       setIsConnected(true);
// //       setConnectionStatus("Connected");
      
// //       // Send initial handshake or subscription message if needed
// //       ws.send(JSON.stringify({
// //         type: 'subscribe',
// //         channel: 'queue_updates'
// //       }));
// //     };
    
// //     const onMessage = (event: MessageEvent) => {
// //       try {
// //         const message: WebSocketMessage = JSON.parse(event.data);
// //         handleWebSocketMessage(message);
// //       } catch (error) {
// //         console.error("Error parsing WebSocket message:", error);
// //       }
// //     };
    
// //     const onError = (error: Event) => {
// //       console.error("WebSocket error:", error);
// //       setConnectionStatus("Error - Reconnecting...");
// //       setIsConnected(false);
// //     };
    
// //     const onClose = (event: CloseEvent) => {
// //       console.log("WebSocket disconnected:", event.code, event.reason);
// //       setIsConnected(false);
// //       setConnectionStatus("Disconnected - Reconnecting...");
      
// //       // Attempt to reconnect after 3 seconds
// //       if (reconnectTimeoutRef.current) {
// //         clearTimeout(reconnectTimeoutRef.current);
// //       }
      
// //       reconnectTimeoutRef.current = setTimeout(() => {
// //         console.log("Attempting to reconnect...");
// //         // Create a new WebSocket connection without calling connectWebSocket recursively
// //         const { token, tenantId } = getAuthData();
        
// //         if (!token || !tenantId) {
// //           console.error("No token or tenantId found during reconnect");
// //           router.push("/login");
// //           return;
// //         }
        
// //         // Construct WebSocket URL
// //         const wsUrl = `wss://api.aaravpos.com/ws/queue?tenantId=${tenantId}&token=${token}`;
        
// //         // Close existing connection if any
// //         if (wsRef.current) {
// //           wsRef.current.close();
// //         }
        
// //         // Create new WebSocket connection
// //         const ws = new WebSocket(wsUrl);
// //         wsRef.current = ws;
        
// //         // Re-attach the same event handlers
// //         ws.onopen = onOpen;
// //         ws.onmessage = onMessage;
// //         ws.onerror = onError;
// //         ws.onclose = onClose;
        
// //       }, 3000);
// //     };
    
// //     ws.onopen = onOpen;
// //     ws.onmessage = onMessage;
// //     ws.onerror = onError;
// //     ws.onclose = onClose;
    
// //     // Return cleanup function
// //     return () => {
// //       ws.onopen = null;
// //       ws.onmessage = null;
// //       ws.onerror = null;
// //       ws.onclose = null;
      
// //       if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
// //         ws.close();
// //       }
// //     };
// //   }, [getAuthData, router, handleWebSocketMessage]);

// //   // Update screen size and calculate columns
// //   useEffect(() => {
// //     const updateScreenSize = () => {
// //       const width = window.innerWidth;
// //       const height = window.innerHeight;
// //       setScreenWidth(width);
// //       setScreenHeight(height);
// //       setIsMobile(width < 768);
// //     };

// //     updateScreenSize();
// //     window.addEventListener('resize', updateScreenSize);
// //     return () => window.removeEventListener('resize', updateScreenSize);
// //   }, []);

// //   // Initialize WebSocket on component mount
// //   useEffect(() => {
// //     // Check auth first
// //     const { token, tenantId } = getAuthData();
// //     if (!token || !tenantId) {
// //       router.push("/login");
// //       return;
// //     }
    
// //     // Connect to WebSocket
// //     const cleanup = connectWebSocket();
    
// //     // Cleanup on unmount
// //     return () => {
// //       if (cleanup) cleanup();
// //       if (reconnectTimeoutRef.current) {
// //         clearTimeout(reconnectTimeoutRef.current);
// //       }
// //       if (wsRef.current) {
// //         wsRef.current.close();
// //       }
// //     };
// //   }, [connectWebSocket, getAuthData, router]);

// //   // Split rows into columns - fill left first, then right
// //   const getColumns = () => {
// //     if (isMobile) {
// //       // Single column for mobile
// //       return [allRows];
// //     }
    
// //     // Calculate how many rows can fit in one column based on screen height
// //     const headerHeight = 120; // Increased for better spacing
// //     const footerHeight = 40;
// //     const availableHeight = screenHeight - headerHeight - footerHeight;
// //     const rowHeight = 50;
// //     const maxRowsPerColumn = Math.floor(availableHeight / rowHeight);
    
// //     // If total rows can fit in single column, use single column
// //     if (allRows.length <= maxRowsPerColumn) {
// //       return [allRows];
// //     }
    
// //     // For scrolling behavior, we'll create dynamic columns based on content
// //     // Split into two columns evenly
// //     const middleIndex = Math.ceil(allRows.length / 2);
// //     const leftColumn = allRows.slice(0, middleIndex);
// //     const rightColumn = allRows.slice(middleIndex);
    
// //     return [leftColumn, rightColumn];
// //   };

// //   // Manual reconnect function
// //   const handleReconnect = () => {
// //     if (reconnectTimeoutRef.current) {
// //       clearTimeout(reconnectTimeoutRef.current);
// //     }
// //     if (wsRef.current) {
// //       wsRef.current.close();
// //     }
// //     connectWebSocket();
// //   };

// //   // Get current time for display
// //   const [displayTime, setDisplayTime] = useState<string>("");
  
// //   useEffect(() => {
// //     const updateDisplayTime = () => {
// //       setDisplayTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
// //     };
    
// //     updateDisplayTime();
// //     const interval = setInterval(updateDisplayTime, 1000); // Update every second
    
// //     return () => clearInterval(interval);
// //   }, []);

// //   const columns = getColumns();
// //   const upcomingCount = allRows.filter(row => row.minutesToAppointment >= 0).length;

// //   return (
// //     <div className="min-h-screen bg-white" ref={containerRef}>
// //       <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200">
// //         <div className="flex items-center gap-2">
// //           <Image
// //             src="/logo/AaravPOS-Logo.png"
// //             alt="AaravPOS"
// //             width={120}
// //             height={32}
// //             className="w-24 sm:w-32 md:w-40"
// //             priority
// //           />
// //           {/* Connection Status Indicator */}
// //           <div className="flex items-center gap-2 ml-4">
// //             <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
// //             <span className="text-xs text-slate-600">{connectionStatus}</span>
// //             {!isConnected && (
// //               <button
// //                 onClick={handleReconnect}
// //                 className="text-xs px-2 py-1 bg-slate-100 rounded hover:bg-slate-200"
// //               >
// //                 Reconnect
// //               </button>
// //             )}
// //           </div>
// //         </div>
// //         <div className="hidden sm:block text-sm text-slate-600">
// //           {allRows.length} appointments today
// //           {!isConnected && (
// //             <span className="ml-2 text-xs text-red-500">(Offline)</span>
// //           )}
// //         </div>
// //       </header>

// //       <main className="px-4 sm:px-6 pb-6">
// //         <div className="mx-auto w-full max-w-6xl bg-white">
// //           <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-4">
// //             <div>
// //               <h1 className="text-xl font-semibold text-slate-900">Today's Appointments</h1>
// //               <p className="text-sm text-slate-600">
// //                 Current time: {displayTime} | Date: {getTodayDateString()}
// //               </p>
// //             </div>
// //             <div className="flex items-center gap-4">
// //               <div className="text-sm text-slate-600">
// //                 {upcomingCount} upcoming today
// //               </div>
// //               <button
// //                 onClick={handleReconnect}
// //                 className="text-sm px-3 py-1 bg-slate-100 rounded hover:bg-slate-200"
// //               >
// //                 Refresh
// //               </button>
// //             </div>
// //           </div>

// //           {/* Scrollable container */}
// //           <div className="overflow-y-auto" style={{ 
// //             maxHeight: `calc(100vh - 200px)`,
// //             minHeight: '300px'
// //           }}>
// //             {/* Display columns with left filling first */}
// //             <div className={`grid gap-0 ${columns.length > 1 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
// //               {columns.map((column, colIndex) => (
// //                 <div 
// //                   key={colIndex} 
// //                   className="relative"
// //                 >
// //                   <div className="px-4 sm:px-6">
// //                     {column.length === 0 ? (
// //                       <div className="flex items-center justify-center h-32 text-slate-400">
// //                         {colIndex === 0 && isConnected ? "No appointments today" : ""}
// //                       </div>
// //                     ) : (
// //                       column.map((r) => (
// //                         <CountdownRowItem 
// //                           key={`${r.id}-${r.appointmentId}`} 
// //                           row={r} 
// //                           colIndex={colIndex}
// //                         />
// //                       ))
// //                     )}
// //                   </div>
                  
// //                   {/* Visual separator between columns */}
// //                   {colIndex === 0 && columns.length > 1 && (
// //                     <div className="hidden md:block absolute right-0 top-0 bottom-0 w-px bg-slate-300" />
// //                   )}
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
          
// //           {/* Empty state */}
// //           {allRows.length === 0 && (
// //             <div className="flex flex-col items-center justify-center h-64 text-center">
// //               <div className="text-slate-400 mb-4">
// //                 <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
// //                 </svg>
// //               </div>
// //               <h3 className="text-lg font-medium text-slate-900 mb-2">
// //                 {isConnected ? "No appointments for today" : "Connecting to server..."}
// //               </h3>
// //               <p className="text-slate-500">
// //                 {isConnected ? "There are no appointments scheduled for today" : "Please wait while we connect to the appointment service"}
// //               </p>
// //               {!isConnected && (
// //                 <button
// //                   onClick={handleReconnect}
// //                   className="mt-4 px-4 py-2 bg-slate-600 text-white rounded-md text-sm hover:bg-slate-700"
// //                 >
// //                   Retry Connection
// //                 </button>
// //               )}
// //             </div>
// //           )}

// //           {/* Footer info */}
// //           {allRows.length > 0 && (
// //             <div className="mt-6 pt-4 border-t border-slate-200 text-center text-sm text-slate-500">
// //               <div className="flex flex-col sm:flex-row items-center justify-between">
// //                 <div>
// //                   Showing all {allRows.length} appointments
// //                   {columns.length > 1 && (
// //                     <span className="ml-2">in {columns.length} columns</span>
// //                   )}
// //                 </div>
// //                 <div className="mt-2 sm:mt-0">
// //                   <span className="text-slate-700 font-medium">{upcomingCount}</span> upcoming • 
// //                   <span className="text-slate-700 font-medium ml-2">{allRows.length - upcomingCount}</span> completed/ongoing
// //                 </div>
// //               </div>
// //               <div className="mt-2 text-xs text-slate-400">
// //                 Scroll to view all appointments • Updates in real-time
// //               </div>
// //             </div>
// //           )}
// //         </div>
// //       </main>
// //     </div>
// //   );
// // }

// // interface CountdownRowItemProps {
// //   row: Row;
// //   colIndex: number;
// // }

// // function CountdownRowItem({ row, colIndex }: CountdownRowItemProps) {
// //   const [minutesLeft, setMinutesLeft] = useState<number>(0);
// //   const [timeDisplay, setTimeDisplay] = useState<string>("");

// //   // Format time display
// //   const formatTimeDisplay = (minutes: number): string => {
// //     if (minutes < 0) return "0 min";
// //     if (minutes === 0) return "Now";
// //     if (minutes < 60) return `${minutes} min`;
    
// //     const hours = Math.floor(minutes / 60);
// //     const remainingMinutes = minutes % 60;
    
// //     if (remainingMinutes === 0) return `${hours} hr`;
// //     return `${hours} hr ${remainingMinutes} min`;
// //   };

// //   // Calculate minutes to appointment
// //   const calculateMinutesToAppointment = (startTime: string): number => {
// //     if (!startTime) return 0;
    
// //     const appointmentTime = new Date(startTime).getTime();
// //     const now = new Date().getTime(); // Always use current time
// //     const diffMinutes = Math.floor((appointmentTime - now) / (1000 * 60));
    
// //     return diffMinutes;
// //   };

// //   // Update countdown every second
// //   useEffect(() => {
// //     const updateCountdown = () => {
// //       const minutes = calculateMinutesToAppointment(row.startTime);
// //       setMinutesLeft(minutes);
// //       setTimeDisplay(formatTimeDisplay(minutes));
// //     };

// //     // Update immediately
// //     updateCountdown();
    
// //     // Update every second for real-time countdown
// //     const interval = setInterval(updateCountdown, 1000);
    
// //     return () => clearInterval(interval);
// //   }, [row.startTime]);

// //   // Get background color based on time remaining
// //   const getRowBackground = () => {
// //     if (minutesLeft < 0) return "bg-red-50";
// //     if (minutesLeft <= 15) return "bg-yellow-50";
// //     if (minutesLeft <= 60) return "bg-blue-50";
// //     return "bg-white";
// //   };

// //   return (
// //     <div className={`flex items-center justify-between border-b border-slate-200 py-3 text-sm hover:bg-slate-50 transition-colors duration-150 ${getRowBackground()}`}>
// //       <div className="flex w-full items-center gap-4">
// //         <div className="w-8 text-slate-700 flex items-center gap-1">
// //           {row.id}.
// //           {colIndex === 0 && (
// //             <span className="text-xs text-blue-500" title="Left column">←</span>
// //           )}
// //           {colIndex === 1 && (
// //             <span className="text-xs text-green-500" title="Right column">→</span>
// //           )}
// //         </div>
// //         <div className="flex-1 min-w-0">
// //           {/* ONLY SHOW CUSTOMER NAME */}
// //           <div className="font-medium text-slate-900 truncate">{row.name}</div>
// //         </div>
// //         <div className="w-24 text-right">
// //           {/* ONLY SHOW MINUTES - REAL-TIME COUNTDOWN */}
// //           <div className={`font-medium ${
// //             minutesLeft <= 15 ? "text-red-600" : 
// //             minutesLeft <= 60 ? "text-blue-600" : 
// //             "text-slate-700"
// //           }`}>
// //             {timeDisplay}
// //           </div>
// //           <div className="text-xs text-slate-500">to go</div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // app/page.tsx
// import { redirect } from 'next/navigation';

// export default function Home() {
//   redirect('/customer');
// }

"use client";

import Image from "next/image";
import { useState, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import type { LoginResponse } from "@/types/auth";

const LottieAnimation = lazy(() => import('@/components/LottieAnimation'));

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const router = useRouter();

  const LOGO = "/logo/AaravPOS-Logo.png";
  const SYMBOL_BG = "/logo/Symbol_crop.svg";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("https://api.aaravpos.com/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const errorsArray = Object.values(data.errors);
          const firstError = errorsArray[0]?.[0];
          setError(firstError || "Validation failed");
        } else if (data.message) {
          setError(data.message);
        } else {
          setError("Login failed. Please try again.");
        }
        return;
      }

      if (data.success && data.data?.token) {
        const userData = {
          token: data.data.token,
          store: data.data.store,
          user: data.data.result,
          roles: data.data.roles
        };

        const storage = formData.remember ? localStorage : sessionStorage;
        storage.setItem("auth_token", data.data.token);
        storage.setItem("user_data", JSON.stringify(userData));


        router.push("/customer");
        
      } else {
        setError(data.message || "Invalid credentials");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
    <header className="px-6 py-5 md:px-10">
    <div className="flex items-center gap-3">
        <Image
        src={LOGO}
        alt="AaravPOS"
        width={200} 
        height={60} 
        priority
        className="h-auto w-auto"
        sizes="(max-width: 768px) 160px, 200px"  
        />
    </div>
    </header>

      <main className="grid min-h-[calc(100vh-84px)] grid-cols-1 lg:grid-cols-[1.2fr_1fr]">
        <section className="hidden items-center justify-center px-6 py-6 lg:flex">
          <div className="w-full max-w-[760px]">
            <Suspense fallback={
              <div className="w-full h-[520px] xl:h-[700px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg" />
            }>
              <LottieAnimation />
            </Suspense>
          </div>
        </section>

        <section className="relative flex items-center justify-center px-6 py-10 lg:px-10 overflow-hidden">
          <div className="pointer-events-none absolute inset-0">


            <div className="absolute bottom-[0px] right-[0px] opacity-[0.10] md:opacity-[0.12]">
              <Image
                src={SYMBOL_BG}
                alt="Background symbol"
                width={650}
                height={650}
                className="select-none"
                priority={false}
                loading="lazy"
                sizes="(max-width: 768px) 300px, 650px"
              />
            </div>
          </div>

        
          <div className="relative z-10 flex w-full max-w-[520px] flex-col">
          
            <div className="rounded-lg sm:p-7">
              <h1 className="text-[24px] sm:text-[26px] font-bold text-slate-900">
                Welcome!
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Sign in to access your AaravPOS dashboard.
              </p>

         
              {error && (
                <div className="mt-4 rounded-md bg-red-50 p-4 animate-fadeIn">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <form
                className="mt-6 space-y-4"
                onSubmit={handleLogin}
                noValidate
              >
            
                <div>
                  <label
                    htmlFor="email"
                    className="block text-[13px] font-semibold text-slate-700"
                  >
                    Email
                  </label>

                  <div className="relative mt-2">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter Email (e.g., user@example.com)"
                      className="h-[42px] w-full rounded-md border border-slate-300 bg-white px-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/15 disabled:opacity-50"
                      autoComplete="email"
                      required
                      disabled={isLoading}
                      aria-describedby="email-error"
                    />

                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M4 6h16v12H4V6z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                        <path
                          d="M4 7l8 6 8-6"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </div>

              
                <div>
                  <label
                    htmlFor="password"
                    className="block text-[13px] font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative mt-2">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter Password"
                      className="h-[42px] w-full rounded-md border border-slate-300 bg-white px-3 pr-16 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/15 disabled:opacity-50"
                      autoComplete="current-password"
                      required
                      disabled={isLoading}
                      aria-describedby="password-error"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      disabled={isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                        <path
                          d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

              
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <label className="flex items-center gap-2 text-[13px] text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="remember"
                      checked={formData.remember}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-slate-300 accent-red-600 disabled:opacity-50 cursor-pointer"
                      disabled={isLoading}
                    />
                    Remember me
                  </label>
                </div>

            
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-3 h-[42px] w-full rounded-md bg-red-600 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:scale-[0.98]"
                  aria-busy={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>
            </div>

           
            <div className="mt-8 text-center text-xs text-slate-400 lg:mt-10">
              © {new Date().getFullYear()} Aaravpos. All Rights Reserved.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}