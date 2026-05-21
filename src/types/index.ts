// ============================================================
// Database Types
// ============================================================

export type FlightStatus = "scheduled" | "delayed" | "cancelled" | "completed";
export type SeatClass = "economy" | "business" | "first";
export type BookingStatus = "confirmed" | "rescheduled" | "cancelled";

export interface Flight {
  id: string;
  flight_no: string;
  origin: string;
  destination: string;
  departs_at: string;
  arrives_at: string;
  aircraft_type: string;
  status: FlightStatus;
  base_price: number;
  created_at: string;
}

export interface Seat {
  id: string;
  flight_id: string;
  seat_number: string;
  class: SeatClass;
  is_available: boolean;
  extra_fee: number;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  flight_id: string;
  seat_id: string;
  status: BookingStatus;
  booked_at: string;
  total_price: number;
  pnr_code: string;
  created_at: string;
  // Joined fields
  flight?: Flight;
  seat?: Seat;
  passengers?: Passenger[];
}

export interface Passenger {
  id: string;
  booking_id: string;
  full_name: string;
  passport_no: string;
  nationality: string;
  dob: string;
  created_at: string;
}

export interface Reschedule {
  id: string;
  booking_id: string;
  old_flight_id: string;
  new_flight_id: string;
  requested_at: string;
  fee_charged: number;
}

// ============================================================
// Form Types
// ============================================================

export interface SearchQuery {
  origin: string;
  destination: string;
  date: string;
  passengerCount: number;
  class: SeatClass;
}

export interface PassengerFormData {
  full_name: string;
  passport_no: string;
  nationality: string;
  dob: string;
}

// ============================================================
// RPC Response Types
// ============================================================

export interface ReserveSeatResponse {
  success: boolean;
  booking_id?: string;
  pnr_code?: string;
  error?: string;
}

export interface CancelBookingResponse {
  success: boolean;
  booking_id?: string;
  error?: string;
}

export interface RescheduleBookingResponse {
  success: boolean;
  reschedule_id?: string;
  fee_charged?: number;
  error?: string;
}

// ============================================================
// UI Types
// ============================================================

export type BookingStep = "search" | "results" | "seats" | "passengers" | "confirmation";

export type SeatStatus = "available" | "occupied" | "selected" | "yours";

export interface SeatWithStatus extends Seat {
  status: SeatStatus;
}
