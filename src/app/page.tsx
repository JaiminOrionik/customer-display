// // "use client";

// // import Image from "next/image";
// // import { useState, useEffect, useRef } from "react";

// // type Row = { id: number; name: string; waitMins: number };

// // export default function Home() {
// //   const allRows: Row[] = [
// //     { id: 1, name: "Hetvi K.", waitMins: 5 },
// //     { id: 2, name: "John D.", waitMins: 10 },
// //     { id: 3, name: "Sarah M.", waitMins: 12 },
// //     { id: 4, name: "Mike R.", waitMins: 15 },
// //     { id: 5, name: "Emma L.", waitMins: 18 },
// //     { id: 6, name: "David K.", waitMins: 22 },
// //     { id: 7, name: "Lisa S.", waitMins: 26 },
// //     { id: 8, name: "Tom B.", waitMins: 30 },
// //     { id: 9, name: "Anna P.", waitMins: 35 },
// //     { id: 10, name: "Chris W.", waitMins: 42 },
// //     { id: 11, name: "Megan T.", waitMins: 45 },
// //     { id: 12, name: "James H.", waitMins: 50 },
// //     { id: 13, name: "Olivia M.", waitMins: 58 },
// //     { id: 14, name: "Robert J.", waitMins: 68 },
// //     { id: 15, name: "Sophia L.", waitMins: 70 },
// //     { id: 16, name: "Grace Y.", waitMins: 75 },
// //     { id: 17, name: "Kevin Z.", waitMins: 80 },
// //     { id: 18, name: "Rachel G.", waitMins: 85 },
// //     { id: 19, name: "Brian M.", waitMins: 90 },
// //     { id: 20, name: "Amanda C.", waitMins: 95 },
// //     { id: 21, name: "Alex M.", waitMins: 100 },
// //     { id: 22, name: "John D.", waitMins: 105 },
// //     { id: 23, name: "Sarah L.", waitMins: 110 },
// //     { id: 24, name: "Mike R.", waitMins: 115 },
// //     { id: 25, name: "Emma S.", waitMins: 120 },
// //     { id: 26, name: "David K.", waitMins: 125 },
// //     { id: 27, name: "Lisa P.", waitMins: 130 },
// //     { id: 28, name: "Tom B.", waitMins: 135 },
// //     { id: 29, name: "Anna W.", waitMins: 140 },
// //     { id: 30, name: "Chris G.", waitMins: 145 },
// //     { id: 31, name: "Megan T.", waitMins: 150 },
// //     { id: 32, name: "James H.", waitMins: 155 },
// //     { id: 33, name: "Olivia M.", waitMins: 160 },
// //     { id: 34, name: "Robert J.", waitMins: 165 },
// //     { id: 35, name: "Sophia L.", waitMins: 170 },
// //     { id: 36, name: "Grace Y.", waitMins: 175 },
// //     { id: 37, name: "Kevin Z.", waitMins: 180 },
// //     { id: 38, name: "Rachel G.", waitMins: 185 },
// //     { id: 39, name: "Brian M.", waitMins: 190 },
// //     { id: 40, name: "Amanda C.", waitMins: 195 },
// //   ];

// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [rowsPerPage, setRowsPerPage] = useState(10);
// //   const [isMobile, setIsMobile] = useState(false);
// //   const [screenHeight, setScreenHeight] = useState(0);
// //   const [screenWidth, setScreenWidth] = useState(0);
// //   const containerRef = useRef<HTMLDivElement>(null);

// //   // Step 1: Confirm screen size
// //   useEffect(() => {
// //     const updateScreenSize = () => {
// //       const width = window.innerWidth;
// //       const height = window.innerHeight;
// //       setScreenWidth(width);
// //       setScreenHeight(height);
// //       setIsMobile(width < 768);
      
// //       // Step 2: Calculate rows per page based on screen height
// //       const headerHeight = 80;
// //       const paginationHeight = 80;
// //       const margins = 40;
// //       const availableHeight = height - headerHeight - paginationHeight - margins;
// //       const rowHeight = 50;
// //       const maxRowsPerColumn = Math.floor(availableHeight / rowHeight);
      
// //       // For two columns, calculate total rows
// //       let calculatedRowsPerPage;
// //       if (width < 768) {
// //         // Single column on mobile
// //         calculatedRowsPerPage = Math.max(6, Math.min(maxRowsPerColumn, 12));
// //       } else if (width < 1024) {
// //         // Two columns on tablet
// //         calculatedRowsPerPage = Math.max(8, Math.min(maxRowsPerColumn * 2, 20));
// //       } else {
// //         // Two columns on desktop
// //         calculatedRowsPerPage = Math.max(10, Math.min(maxRowsPerColumn * 2, 24));
// //       }
      
// //       setRowsPerPage(calculatedRowsPerPage);
// //     };

// //     updateScreenSize();
// //     window.addEventListener('resize', updateScreenSize);
// //     return () => window.removeEventListener('resize', updateScreenSize);
// //   }, []);

// //   // Step 3 & 4: Split rows into columns - fill left first, then right
// //   const getColumns = () => {
// //     if (isMobile) {
// //       // Single column for mobile
// //       return [currentRows];
// //     }
    
// //     // Calculate how many rows can fit in one column based on screen height
// //     const headerHeight = 80;
// //     const paginationHeight = 80;
// //     const margins = 40;
// //     const availableHeight = screenHeight - headerHeight - paginationHeight - margins;
// //     const rowHeight = 50;
// //     const maxRowsPerColumn = Math.floor(availableHeight / rowHeight);
    
// //     // If total rows can fit in single column, use single column
// //     if (currentRows.length <= maxRowsPerColumn) {
// //       return [currentRows];
// //     }
    
// //     // Split into two columns: fill left column first completely
// //     const leftColumnRows = Math.min(currentRows.length, maxRowsPerColumn);
// //     const rightColumnRows = currentRows.length - leftColumnRows;
    
// //     // Create columns
// //     const leftColumn = currentRows.slice(0, leftColumnRows);
// //     const rightColumn = rightColumnRows > 0 ? 
// //       currentRows.slice(leftColumnRows, leftColumnRows + Math.min(rightColumnRows, maxRowsPerColumn)) : 
// //       [];
    
// //     return [leftColumn, rightColumn];
// //   };

// //   const totalPages = Math.ceil(allRows.length / rowsPerPage);
// //   const indexOfLastRow = currentPage * rowsPerPage;
// //   const indexOfFirstRow = indexOfLastRow - rowsPerPage;
// //   const currentRows = allRows.slice(indexOfFirstRow, indexOfLastRow);
// //   const columns = getColumns();

