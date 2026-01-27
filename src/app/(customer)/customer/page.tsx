"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AppointmentQueue from "@/components/dashboard/AppointmentQueue";
import BillingDisplay from "@/components/display/BillingDisplay";

import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { formatAppointmentsToRows } from "@/utils/appointmentUtils";
import type { Row } from "@/types/appointment";

import { db } from "@/app/firestore";
import { 
  setBillingStatus, 
  setQueueStatus,
  shouldShowBilling 
} from "../../status";

type DisplayMode = "QUEUE" | "BILLING";

export default function Home() {
  const [allRows, setAllRows] = useState<Row[]>([]);
  const [todaysRows, setTodaysRows] = useState<Row[]>([]); // Add this state
  const [isMobile, setIsMobile] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("QUEUE");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isActive, setIsActive] = useState<boolean>(false);

  const router = useRouter();
  const { token, tenantId, outletId } = useAuth();

  const { isConnected, connectionStatus, webSocketData, handleReconnect } =
    useWebSocket({ token, tenantId });

  // Function to filter today's appointments
  const filterTodaysAppointments = useCallback((appointments: any[]) => {
    if (!Array.isArray(appointments)) return [];
    
    const today = new Date();
    const todayDateStr = today.toISOString().split('T')[0]; // Get YYYY-MM-DD format
    
    return appointments.filter(appointment => {
      // Check if startTime exists and is for today
      if (!appointment.startTime) return false;
      
      const appointmentDate = new Date(appointment.startTime);
      const appointmentDateStr = appointmentDate.toISOString().split('T')[0];
      
      return appointmentDateStr === todayDateStr;
    });
  }, []);

  /* ---------------- Listen to Firestore 'active' field changes ---------------- */
  useEffect(() => {
    if (!tenantId || !outletId) {
      console.log("No tenantId or outletId available");
      return;
    }

    console.log(`Setting up Firestore listener for: ${tenantId}/${outletId}`);
    
    const docRef = doc(db, tenantId, outletId);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const activeStatus = data.active || false;
        console.log("Firestore active status updated:", activeStatus);
        setIsActive(activeStatus);
        
        // Automatically switch display mode based on 'active' field
        if (shouldShowBilling(activeStatus)) {
          setDisplayMode("BILLING");
        } else {
          setDisplayMode("QUEUE");
        }
        
        // Debug log the full data structure
        console.log("Full Firestore data:", {
          active: data.active,
          customer: data.customer,
          items: data.items,
          totals: data.totals,
          summary: data.summary,
          status: data.status
        });
      } else {
        console.log("Document doesn't exist, defaulting to QUEUE mode");
        setIsActive(false);
        setDisplayMode("QUEUE");
      }
    }, (error) => {
      console.error("Error in Firestore listener:", error);
    });

    return () => {
      console.log("Cleaning up Firestore listener");
      unsubscribe();
    };
  }, [tenantId, outletId]);

  /* ---------------- handle display mode change ---------------- */
  const handleDisplayModeChange = useCallback(async (mode: DisplayMode) => {
    if (!tenantId || !outletId) {
      alert("Authentication required. Please login again.");
      return;
    }
    
    try {
      setIsUpdatingStatus(true);
      console.log(`Changing display mode to: ${mode} for ${outletId}`);
      
      // Update Firestore 'active' field based on display mode
      if (mode === "BILLING") {
        await setBillingStatus(tenantId, outletId);
      } else {
        await setQueueStatus(tenantId, outletId);
      }
      
    } catch (error) {
      console.error("Failed to update active status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [tenantId, outletId]);

  /* ---------------- websocket data ---------------- */
  useEffect(() => {
    if (Array.isArray(webSocketData)) {
      // First filter only today's appointments
      const todaysAppointments = filterTodaysAppointments(webSocketData);
      
      // Then format only today's appointments
      const formattedRows = formatAppointmentsToRows(todaysAppointments, outletId);
      
      // Store all rows and today's rows separately
      const allFormattedRows = formatAppointmentsToRows(webSocketData, outletId);
      setAllRows(allFormattedRows);
      setTodaysRows(formattedRows);
      
      // Debug logging
      console.log("Today's appointments count:", todaysAppointments.length);
      console.log("Total appointments count:", webSocketData.length);
    }
  }, [webSocketData, outletId, filterTodaysAppointments]);

  /* ---------------- screen size ---------------- */
  useEffect(() => {
    const updateScreenSize = () => setIsMobile(window.innerWidth < 768);
    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);
    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  /* ---------------- clock ---------------- */
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };

    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  /* ---------------- auth guard ---------------- */
  useEffect(() => {
    if (!token || !tenantId || !outletId) {
      console.log("No auth data, redirecting to login");
      router.push("/");
    }
  }, [token, tenantId, outletId, router]);

  /* ---------------- column split ---------------- */
  const getColumns = useCallback(() => {
    // Use todaysRows instead of allRows
    const rowsToDisplay = todaysRows.length > 0 ? todaysRows : allRows;
    
    if (isMobile || rowsToDisplay.length <= 8) return [rowsToDisplay];
    const mid = Math.ceil(rowsToDisplay.length / 2);
    return [rowsToDisplay.slice(0, mid), rowsToDisplay.slice(mid)];
  }, [todaysRows, allRows, isMobile]);

  const columns = getColumns();

  /* ---------------- Show loading while checking auth ---------------- */
  if (!token || !tenantId || !outletId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading authentication...</div>
      </div>
    );
  }

  /* ---------------- render ---------------- */
  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        isConnected={isConnected}
        connectionStatus={connectionStatus}
        currentTime={currentTime}
        currentOutletId={outletId}
        // Show today's appointment count
        appointmentCount={todaysRows.length}
        onReconnect={handleReconnect}
        displayMode={displayMode}
        onChangeDisplay={handleDisplayModeChange}
        isUpdatingStatus={isUpdatingStatus}
        isActive={isActive}
      />

      <main className="px-4 sm:px-6 py-6">
        <div className="mx-auto w-full max-w-auto bg-white">
          {/* Show QUEUE when active is false */}
          {displayMode === "QUEUE" && (
            <div
              className="overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 180px)", minHeight: 300 }}
            >
              <AppointmentQueue columns={columns} />
            </div>
          )}

          {/* Show BILLING when active is true */}
          {displayMode === "BILLING" && (
            <BillingDisplay />
          )}

          {/* Debug info - remove in production */}
          {/* <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50">
            <div>Active: <span className={`font-bold ${isActive ? 'text-green-400' : 'text-red-400'}`}>
              {isActive ? 'TRUE (BILLING)' : 'FALSE (QUEUE)'}
            </span></div>
            <div>Today's Appointments: {todaysRows.length}</div>
            <div>Total Appointments: {allRows.length}</div>
            <div>Mode: {displayMode}</div>
            {isUpdatingStatus && <div className="text-yellow-300">Updating...</div>}
          </div> */}
        </div>
      </main>
    </div>
  );
}