import type { Appointment, Row } from "@/types/appointment";

// Helper functions
export const extractStartTime = (appointmentTime: string): string => {
  const match = appointmentTime.match(/^(\d{1,2}):(\d{2})/);
  return match ? match[0] : "";
};

export const parseTimeString = (timeStr: string): { hours: number; minutes: number } | null => {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  
  return { hours, minutes };
};

export const calculateMinutesDifference = (parsedTime: { hours: number; minutes: number }): number => {
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTotalMinutes = currentHours * 60 + currentMinutes;
  const appointmentTotalMinutes = parsedTime.hours * 60 + parsedTime.minutes;
  
  return appointmentTotalMinutes - currentTotalMinutes;
};

export const calculateMinutesToAppointment = (appointmentTime: string): number => {
  const startTimeStr = extractStartTime(appointmentTime);
  if (!startTimeStr) return 0;
  
  const parsedTime = parseTimeString(startTimeStr);
  if (!parsedTime) return 0;
  
  return calculateMinutesDifference(parsedTime);
};

export const formatTimeDisplay = (minutes: number, status: string): string => {
  // For CHECKED_IN appointments, still show the countdown
  // Only show "0 min" when the appointment time has actually passed
  
  if (minutes <= 0) {
    // If time has passed or it's exactly now
    if (status === 'CHECKED_IN') {  
      return "0 min";
    }
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

export const filterAppointmentsByOutlet = (appointments: Appointment[], outletId: string | null): Appointment[] => {
  if (!outletId) return appointments;
  return appointments.filter(app => app.outletId === outletId);
};

export const formatAppointmentsToRows = (appointments: Appointment[], outletId: string | null): Row[] => {
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
};

// Add this to your appointmentUtils.ts file

export function filterTodaysAppointments(appointments: any[]): any[] {
  if (!Array.isArray(appointments)) return [];
  
  const today = new Date();
  const todayDateStr = today.toISOString().split('T')[0]; // Get YYYY-MM-DD format
  
  return appointments.filter(appointment => {
    if (!appointment.startTime) return false;
    
    const appointmentDate = new Date(appointment.startTime);
    const appointmentDateStr = appointmentDate.toISOString().split('T')[0];
    
    return appointmentDateStr === todayDateStr;
  });
}