// //   const goToPage = (pageNumber: number) => {
// //     setCurrentPage(pageNumber);
// //     window.scrollTo({ top: 0, behavior: 'smooth' });
// //   };

// //   const getPageNumbers = () => {
// //     const pageNumbers = [];
// //     const maxVisiblePages = isMobile ? 3 : 5;
    
// //     if (totalPages <= maxVisiblePages) {
// //       for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
// //     } else {
// //       pageNumbers.push(1);
// //       let start = Math.max(2, currentPage - 1);
// //       let end = Math.min(totalPages - 1, currentPage + 1);
      
// //       if (currentPage <= 3) {
// //         end = maxVisiblePages - 1;
// //       } else if (currentPage >= totalPages - 2) {
// //         start = totalPages - maxVisiblePages + 2;
// //       }
      
// //       if (start > 2) pageNumbers.push('...');
// //       for (let i = start; i <= end; i++) pageNumbers.push(i);
// //       if (end < totalPages - 1) pageNumbers.push('...');
// //       pageNumbers.push(totalPages);
// //     }
    
// //     return pageNumbers;
// //   };

// //   return (
// //     <div className="min-h-screen bg-white" ref={containerRef}>
// //       <header className="flex items-center justify-between px-4 sm:px-6 py-4">
// //         <div className="flex items-center gap-2">
// //           <Image
// //             src="/logo/AaravPOS-Logo.png"
// //             alt="AaravPOS"
// //             width={120}
// //             height={32}
// //             className="w-24 sm:w-32 md:w-40"
// //             priority
// //           />
// //         </div>
// //         <div className="hidden sm:block text-sm text-slate-600">
       
// //           Showing {indexOfFirstRow + 1}-{Math.min(indexOfLastRow, allRows.length)} of {allRows.length}
// //         </div>
// //       </header>

// //       <main className="px-4 sm:px-6 pb-6">
// //         <div className="mx-auto w-full max-w-6xl bg-white">
// //           <div className="min-h-[60vh]">
// //             {/* Step 3 & 4: Display columns with left filling first */}
// //             <div className={`grid gap-0 ${columns.length > 1 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
// //               {columns.map((column, colIndex) => (
// //                 <div 
// //                   key={colIndex} 
// //                   className="relative  mx-2"
// //                   style={{ 
// //                     minHeight: columns.length > 1 ? `${Math.min(column.length, Math.floor((screenHeight - 200) / 50)) * 50}px` : 'auto'
// //                   }}
// //                 >
// //                   <div className="px-4 sm:px-6 py-2">
// //                     {column.length === 0 ? (
// //                       <div className="flex items-center justify-center h-32 text-slate-400">
// //                         Empty
// //                       </div>
// //                     ) : (
// //                       column.map((r) => (
// //                         <RowItem key={r.id} row={r} colIndex={colIndex} />
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
            
// //             {/* Empty state */}
// //             {currentRows.length === 0 && (
// //               <div className="flex flex-col items-center justify-center h-64 text-center">
// //                 <div className="text-slate-400 mb-4">
// //                   <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
// //                   </svg>
// //                 </div>
// //                 <h3 className="text-lg font-medium text-slate-900 mb-2">No customers waiting</h3>
// //                 <p className="text-slate-500">The waiting list is currently empty</p>
// //               </div>
// //             )}
// //           </div>

// //           {/* Step 5: Pagination for overflow */}
// //           <div className="mt-4 sm:mt-8">
// //             <div className="md:hidden flex flex-col gap-4">
// //               <div className="flex items-center justify-between">
// //                 <button
// //                   onClick={() => goToPage(currentPage - 1)}
// //                   disabled={currentPage === 1}
// //                   className={`px-4 py-2 rounded text-sm font-medium ${
// //                     currentPage === 1
// //                       ? "text-slate-300 cursor-not-allowed"
// //                       : "text-slate-600 hover:bg-slate-100"
// //                   }`}
// //                 >
// //                   ← Previous
// //                 </button>
// //                 <span className="text-sm text-slate-600">Page {currentPage} of {totalPages}</span>
// //                 <button
// //                   onClick={() => goToPage(currentPage + 1)}
// //                   disabled={currentPage === totalPages}
// //                   className={`px-4 py-2 rounded text-sm font-medium ${
// //                     currentPage === totalPages
// //                       ? "text-slate-300 cursor-not-allowed"
// //                       : "text-slate-600 hover:bg-slate-100"
// //                   }`}
// //                 >
// //                   Next →
// //                 </button>
// //               </div>
// //               <div className="text-center text-sm text-slate-500">
// //                 {rowsPerPage} rows per page | {columns.length} column{columns.length !== 1 ? 's' : ''}
// //               </div>
// //             </div>

// //             <div className="hidden md:flex flex-col sm:flex-row items-center justify-between gap-4">
// //               <div className="text-sm text-slate-600">
// //                 Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, allRows.length)} of {allRows.length} entries
// //                 <span className="ml-4 text-slate-500">
// //                   ({rowsPerPage} per page | {columns.length} column{columns.length !== 1 ? 's' : ''})
// //                 </span>
// //               </div>

// //               <div className="flex items-center gap-1">
// //                 <button
// //                   onClick={() => goToPage(currentPage - 1)}
// //                   disabled={currentPage === 1}
// //                   className={`px-3 py-1.5 rounded text-sm ${
// //                     currentPage === 1
// //                       ? "text-slate-300 cursor-not-allowed"
// //                       : "text-slate-600 hover:bg-slate-100"
// //                   }`}
// //                 >
// //                   &lt;
// //                 </button>

// //                 {getPageNumbers().map((page, index) => (
// //                   typeof page === 'number' ? (
// //                     <button
// //                       key={index}
// //                       onClick={() => goToPage(page)}
// //                       className={`w-8 h-8 rounded text-sm ${
// //                         currentPage === page
// //                           ? "bg-slate-600 text-white"
// //                           : "text-slate-600 hover:bg-slate-100"
// //                       }`}
// //                     >
// //                       {page}
// //                     </button>
// //                   ) : (
// //                     <span key={index} className="px-2 text-slate-400">{page}</span>
// //                   )
// //                 ))}

// //                 <button
// //                   onClick={() => goToPage(currentPage + 1)}
// //                   disabled={currentPage === totalPages}
// //                   className={`px-3 py-1.5 rounded text-sm ${
// //                     currentPage === totalPages
// //                       ? "text-slate-300 cursor-not-allowed"
// //                       : "text-slate-600 hover:bg-slate-100"
// //                   }`}
// //                 >
// //                   &gt;
// //                 </button>
// //               </div>

