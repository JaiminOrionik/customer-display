"use client";

import Image from "next/image";
import LogoutButton from "@/components/LogoutButton";
import logo from "../../assets/logo/AaravPOS-Logo_SVG 1.svg";

type DisplayMode = "QUEUE" | "BILLING";

interface DashboardHeaderProps {
  isConnected: boolean;
  connectionStatus: string;
  currentTime: string;
  currentOutletId: string | null;
  appointmentCount: number;
  onReconnect: () => void;

  displayMode: DisplayMode;
  onChangeDisplay: (mode: DisplayMode) => void | Promise<void>;
  isUpdatingStatus: boolean;
  isActive: boolean;
}

export default function DashboardHeader({
  isConnected,
  connectionStatus,
  currentTime,
  currentOutletId,
  appointmentCount,
  onReconnect,

  displayMode,
  onChangeDisplay,
  isUpdatingStatus,
  isActive,
}: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200 bg-white sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <Image
          src={logo}
          alt="AaravPOS"
          width={120}
          height={32}
          className="w-24 sm:w-32 md:w-40"
          priority
        />
        <div className="flex flex-col ml-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-xs text-slate-600">{connectionStatus}</span>
            {!isConnected && (
              <button
                onClick={onReconnect}
                className="text-xs px-2 py-1 text-rose-600 bg-slate-100 rounded hover:bg-slate-200"
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
          {appointmentCount} appointments
        </div>

        {/* toggle buttons - calls existing handler, same business logic */}
        {/* <div className="flex items-center gap-2">
          <button
            disabled={isUpdatingStatus}
            onClick={() => onChangeDisplay("QUEUE")}
            className={`text-xs px-3 py-2 rounded border ${
              displayMode === "QUEUE"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-200"
            } ${isUpdatingStatus ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            Queue
          </button>
          <button
            disabled={isUpdatingStatus}
            onClick={() => onChangeDisplay("BILLING")}
            className={`text-xs px-3 py-2 rounded border ${
              displayMode === "BILLING"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-200"
            } ${isUpdatingStatus ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            Billing
          </button>
        </div> */}

        <LogoutButton />
      </div>
    </header>
  );
}
