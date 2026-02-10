"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AppointmentQueue from "@/components/dashboard/AppointmentQueue";
import BillingDisplay from "@/components/display/BillingDisplay";
import ConsentPage from "@/components/consent/page";

import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket"; // Keep WebSocket for real-time
import { formatAppointmentsToRows } from "@/utils/appointmentUtils";
import type { Row, Appointment } from "@/types/appointment";
import ConsentHistoryStatic from "@/components/consent/history/ConsentHistoryStatic";

import { db } from "@/app/firestore";
import {
  setBillingStatus,
  setQueueStatus,
  shouldShowBilling,
} from "../../status";

type DisplayMode = "QUEUE" | "BILLING" | "CONSENT" | "CONSENT_HISTORY";

function makeConsentChannelId(
  tenantId: string,
  outletId: string,
  staffId: string = "any",
) {
  return `${tenantId}_${outletId}_${staffId}`;
}

// API base URL
const API_BASE_URL = "https://prod.aaravpos.com/api/v1";

export default function Home() {
  const [allRows, setAllRows] = useState<Row[]>([]);
  const [todaysRows, setTodaysRows] = useState<Row[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("QUEUE");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPendingConsent, setHasPendingConsent] = useState(false);
  const [activeConsentChannelId, setActiveConsentChannelId] =
    useState<string>("");

  const router = useRouter();
  const { token, tenantId, outletId } = useAuth();

  // WebSocket for real-time updates
  const { isConnected, connectionStatus, webSocketData, handleReconnect } =
    useWebSocket({ token, tenantId });

  // Function to fetch appointments from API
  const fetchAppointments = useCallback(async () => {
    if (!token || !outletId) {
      console.error("Missing token or outletId");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/appointment/today/outlet/${outletId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch appointments: ${response.status}`);
      }

      const data = await response.json();
      
      // Filter to show only active appointments in queue
      // Active statuses: BOOKED, CHECKED_IN, CONFIRMED, ARRIVED
      // Don't show: COMPLETED, CANCELLED, NO_SHOW, IN_PROGRESS
      const activeAppointments = data.filter((item: any) => {
        const activeStatuses = ['BOOKED', 'CHECKED_IN', 'CONFIRMED', 'ARRIVED'];
        const inactiveStatuses = ['COMPLETED', 'CANCELLED', 'NO_SHOW', 'IN_PROGRESS'];
        
        // Show only active appointments
        return activeStatuses.includes(item.status);
      });
      
      // Transform API response to match Appointment type
      const appointments: Appointment[] = activeAppointments.map((item: any) => ({
        appointmentId: item.id,
        customerName: `${item.customer.first_name} ${item.customer.last_name}`,
        appointmentTime: item.startLocal, // Using startLocal for local time display
        status: item.status,
        outletId: item.outletId,
        isWalkIn: item.isWalkIn,
        queuePosition: item.queuePosition,
        staffName: `${item.staff.firstName} ${item.staff.lastName}`,
        services: item.services?.map((service: any) => service.service?.name).join(", ") || "",
        paymentStatus: item.paymentStatus,
        // Add these for sorting/filtering
        startUtc: item.startUtc,
        endUtc: item.endUtc,
      }));

      // Format appointments to rows
      const formattedRows = formatAppointmentsToRows(appointments, outletId);
      
      setTodaysRows(formattedRows);
      
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err instanceof Error ? err.message : "Failed to load appointments");
      setTodaysRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, outletId]);

  // Initial fetch on mount
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Function to merge WebSocket updates with API data
// In your main page component
// Update the mergeWebSocketUpdates function:

const mergeWebSocketUpdates = useCallback((wsAppointments: Appointment[]) => {
  if (!Array.isArray(wsAppointments)) return;

  // Filter for today and active statuses
  const today = new Date().toISOString().split('T')[0];
  const activeStatuses = ['BOOKED', 'CHECKED_IN', 'CONFIRMED', 'ARRIVED'];
  
  const filteredAppointments = wsAppointments.filter((item: Appointment) => {
    if (!item.startUtc) return false;
    
    // Check if it's today's appointment
    const appointmentDate = new Date(item.startUtc);
    const appointmentDateStr = appointmentDate.toISOString().split('T')[0];
    
    // Check if it's active status
    const isActive = activeStatuses.includes(item.status);
    
    return appointmentDateStr === today && isActive;
  });

  // Format appointments to rows
  const wsRows = formatAppointmentsToRows(filteredAppointments, outletId);
  
  // Update state with WebSocket data
  setTodaysRows(wsRows);
}, [outletId]);

// Update the useEffect that handles WebSocket data:
useEffect(() => {
  if (webSocketData && isConnected) {
    console.log("Processing WebSocket data:", webSocketData.length, "appointments");
    mergeWebSocketUpdates(webSocketData);
  }
}, [webSocketData, isConnected, mergeWebSocketUpdates]);

  // Handle WebSocket data updates
  useEffect(() => {
    if (webSocketData && isConnected) {
      mergeWebSocketUpdates(webSocketData);
    }
  }, [webSocketData, isConnected, mergeWebSocketUpdates]);

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const consentChannelIds = useMemo(() => {
    const ids = new Set<string>();

    const tokenTenant = tenantId || "";
    const tokenOutlet = outletId || "";

    const lsTenant =
      typeof window !== "undefined"
        ? localStorage.getItem("tenantId") || ""
        : "";
    const lsOutlet =
      typeof window !== "undefined"
        ? localStorage.getItem("outletId") || ""
        : "";

    if (tokenTenant && tokenOutlet) {
      ids.add(makeConsentChannelId(tokenTenant, tokenOutlet, "any"));
    }

    if (lsTenant && lsOutlet) {
      ids.add(makeConsentChannelId(lsTenant, lsOutlet, "any"));
    }

    if (tokenTenant && lsOutlet) {
      ids.add(makeConsentChannelId(tokenTenant, lsOutlet, "any"));
    }

    if (lsTenant && tokenOutlet) {
      ids.add(makeConsentChannelId(lsTenant, tokenOutlet, "any"));
    }

    return Array.from(ids).filter(Boolean);
  }, [tenantId, outletId]);

  /* ---------------- Listen to BILLING doc 'active' field ---------------- */
  useEffect(() => {
    if (!tenantId || !outletId) return;

    const docRef = doc(db, tenantId, outletId);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const activeStatus = data.active || false;
          setIsActive(activeStatus);
        } else {
          setIsActive(false);
        }
      },
      (error) => console.error("Error in Firestore listener:", error),
    );

    return () => unsubscribe();
  }, [tenantId, outletId]);

  /* ---------------- Listen to CONSENT requests (multi-channel) ---------------- */
  useEffect(() => {
    if (!consentChannelIds.length) return;

    const markIdleIfCurrentClears = (cid: string, snapData: any) => {
      const isPending = snapData?.status === "PENDING";
      if (!isPending) {
        setActiveConsentChannelId((prev) => (prev === cid ? "" : prev));
      }
    };

    const unsubs = consentChannelIds.map((cid) => {
      const ref = doc(db, "pos_consent_requests", cid);

      return onSnapshot(
        ref,
        (snap) => {
          if (!snap.exists()) {
            markIdleIfCurrentClears(cid, null);
            return;
          }

          const data: any = snap.data();
          const pending = data?.status === "PENDING";

          if (pending) {
            setHasPendingConsent(true);
            setActiveConsentChannelId(cid);
          } else {
            markIdleIfCurrentClears(cid, data);
          }
        },
        (err) => console.error("[CONSENT] listen failed:", cid, err),
      );
    });

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [consentChannelIds]);

  useEffect(() => {
    setHasPendingConsent(Boolean(activeConsentChannelId));
  }, [activeConsentChannelId]);

  /* ---------------- FINAL displayMode decision (priority) ---------------- */
  useEffect(() => {
    if (hasPendingConsent) {
      setDisplayMode("CONSENT");
      return;
    }
    if (shouldShowBilling(isActive)) setDisplayMode("BILLING");
    else setDisplayMode("QUEUE");
  }, [hasPendingConsent, isActive]);

  /* ---------------- handle display mode change ---------------- */
  const handleDisplayModeChange = useCallback(
    async (mode: DisplayMode) => {
      if (!tenantId || !outletId) {
        alert("Authentication required. Please login again.");
        return;
      }

      try {
        setIsUpdatingStatus(true);
        if (mode === "BILLING") await setBillingStatus(tenantId, outletId);
        if (mode === "QUEUE") await setQueueStatus(tenantId, outletId);
      } catch (error) {
        console.error("Failed to update active status:", error);
        alert("Failed to update status. Please try again.");
      } finally {
        setIsUpdatingStatus(false);
      }
    },
    [tenantId, outletId],
  );

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
        }),
      );
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  /* ---------------- auth guard ---------------- */
  useEffect(() => {
    if (!token || !tenantId || !outletId) router.push("/");
  }, [token, tenantId, outletId, router]);

  /* ---------------- column split ---------------- */
  const getColumns = useCallback(() => {
    const rowsToDisplay = todaysRows;
    if (isMobile || rowsToDisplay.length <= 8) return [rowsToDisplay];
    const mid = Math.ceil(rowsToDisplay.length / 2);
    return [rowsToDisplay.slice(0, mid), rowsToDisplay.slice(mid)];
  }, [todaysRows, isMobile]);

  const columns = getColumns();

  if (!token || !tenantId || !outletId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading authentication...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        isConnected={isConnected}
        connectionStatus={connectionStatus}
        currentTime={currentTime}
        currentOutletId={outletId}
        appointmentCount={todaysRows.length}
        onReconnect={handleReconnect}
        displayMode={displayMode}
        onChangeDisplay={handleDisplayModeChange}
        isUpdatingStatus={isUpdatingStatus}
        isActive={isActive}
      />

      <main className="px-4 sm:px-6 py-6">
        <div className="mx-auto w-full max-w-auto bg-white">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-600">Loading appointments...</div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-red-600 mb-4">Error: {error}</div>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          ) : displayMode === "CONSENT" ? (
            <ConsentPage channelIdOverride={activeConsentChannelId} />
          ) : displayMode === "QUEUE" ? (
            <div
              className="overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 180px)", minHeight: 300 }}
            >
              <AppointmentQueue columns={columns} />
            </div>
          ) : displayMode === "BILLING" ? (
            <BillingDisplay />
          ) : (
            <ConsentHistoryStatic />
          )}
        </div>
      </main>
    </div>
  );
}