export type Appointment = {
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

export type Row = {
  id: number;
  name: string;
  appointmentId: string;
  appointmentTime: string;
  status: string;
  minutesToAppointment: number;
  outletId: string;
};

export type WebSocketMessage = {
  type: string;
  data: Appointment[];
  timestamp: string;
};

export type CartItem = {
  id: number;
  name: string;
  quantity: number;
  provider: string;
  amount: number;
  isHighlighted?: boolean;
};

export type ReceiptData = {
  customerName: string;
  date: string;
  time: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  taxes: number;
  tip: number;
  grandTotal: number;
};