// //               <div className="flex items-center gap-2 text-sm">
// //                 <span className="text-slate-600">Go to:</span>
// //                 <input
// //                   type="number"
// //                   min="1"
// //                   max={totalPages}
// //                   value={currentPage}
// //                   onChange={(e) => {
// //                     const page = Math.max(1, Math.min(totalPages, Number(e.target.value)));
// //                     goToPage(page);
// //                   }}
// //                   className="w-16 border border-slate-300 rounded px-2 py-1 text-sm text-black"
// //                 />
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </main>
// //     </div>
// //   );
// // }

// // function RowItem({ row, colIndex }: { row: { id: number; name: string; waitMins: number }, colIndex: number }) {
// //   return (
// //     <div className={`flex items-center justify-between border-b border-slate-200 py-3 text-sm ${colIndex === 0 ? 'bg-slate-50/50' : ''}`}>
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
// //         <div className="flex-1 font-medium text-slate-900">{row.name}</div>
// //         <div className="w-20 text-right text-slate-700">{row.waitMins} min</div>
// //       </div>
// //     </div>
// //   );
// // }

// // app/page.tsx
// "use client";

// import Image from "next/image";
// import { useState, useEffect, useRef, useCallback } from "react";
// import { useRouter } from "next/navigation";

// type Row = { 
//   id: number; 
//   name: string; 
//   waitMins: number;
//   // You might get additional fields from WebSocket
//   customerId?: string;
//   queueNumber?: string;
//   status?: string;
//   createdAt?: string;
// };

// type WebSocketMessage = {
//   type: 'queue_update' | 'new_customer' | 'customer_served' | 'heartbeat';
//   data: any;
//   timestamp: string;
// };

// export default function Home() {
//   const [allRows, setAllRows] = useState<Row[]>([
//     { id: 1, name: "Hetvi K.", waitMins: 5 },
//     { id: 2, name: "John D.", waitMins: 10 },
//     { id: 3, name: "Sarah M.", waitMins: 12 },
//     { id: 4, name: "Mike R.", waitMins: 15 },
//     { id: 5, name: "Emma L.", waitMins: 18 },
//     // ... rest of your initial data
//   ]);
  
//   const [currentPage, setCurrentPage] = useState(1);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [isMobile, setIsMobile] = useState(false);
//   const [screenHeight, setScreenHeight] = useState(0);
//   const [screenWidth, setScreenWidth] = useState(0);
//   const [isConnected, setIsConnected] = useState(false);
//   const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  
//   const containerRef = useRef<HTMLDivElement>(null);
//   const wsRef = useRef<WebSocket | null>(null);
//   const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const router = useRouter();

//   // Get token and tenantId from storage
//   const getAuthData = useCallback(() => {
//     if (typeof window === 'undefined') return { token: null, tenantId: null };
    
//     const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
//     const userDataStr = localStorage.getItem("user_data") || sessionStorage.getItem("user_data");
//     let tenantId = null;
    
//     if (userDataStr) {
//       try {
//         const userData = JSON.parse(userDataStr);
//         tenantId = userData.store?.tenantId || userData.user?.tenantId;
//       } catch (e) {
//         console.error("Error parsing user data:", e);
//       }
//     }
    
//     return { token, tenantId };
//   }, []);

//   // Initialize WebSocket connection
//   const connectWebSocket = useCallback(() => {
//     const { token, tenantId } = getAuthData();
    
//     // Check if we have required data
//     if (!token || !tenantId) {
//       console.error("No token or tenantId found");
//       router.push("/login");
//       return;
//     }
    
//     // Check token expiration
//     try {
//       const tokenParts = token.split('.');
//       if (tokenParts.length === 3) {
//         const payload = JSON.parse(atob(tokenParts[1]));
//         const exp = payload.exp * 1000; // Convert to milliseconds
//         if (Date.now() > exp) {
//           console.error("Token expired");
//           router.push("/login");
//           return;
//         }
//       }
//     } catch (e) {
//       console.error("Error parsing token:", e);
//     }
    
//     // Construct WebSocket URL
//     const wsUrl = `wss://api.aaravpos.com/ws/queue?tenantId=${tenantId}&token=${token}`;
    
//     // Close existing connection if any
//     if (wsRef.current) {
//       wsRef.current.close();
//     }
    
//     // Create new WebSocket connection
//     const ws = new WebSocket(wsUrl);
//     wsRef.current = ws;
    
//     ws.onopen = () => {
//       console.log("WebSocket connected");
//       setIsConnected(true);
//       setConnectionStatus("Connected");
      
//       // Send initial handshake or subscription message if needed
//       ws.send(JSON.stringify({
//         type: 'subscribe',
//         channel: 'queue_updates'
//       }));
//     };
    
//     ws.onmessage = (event) => {
//       try {
//         const message: WebSocketMessage = JSON.parse(event.data);
//         console.log("WebSocket message received:", message);
        
//         // Handle different message types
//         handleWebSocketMessage(message);
//       } catch (error) {
//         console.error("Error parsing WebSocket message:", error);
//       }
//     };
    
//     ws.onerror = (error) => {
//       console.error("WebSocket error:", error);
//       setConnectionStatus("Error - Reconnecting...");
//       setIsConnected(false);
//     };
    
//     ws.onclose = (event) => {
//       console.log("WebSocket disconnected:", event.code, event.reason);
//       setIsConnected(false);
//       setConnectionStatus("Disconnected - Reconnecting...");
      
//       // Attempt to reconnect after 3 seconds
//       if (reconnectTimeoutRef.current) {
//         clearTimeout(reconnectTimeoutRef.current);
//       }
      
//       reconnectTimeoutRef.current = setTimeout(() => {
//         console.log("Attempting to reconnect...");
//         connectWebSocket();
//       }, 3000);
//     };
    
//     // Return cleanup function
//     return () => {
//       if (ws.readyState === WebSocket.OPEN) {
//         ws.close();
//       }
//     };
//   }, [getAuthData, router]);

//   // Handle WebSocket messages
//   const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
//     switch (message.type) {
//       case 'queue_update':
//         // Update the entire queue
//         if (Array.isArray(message.data)) {
//           const formattedRows = message.data.map((item: any, index: number) => ({
//             id: index + 1,
//             name: item.customerName || `Customer ${index + 1}`,
//             waitMins: calculateWaitTime(item.createdAt),
//             customerId: item.customerId,
//             queueNumber: item.queueNumber,
//             status: item.status,
//             createdAt: item.createdAt
//           }));
//           setAllRows(formattedRows);
//         }
//         break;
        
