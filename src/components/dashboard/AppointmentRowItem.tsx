"use client";

import { useState, useEffect } from "react";
import { 
  extractStartTime, 
  parseTimeString,
  calculateMinutesDifference,
  formatTimeDisplay 
} from "@/utils/appointmentUtils";
import type { Row } from "@/types/appointment";

interface AppointmentRowItemProps {
  row: Row;
  colIndex: number;
}

export default function AppointmentRowItem({ row, colIndex }: AppointmentRowItemProps) {
  const [timeDisplay, setTimeDisplay] = useState<string>("");

  const calculateCurrentMinutes = () => {
    const startTimeStr = extractStartTime(row.appointmentTime);
    if (!startTimeStr) return 0;
    
    const parsedTime = parseTimeString(startTimeStr);
    if (!parsedTime) return 0;
    
    return calculateMinutesDifference(parsedTime);
  };

  useEffect(() => {
    const updateDisplay = () => {
      const minutes = calculateCurrentMinutes();
      setTimeDisplay(formatTimeDisplay(minutes, row.status));
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
        
        <div className="flex-1 min-w-0">
          <div className="font-medium text-slate-900 truncate">
            {row.name}
          </div>
        </div>
        
        <div className="w-20 text-right">
          <div className="font-medium text-slate-700">
            {timeDisplay}
          </div>
        </div>
      </div>
    </div>
  );
}