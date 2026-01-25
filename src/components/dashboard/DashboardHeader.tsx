"use client";

import Image from "next/image";
import LogoutButton from "@/components/LogoutButton";

interface DashboardHeaderProps {
  isConnected: boolean;
  connectionStatus: string;
  currentTime: string;
  currentOutletId: string | null;
  appointmentCount: number;
  onReconnect: () => void;
  
}

export default function DashboardHeader({
  isConnected,
  connectionStatus,
  currentTime,
  currentOutletId,
  appointmentCount,
  onReconnect
}: DashboardHeaderProps) {
  return (
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
                onClick={onReconnect}
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
          {appointmentCount} appointments
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}