//       case 'new_customer':
//         // Add new customer to queue
//         const newCustomer = message.data;
//         setAllRows(prev => {
//           const newRow: Row = {
//             id: prev.length + 1,
//             name: newCustomer.customerName || `Customer ${prev.length + 1}`,
//             waitMins: calculateWaitTime(newCustomer.createdAt),
//             customerId: newCustomer.customerId,
//             queueNumber: newCustomer.queueNumber,
//             status: newCustomer.status,
//             createdAt: newCustomer.createdAt
//           };
//           return [...prev, newRow];
//         });
//         break;
        
//       case 'customer_served':
//         // Remove served customer from queue
//         const servedCustomerId = message.data.customerId;
//         setAllRows(prev => prev.filter(row => row.customerId !== servedCustomerId));
//         break;
        
//       case 'heartbeat':
//         // Update connection status
//         setConnectionStatus("Connected");
//         break;
        
//       default:
//         console.log("Unknown message type:", message.type);
//     }
//   }, []);

//   // Calculate wait time from createdAt timestamp
//   const calculateWaitTime = (createdAt: string): number => {
//     if (!createdAt) return 0;
    
//     const created = new Date(createdAt).getTime();
//     const now = Date.now();
//     const diffMinutes = Math.floor((now - created) / (1000 * 60));
    
//     return Math.max(0, diffMinutes);
//   };

//   // Step 1: Confirm screen size
//   useEffect(() => {
//     const updateScreenSize = () => {
//       const width = window.innerWidth;
//       const height = window.innerHeight;
//       setScreenWidth(width);
//       setScreenHeight(height);
//       setIsMobile(width < 768);
      
//       // Step 2: Calculate rows per page based on screen height
//       const headerHeight = 80;
//       const paginationHeight = 80;
//       const margins = 40;
//       const availableHeight = height - headerHeight - paginationHeight - margins;
//       const rowHeight = 50;
//       const maxRowsPerColumn = Math.floor(availableHeight / rowHeight);
      
//       // For two columns, calculate total rows
//       let calculatedRowsPerPage;
//       if (width < 768) {
//         // Single column on mobile
//         calculatedRowsPerPage = Math.max(6, Math.min(maxRowsPerColumn, 12));
//       } else if (width < 1024) {
//         // Two columns on tablet
//         calculatedRowsPerPage = Math.max(8, Math.min(maxRowsPerColumn * 2, 20));
//       } else {
//         // Two columns on desktop
//         calculatedRowsPerPage = Math.max(10, Math.min(maxRowsPerColumn * 2, 24));
//       }
      
//       setRowsPerPage(calculatedRowsPerPage);
//     };

//     updateScreenSize();
//     window.addEventListener('resize', updateScreenSize);
//     return () => window.removeEventListener('resize', updateScreenSize);
//   }, []);

//   // Initialize WebSocket on component mount
//   useEffect(() => {
//     // Check auth first
//     const { token, tenantId } = getAuthData();
//     if (!token || !tenantId) {
//       router.push("/login");
//       return;
//     }
    
//     // Connect to WebSocket
//     const cleanup = connectWebSocket();
    
//     // Cleanup on unmount
//     return () => {
//       if (cleanup) cleanup();
//       if (reconnectTimeoutRef.current) {
//         clearTimeout(reconnectTimeoutRef.current);
//       }
//       if (wsRef.current) {
//         wsRef.current.close();
//       }
//     };
//   }, [connectWebSocket, getAuthData, router]);

//   // Step 3 & 4: Split rows into columns - fill left first, then right
//   const getColumns = () => {
//     if (isMobile) {
//       // Single column for mobile
//       return [currentRows];
//     }
    
//     // Calculate how many rows can fit in one column based on screen height
//     const headerHeight = 80;
//     const paginationHeight = 80;
//     const margins = 40;
//     const availableHeight = screenHeight - headerHeight - paginationHeight - margins;
//     const rowHeight = 50;
//     const maxRowsPerColumn = Math.floor(availableHeight / rowHeight);
    
//     // If total rows can fit in single column, use single column
//     if (currentRows.length <= maxRowsPerColumn) {
//       return [currentRows];
//     }
    
//     // Split into two columns: fill left column first completely
//     const leftColumnRows = Math.min(currentRows.length, maxRowsPerColumn);
//     const rightColumnRows = currentRows.length - leftColumnRows;
    
//     // Create columns
//     const leftColumn = currentRows.slice(0, leftColumnRows);
//     const rightColumn = rightColumnRows > 0 ? 
//       currentRows.slice(leftColumnRows, leftColumnRows + Math.min(rightColumnRows, maxRowsPerColumn)) : 
//       [];
    
//     return [leftColumn, rightColumn];
//   };

//   const totalPages = Math.ceil(allRows.length / rowsPerPage);
//   const indexOfLastRow = currentPage * rowsPerPage;
//   const indexOfFirstRow = indexOfLastRow - rowsPerPage;
//   const currentRows = allRows.slice(indexOfFirstRow, indexOfLastRow);
//   const columns = getColumns();

//   const goToPage = (pageNumber: number) => {
//     setCurrentPage(pageNumber);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const getPageNumbers = () => {
//     const pageNumbers = [];
//     const maxVisiblePages = isMobile ? 3 : 5;
    
//     if (totalPages <= maxVisiblePages) {
//       for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
//     } else {
//       pageNumbers.push(1);
//       let start = Math.max(2, currentPage - 1);
//       let end = Math.min(totalPages - 1, currentPage + 1);
      
//       if (currentPage <= 3) {
//         end = maxVisiblePages - 1;
//       } else if (currentPage >= totalPages - 2) {
//         start = totalPages - maxVisiblePages + 2;
//       }
      
//       if (start > 2) pageNumbers.push('...');
//       for (let i = start; i <= end; i++) pageNumbers.push(i);
//       if (end < totalPages - 1) pageNumbers.push('...');
//       pageNumbers.push(totalPages);
//     }
    
//     return pageNumbers;
//   };

//   // Manual reconnect function
//   const handleReconnect = () => {
//     if (reconnectTimeoutRef.current) {
//       clearTimeout(reconnectTimeoutRef.current);
//     }
//     connectWebSocket();
//   };

