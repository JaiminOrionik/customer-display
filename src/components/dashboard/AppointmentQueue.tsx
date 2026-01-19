"use client";

import AppointmentRowItem from "@/components/dashboard/AppointmentRowItem";
import type { Row } from "@/types/appointment";

interface AppointmentQueueProps {
  columns: Row[][];
}

export default function AppointmentQueue({ columns }: AppointmentQueueProps) {
  return (
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
                <AppointmentRowItem 
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
  );
}