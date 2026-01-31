"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import { setBillingStatus, setQueueStatus, shouldShowBilling } from "../../status";
import ConsentPage from "@/components/consent/page";

type DisplayMode = "QUEUE" | "BILLING" | "CONSENT";

export default function Home() {
  const [allRows, setAllRows] = useState<Row[]>([]);
  const [todaysRows, setTodaysRows] = useState<Row[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("QUEUE");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isActive, setIsActive] = useState<boolean>(false);

  const [hasPendingConsent, setHasPendingConsent] = useState(false);

  const router = useRouter();
  const { token, tenantId, outletId } = useAuth();

  const { isConnected, connectionStatus, webSocketData, handleReconnect } =
    useWebSocket({ token, tenantId });

  const consentChannelId = useMemo(() => {
    if (!tenantId || !outletId) return "";
    return `${tenantId}_${outletId}_any`;
  }, [tenantId, outletId]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filterTodaysAppointments = useCallback((appointments: any[]) => {
    if (!Array.isArray(appointments)) return [];
    const today = new Date();
    const todayDateStr = today.toISOString().split("T")[0];
    return appointments.filter((appointment) => {
      if (!appointment.startTime) return false;
      const appointmentDate = new Date(appointment.startTime);
      const appointmentDateStr = appointmentDate.toISOString().split("T")[0];
      return appointmentDateStr === todayDateStr;
    });
  }, []);

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

  /* ---------------- Listen to CONSENT request ---------------- */
  useEffect(() => {
    if (!consentChannelId) return;

    const ref = doc(db, "pos_consent_requests", consentChannelId);

    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setHasPendingConsent(false);
          return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = snap.data();
        const pending = data?.status === "PENDING";
        setHasPendingConsent(pending);

        console.log("[CONSENT] request:", { consentChannelId, pending, data });
      },
      (err) => {
        console.error("[CONSENT] listen failed:", err);
        setHasPendingConsent(false);
      },
    );

    return () => unsub();
  }, [consentChannelId]);

  /* ---------------- FINAL displayMode decision (priority) ---------------- */
  useEffect(() => {
    if (hasPendingConsent) {
      setDisplayMode("CONSENT");
      return;
    }

    // otherwise follow billing rule
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

  /* ---------------- websocket data ---------------- */
  useEffect(() => {
    if (Array.isArray(webSocketData)) {
      const todaysAppointments = filterTodaysAppointments(webSocketData);
      const formattedRows = formatAppointmentsToRows(todaysAppointments, outletId);
      const allFormattedRows = formatAppointmentsToRows(webSocketData, outletId);

      setAllRows(allFormattedRows);
      setTodaysRows(formattedRows);
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
    const rowsToDisplay = todaysRows.length > 0 ? todaysRows : allRows;
    if (isMobile || rowsToDisplay.length <= 8) return [rowsToDisplay];
    const mid = Math.ceil(rowsToDisplay.length / 2);
    return [rowsToDisplay.slice(0, mid), rowsToDisplay.slice(mid)];
  }, [todaysRows, allRows, isMobile]);

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
          {displayMode === "CONSENT" && <ConsentPage />}

          {displayMode === "QUEUE" && (
            <div
              className="overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 180px)", minHeight: 300 }}
            >
              <AppointmentQueue columns={columns} />
            </div>
          )}

          {displayMode === "BILLING" && <BillingDisplay />}
        </div>
      </main>
    </div>
  );
}