//   return (
//     <div className="min-h-screen bg-white" ref={containerRef}>
//       <header className="flex items-center justify-between px-4 sm:px-6 py-4">
//         <div className="flex items-center gap-2">
//           <Image
//             src="/logo/AaravPOS-Logo.png"
//             alt="AaravPOS"
//             width={120}
//             height={32}
//             className="w-24 sm:w-32 md:w-40"
//             priority
//           />
//           {/* Connection Status Indicator */}
//           <div className="flex items-center gap-2 ml-4">
//             <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
//             <span className="text-xs text-slate-600">{connectionStatus}</span>
//             {!isConnected && (
//               <button
//                 onClick={handleReconnect}
//                 className="text-xs px-2 py-1 bg-slate-100 rounded hover:bg-slate-200"
//               >
//                 Reconnect
//               </button>
//             )}
//           </div>
//         </div>
//         <div className="hidden sm:block text-sm text-slate-600">
//           Showing {indexOfFirstRow + 1}-{Math.min(indexOfLastRow, allRows.length)} of {allRows.length}
//           {!isConnected && (
//             <span className="ml-2 text-xs text-red-500">(Offline)</span>
//           )}
//         </div>
//       </header>

//       <main className="px-4 sm:px-6 pb-6">
//         <div className="mx-auto w-full max-w-6xl bg-white">
//           <div className="min-h-[60vh]">
//             {/* Step 3 & 4: Display columns with left filling first */}
//             <div className={`grid gap-0 ${columns.length > 1 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
//               {columns.map((column, colIndex) => (
//                 <div 
//                   key={colIndex} 
//                   className="relative mx-2"
//                   style={{ 
//                     minHeight: columns.length > 1 ? `${Math.min(column.length, Math.floor((screenHeight - 200) / 50)) * 50}px` : 'auto'
//                   }}
//                 >
//                   <div className="px-4 sm:px-6 py-2">
//                     {column.length === 0 ? (
//                       <div className="flex items-center justify-center h-32 text-slate-400">
//                         {isConnected ? "Empty" : "Connecting..."}
//                       </div>
//                     ) : (
//                       column.map((r) => (
//                         <RowItem key={`${r.id}-${r.customerId || ''}`} row={r} colIndex={colIndex} />
//                       ))
//                     )}
//                   </div>
                  
//                   {/* Visual separator between columns */}
//                   {colIndex === 0 && columns.length > 1 && (
//                     <div className="hidden md:block absolute right-0 top-0 bottom-0 w-px bg-slate-300" />
//                   )}
//                 </div>
//               ))}
//             </div>
            
//             {/* Empty state */}
//             {currentRows.length === 0 && (
//               <div className="flex flex-col items-center justify-center h-64 text-center">
//                 <div className="text-slate-400 mb-4">
//                   <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                   </svg>
//                 </div>
//                 <h3 className="text-lg font-medium text-slate-900 mb-2">
//                   {isConnected ? "No customers waiting" : "Connecting to server..."}
//                 </h3>
//                 <p className="text-slate-500">
//                   {isConnected ? "The waiting list is currently empty" : "Please wait while we connect to the queue service"}
//                 </p>
//                 {!isConnected && (
//                   <button
//                     onClick={handleReconnect}
//                     className="mt-4 px-4 py-2 bg-slate-600 text-white rounded-md text-sm hover:bg-slate-700"
//                   >
//                     Retry Connection
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Step 5: Pagination for overflow */}
//           <div className="mt-4 sm:mt-8">
//             <div className="md:hidden flex flex-col gap-4">
//               <div className="flex items-center justify-between">
//                 <button
//                   onClick={() => goToPage(currentPage - 1)}
//                   disabled={currentPage === 1}
//                   className={`px-4 py-2 rounded text-sm font-medium ${
//                     currentPage === 1
//                       ? "text-slate-300 cursor-not-allowed"
//                       : "text-slate-600 hover:bg-slate-100"
//                   }`}
//                 >
//                   ← Previous
//                 </button>
//                 <span className="text-sm text-slate-600">Page {currentPage} of {totalPages}</span>
//                 <button
//                   onClick={() => goToPage(currentPage + 1)}
//                   disabled={currentPage === totalPages}
//                   className={`px-4 py-2 rounded text-sm font-medium ${
//                     currentPage === totalPages
//                       ? "text-slate-300 cursor-not-allowed"
//                       : "text-slate-600 hover:bg-slate-100"
//                   }`}
//                 >
//                   Next →
//                 </button>
//               </div>
//               <div className="text-center text-sm text-slate-500">
//                 {rowsPerPage} rows per page | {columns.length} column{columns.length !== 1 ? 's' : ''}
//               </div>
//             </div>

//             <div className="hidden md:flex flex-col sm:flex-row items-center justify-between gap-4">
//               <div className="text-sm text-slate-600">
//                 Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, allRows.length)} of {allRows.length} entries
//                 <span className="ml-4 text-slate-500">
//                   ({rowsPerPage} per page | {columns.length} column{columns.length !== 1 ? 's' : ''})
//                 </span>
//               </div>

//               <div className="flex items-center gap-1">
//                 <button
//                   onClick={() => goToPage(currentPage - 1)}
//                   disabled={currentPage === 1}
//                   className={`px-3 py-1.5 rounded text-sm ${
//                     currentPage === 1
//                       ? "text-slate-300 cursor-not-allowed"
//                       : "text-slate-600 hover:bg-slate-100"
//                   }`}
//                 >
//                   &lt;
//                 </button>

//                 {getPageNumbers().map((page, index) => (
//                   typeof page === 'number' ? (
//                     <button
//                       key={index}
//                       onClick={() => goToPage(page)}
//                       className={`w-8 h-8 rounded text-sm ${
//                         currentPage === page
//                           ? "bg-slate-600 text-white"
//                           : "text-slate-600 hover:bg-slate-100"
//                       }`}
//                     >
//                       {page}
//                     </button>
//                   ) : (
//                     <span key={index} className="px-2 text-slate-400">{page}</span>
//                   )
//                 ))}

//                 <button
//                   onClick={() => goToPage(currentPage + 1)}
//                   disabled={currentPage === totalPages}
//                   className={`px-3 py-1.5 rounded text-sm ${
//                     currentPage === totalPages
//                       ? "text-slate-300 cursor-not-allowed"
//                       : "text-slate-600 hover:bg-slate-100"
//                   }`}
//                 >
//                   &gt;
//                 </button>
//               </div>

//               <div className="flex items-center gap-2 text-sm">
//                 <span className="text-slate-600">Go to:</span>
//                 <input
//                   type="number"
//                   min="1"
//                   max={totalPages}
//                   value={currentPage}
//                   onChange={(e) => {
//                     const page = Math.max(1, Math.min(totalPages, Number(e.target.value)));
//                     goToPage(page);
//                   }}
//                   className="w-16 border border-slate-300 rounded px-2 py-1 text-sm text-black"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// function RowItem({ row, colIndex }: { row: Row, colIndex: number }) {
//   return (
//     <div className={`flex items-center justify-between border-b border-slate-200 py-3 text-sm ${colIndex === 0 ? 'bg-slate-50/50' : ''}`}>
//       <div className="flex w-full items-center gap-4">
//         <div className="w-8 text-slate-700 flex items-center gap-1">
//           {row.id}.
//           {colIndex === 0 && (
//             <span className="text-xs text-blue-500" title="Left column">←</span>
//           )}
//           {colIndex === 1 && (
//             <span className="text-xs text-green-500" title="Right column">→</span>
//           )}
//         </div>
//         <div className="flex-1 font-medium text-slate-900">
//           {row.name}
//           {row.queueNumber && (
//             <span className="ml-2 text-xs text-slate-500">#{row.queueNumber}</span>
//           )}
//         </div>
//         <div className="w-20 text-right text-slate-700">{row.waitMins} min</div>
//       </div>
//       {row.status && (
//         <div className={`ml-2 px-2 py-1 text-xs rounded-full ${
//           row.status === 'served' ? 'bg-green-100 text-green-800' :
//           row.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
//           'bg-blue-100 text-blue-800'
//         }`}>
//           {row.status}
//         </div>
//       )}
//     </div>
//   );
// }

// app/page.tsx
"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

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
  waitMins: number;
  appointmentId: string;
  customerName: string;
  appointmentTime: string;
  barberName: string;
  startTime: string;
  status: string;
  queuePosition: number;
  minutesToAppointment: number;
};

type WebSocketMessage = {
  type: string;
  data: Appointment[];
  timestamp: string;
};

export default function Home() {
  const [allRows, setAllRows] = useState<Row[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isMobile, setIsMobile] = useState(false);
  const [screenHeight, setScreenHeight] = useState(0);
  const [screenWidth, setScreenWidth] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Get token and tenantId from storage
  const getAuthData = useCallback(() => {
    if (typeof window === 'undefined') return { token: null, tenantId: null };
    
    const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    const userDataStr = localStorage.getItem("user_data") || sessionStorage.getItem("user_data");
    let tenantId = null;
    
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        tenantId = userData.store?.tenantId || userData.user?.tenantId;
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
    
    return { token, tenantId };
  }, []);

  // Calculate minutes to appointment from current time
  const calculateMinutesToAppointment = useCallback((startTime: string): number => {
    if (!startTime) return 0;
    
    const appointmentTime = new Date(startTime).getTime();
    const now = new Date().getTime();
    const diffMinutes = Math.floor((appointmentTime - now) / (1000 * 60));
    
    return diffMinutes;
  }, []);

  // Calculate waiting time (how long until appointment)
  const calculateWaitTime = useCallback((startTime: string): number => {
    const minutesToAppointment = calculateMinutesToAppointment(startTime);
    
    // If appointment is in the past, show 0
    if (minutesToAppointment < 0) return 0;
    
    return minutesToAppointment;
  }, [calculateMinutesToAppointment]);

  // Format appointment data to rows
  const formatAppointmentsToRows = useCallback((appointments: Appointment[]): Row[] => {
    // Filter only BOOKED appointments and calculate wait times
    const bookedAppointments = appointments
      .filter(app => app.status === "BOOKED")
      .map((app, index) => {
        const minutesToAppointment = calculateMinutesToAppointment(app.startTime);
        const waitMins = calculateWaitTime(app.startTime);
        
        return {
          id: index + 1,
          name: app.customerName,
          waitMins,
          appointmentId: app.appointmentId,
          customerName: app.customerName,
          appointmentTime: app.appointmentTime,
          barberName: app.barberName,
          startTime: app.startTime,
          status: app.status,
          queuePosition: app.queuePosition,
          minutesToAppointment
        };
      });
    
    // Sort by minutes to appointment (closest first)
    return bookedAppointments.sort((a, b) => {
      // If both have future appointments
      if (a.minutesToAppointment >= 0 && b.minutesToAppointment >= 0) {
        return a.minutesToAppointment - b.minutesToAppointment;
      }
      // If one is in the past, put it last
      if (a.minutesToAppointment < 0) return 1;
      if (b.minutesToAppointment < 0) return -1;
      
      return a.queuePosition - b.queuePosition;
    })
    // Update IDs after sorting
    .map((row, index) => ({
      ...row,
      id: index + 1
    }));
  }, [calculateMinutesToAppointment, calculateWaitTime]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    console.log("WebSocket message received:", message);
    
    switch (message.type) {
      case 'INITIAL_DATA':
      case 'queue_update':
        // Update the entire queue
        if (Array.isArray(message.data)) {
          const formattedRows = formatAppointmentsToRows(message.data);
          setAllRows(formattedRows);
        }
        break;
        
      case 'new_customer':
        // Add new customer to queue
        if (message.data && Array.isArray(message.data)) {
          const newRows = formatAppointmentsToRows(message.data);
          setAllRows(prev => {
            // Merge and deduplicate by appointmentId
            const merged = [...prev];
            newRows.forEach(newRow => {
              const existingIndex = merged.findIndex(r => r.appointmentId === newRow.appointmentId);
              if (existingIndex >= 0) {
                merged[existingIndex] = newRow;
              } else {
                merged.push(newRow);
              }
            });
            return formatAppointmentsToRows(merged.map(row => ({
              appointmentId: row.appointmentId,
              customerName: row.name,
              appointmentTime: row.appointmentTime,
              barberName: row.barberName,
              startTime: row.startTime,
              status: row.status,
              queuePosition: row.queuePosition,
              // Add other required fields
              outletName: "",
              outletId: "",
              endTime: ""
            })));
          });
        }
        break;
        
      case 'customer_served':
      case 'appointment_completed':
        // Remove served customer from queue
        const servedAppointmentId = message.data?.[0]?.appointmentId;
        if (servedAppointmentId) {
          setAllRows(prev => prev.filter(row => row.appointmentId !== servedAppointmentId));
        }
        break;
        
      case 'heartbeat':
        // Update connection status
        setConnectionStatus("Connected");
        break;
        
      default:
        console.log("Unknown message type:", message.type);
    }
  }, [formatAppointmentsToRows]);

  // Initialize WebSocket connection
  const connectWebSocket = useCallback(() => {
    const { token, tenantId } = getAuthData();
    
    // Check if we have required data
    if (!token || !tenantId) {
      console.error("No token or tenantId found");
      router.push("/login");
      return () => {};
    }
    
    // Check token expiration
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const exp = payload.exp * 1000; // Convert to milliseconds
        if (Date.now() > exp) {
          console.error("Token expired");
          router.push("/login");
          return () => {};
        }
      }
    } catch (e) {
      console.error("Error parsing token:", e);
    }
    
    // Construct WebSocket URL
    const wsUrl = `wss://api.aaravpos.com/ws/queue?tenantId=${tenantId}&token=${token}`;
    
    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    // Create new WebSocket connection
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    const onOpen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      setConnectionStatus("Connected");
      
      // Send initial handshake or subscription message if needed
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
      console.error("WebSocket error:", error);
      setConnectionStatus("Error - Reconnecting...");
      setIsConnected(false);
    };
    
// Update the onClose function inside connectWebSocket to use a different approach
    const onClose = (event: CloseEvent) => {
      console.log("WebSocket disconnected:", event.code, event.reason);
      setIsConnected(false);
      setConnectionStatus("Disconnected - Reconnecting...");
      
      // Attempt to reconnect after 3 seconds
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log("Attempting to reconnect...");
        // Create a new WebSocket connection without calling connectWebSocket recursively
        const { token, tenantId } = getAuthData();
        
        if (!token || !tenantId) {
          console.error("No token or tenantId found during reconnect");
          router.push("/login");
          return;
        }
        
        // Construct WebSocket URL
        const wsUrl = `wss://api.aaravpos.com/ws/queue?tenantId=${tenantId}&token=${token}`;
        
        // Close existing connection if any
        if (wsRef.current) {
          wsRef.current.close();
        }
        
        // Create new WebSocket connection
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        
        // Re-attach the same event handlers
        ws.onopen = onOpen;
        ws.onmessage = onMessage;
        ws.onerror = onError;
        ws.onclose = onClose;
        
      }, 3000);
    };
    
    ws.onopen = onOpen;
    ws.onmessage = onMessage;
    ws.onerror = onError;
    ws.onclose = onClose;
    
    // Return cleanup function
    return () => {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
      
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [getAuthData, router, handleWebSocketMessage]);

  // Update waiting times every minute
  useEffect(() => {
    const updateWaitTimes = () => {
      setAllRows(prev => 
        prev.map(row => ({
          ...row,
          waitMins: calculateWaitTime(row.startTime),
          minutesToAppointment: calculateMinutesToAppointment(row.startTime)
        }))
        .sort((a, b) => {
          if (a.minutesToAppointment >= 0 && b.minutesToAppointment >= 0) {
            return a.minutesToAppointment - b.minutesToAppointment;
          }
          if (a.minutesToAppointment < 0) return 1;
          if (b.minutesToAppointment < 0) return -1;
          return a.queuePosition - b.queuePosition;
        })
        .map((row, index) => ({
          ...row,
          id: index + 1
        }))
      );
    };

    // Update immediately
    updateWaitTimes();
    
    // Update every minute
    const interval = setInterval(updateWaitTimes, 60000);
    
    return () => clearInterval(interval);
  }, [calculateWaitTime, calculateMinutesToAppointment]);

  // Step 1: Confirm screen size
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setScreenWidth(width);
      setScreenHeight(height);
      setIsMobile(width < 768);
      
      // Step 2: Calculate rows per page based on screen height
      const headerHeight = 80;
      const paginationHeight = 80;
      const margins = 40;
      const availableHeight = height - headerHeight - paginationHeight - margins;
      const rowHeight = 50;
      const maxRowsPerColumn = Math.floor(availableHeight / rowHeight);
      
      // For two columns, calculate total rows
      let calculatedRowsPerPage;
      if (width < 768) {
        // Single column on mobile
        calculatedRowsPerPage = Math.max(6, Math.min(maxRowsPerColumn, 12));
      } else if (width < 1024) {
        // Two columns on tablet
        calculatedRowsPerPage = Math.max(8, Math.min(maxRowsPerColumn * 2, 20));
      } else {
        // Two columns on desktop
        calculatedRowsPerPage = Math.max(10, Math.min(maxRowsPerColumn * 2, 24));
      }
      
      setRowsPerPage(calculatedRowsPerPage);
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // Initialize WebSocket on component mount
  useEffect(() => {
    // Check auth first
    const { token, tenantId } = getAuthData();
    if (!token || !tenantId) {
      router.push("/login");
      return;
    }
    
    // Connect to WebSocket
    const cleanup = connectWebSocket();
    
    // Cleanup on unmount
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

  // Step 3 & 4: Split rows into columns - fill left first, then right
  const getColumns = () => {
    if (isMobile) {
      // Single column for mobile
      return [currentRows];
    }
    
    // Calculate how many rows can fit in one column based on screen height
    const headerHeight = 80;
    const paginationHeight = 80;
    const margins = 40;
    const availableHeight = screenHeight - headerHeight - paginationHeight - margins;
    const rowHeight = 50;
    const maxRowsPerColumn = Math.floor(availableHeight / rowHeight);
    
    // If total rows can fit in single column, use single column
    if (currentRows.length <= maxRowsPerColumn) {
      return [currentRows];
    }
    
    // Split into two columns: fill left column first completely
    const leftColumnRows = Math.min(currentRows.length, maxRowsPerColumn);
    const rightColumnRows = currentRows.length - leftColumnRows;
    
    // Create columns
    const leftColumn = currentRows.slice(0, leftColumnRows);
    const rightColumn = rightColumnRows > 0 ? 
      currentRows.slice(leftColumnRows, leftColumnRows + Math.min(rightColumnRows, maxRowsPerColumn)) : 
      [];
    
    return [leftColumn, rightColumn];
  };

  const totalPages = Math.ceil(allRows.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = allRows.slice(indexOfFirstRow, indexOfLastRow);
  const columns = getColumns();

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = isMobile ? 3 : 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 3) {
        end = maxVisiblePages - 1;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - maxVisiblePages + 2;
      }
      
      if (start > 2) pageNumbers.push('...');
      for (let i = start; i <= end; i++) pageNumbers.push(i);
      if (end < totalPages - 1) pageNumbers.push('...');
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  // Manual reconnect function
  const handleReconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
    connectWebSocket();
  };

  // Format time display
  const formatTimeDisplay = (minutes: number): string => {
    if (minutes < 0) return "Passed";
    if (minutes === 0) return "Now";
    if (minutes < 60) return `${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) return `${hours} hr`;
    return `${hours} hr ${remainingMinutes} min`;
  };

  // Get status color
  const getStatusColor = (minutesToAppointment: number, status: string) => {
    if (status !== "BOOKED") return "bg-gray-100 text-gray-800";
    if (minutesToAppointment < 0) return "bg-red-100 text-red-800";
    if (minutesToAppointment <= 15) return "bg-yellow-100 text-yellow-800";
    if (minutesToAppointment <= 60) return "bg-blue-100 text-blue-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="min-h-screen bg-white" ref={containerRef}>
      <header className="flex items-center justify-between px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2">
          <Image
            src="/logo/AaravPOS-Logo.png"
            alt="AaravPOS"
            width={120}
            height={32}
            className="w-24 sm:w-32 md:w-40"
            priority
          />
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2 ml-4">
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
        </div>
        <div className="hidden sm:block text-sm text-slate-600">
          Showing {indexOfFirstRow + 1}-{Math.min(indexOfLastRow, allRows.length)} of {allRows.length}
          {!isConnected && (
            <span className="ml-2 text-xs text-red-500">(Offline)</span>
          )}
        </div>
      </header>

      <main className="px-4 sm:px-6 pb-6">
        <div className="mx-auto w-full max-w-6xl bg-white">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Appointment Queue</h1>
              <p className="text-sm text-slate-600">
                Current time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600">
                {allRows.filter(row => row.minutesToAppointment >= 0).length} upcoming appointments
              </div>
              <button
                onClick={handleReconnect}
                className="text-sm px-3 py-1 bg-slate-100 rounded hover:bg-slate-200"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="min-h-[60vh]">
            {/* Step 3 & 4: Display columns with left filling first */}
            <div className={`grid gap-0 ${columns.length > 1 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
              {columns.map((column, colIndex) => (
                <div 
                  key={colIndex} 
                  className="relative mx-2"
                  style={{ 
                    minHeight: columns.length > 1 ? `${Math.min(column.length, Math.floor((screenHeight - 200) / 50)) * 50}px` : 'auto'
                  }}
                >
                  <div className="px-4 sm:px-6 py-2">
                    {column.length === 0 ? (
                      <div className="flex items-center justify-center h-32 text-slate-400">
                        {isConnected ? "No appointments" : "Connecting..."}
                      </div>
                    ) : (
                      column.map((r) => (
                        <RowItem 
                          key={`${r.id}-${r.appointmentId}`} 
                          row={r} 
                          colIndex={colIndex}
                          formatTimeDisplay={formatTimeDisplay}
                          getStatusColor={getStatusColor}
                        />
                      ))
                    )}
                  </div>
                  
                  {/* Visual separator between columns */}
                  {colIndex === 0 && columns.length > 1 && (
                    <div className="hidden md:block absolute right-0 top-0 bottom-0 w-px bg-slate-300" />
                  )}
                </div>
              ))}
            </div>
            
            {/* Empty state */}
            {currentRows.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="text-slate-400 mb-4">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  {isConnected ? "No appointments scheduled" : "Connecting to server..."}
                </h3>
                <p className="text-slate-500">
                  {isConnected ? "There are no upcoming appointments" : "Please wait while we connect to the appointment service"}
                </p>
                {!isConnected && (
                  <button
                    onClick={handleReconnect}
                    className="mt-4 px-4 py-2 bg-slate-600 text-white rounded-md text-sm hover:bg-slate-700"
                  >
                    Retry Connection
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Step 5: Pagination for overflow */}
          {allRows.length > 0 && (
            <div className="mt-4 sm:mt-8">
              <div className="md:hidden flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded text-sm font-medium ${
                      currentPage === 1
                        ? "text-slate-300 cursor-not-allowed"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    ← Previous
                  </button>
                  <span className="text-sm text-slate-600">Page {currentPage} of {totalPages}</span>
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded text-sm font-medium ${
                      currentPage === totalPages
                        ? "text-slate-300 cursor-not-allowed"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Next →
                  </button>
                </div>
                <div className="text-center text-sm text-slate-500">
                  {rowsPerPage} rows per page | {columns.length} column{columns.length !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="hidden md:flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-600">
                  Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, allRows.length)} of {allRows.length} appointments
                  <span className="ml-4 text-slate-500">
                    ({rowsPerPage} per page | {columns.length} column{columns.length !== 1 ? 's' : ''})
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 rounded text-sm ${
                      currentPage === 1
                        ? "text-slate-300 cursor-not-allowed"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    &lt;
                  </button>

                  {getPageNumbers().map((page, index) => (
                    typeof page === 'number' ? (
                      <button
                        key={index}
                        onClick={() => goToPage(page)}
                        className={`w-8 h-8 rounded text-sm ${
                          currentPage === page
                            ? "bg-slate-600 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {page}
                      </button>
                    ) : (
                      <span key={index} className="px-2 text-slate-400">{page}</span>
                    )
                  ))}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 rounded text-sm ${
                      currentPage === totalPages
                        ? "text-slate-300 cursor-not-allowed"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    &gt;
                  </button>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-600">Go to:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const page = Math.max(1, Math.min(totalPages, Number(e.target.value)));
                      goToPage(page);
                    }}
                    className="w-16 border border-slate-300 rounded px-2 py-1 text-sm text-black"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

interface RowItemProps {
  row: Row;
  colIndex: number;
  formatTimeDisplay: (minutes: number) => string;
  getStatusColor: (minutesToAppointment: number, status: string) => string;
}

function RowItem({ row, colIndex, formatTimeDisplay, getStatusColor }: RowItemProps) {
  const timeDisplay = formatTimeDisplay(row.minutesToAppointment);
  
  return (
    <div className={`flex items-center justify-between border-b border-slate-200 py-3 text-sm ${colIndex === 0 ? 'bg-slate-50/50' : ''}`}>
      <div className="flex w-full items-center gap-4">
        <div className="w-8 text-slate-700 flex items-center gap-1">
          {row.id}.
          {colIndex === 0 && (
            <span className="text-xs text-blue-500" title="Left column">←</span>
          )}
          {colIndex === 1 && (
            <span className="text-xs text-green-500" title="Right column">→</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-slate-900 truncate">{row.name}</div>
          <div className="text-xs text-slate-500 truncate">
            {row.barberName} • {row.appointmentTime}
          </div>
        </div>
        <div className="w-24 text-right">
          <div className="font-medium text-slate-700">{timeDisplay}</div>
          <div className="text-xs text-slate-500">to go</div>
        </div>
      </div>
      <div className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(row.minutesToAppointment, row.status)}`}>
        {row.status}
      </div>
    </div>
  );
}