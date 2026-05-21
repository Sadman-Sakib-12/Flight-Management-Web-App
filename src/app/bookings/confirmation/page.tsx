"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Booking } from "@/types";
import {
  formatCurrency,
  formatDateTime,
  getSeatClassLabel,
} from "@/lib/utils";
import {
  CheckCircle,
  Plane,
  Printer,
  Home,
  BookOpen,
} from "lucide-react";
import { useFlightStore } from "@/store/useFlightStore";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { resetBooking } = useFlightStore();

  const pnr = searchParams.get("pnr");
  const bookingId = searchParams.get("bookingId");

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resetBooking();

    if (!bookingId) {
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("bookings")
        .select("*, flight:flights(*), seat:seats(*), passengers(*)")
        .eq("id", bookingId)
        .single();

      setBooking(data as Booking);
      setLoading(false);
    };

    fetchBooking();
  }, [bookingId, resetBooking]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Success header */}
      <div className="text-center mb-8 animate-slide-up">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Booking Confirmed!</h1>
        <p className="text-gray-500 mt-2">
          Your flight has been booked successfully.
        </p>
      </div>

      {/* PNR Card */}
      <div className="bg-gradient-to-r from-primary-600 to-blue-500 rounded-2xl p-6 text-white mb-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5" />
            <span className="font-semibold">FlightX</span>
          </div>
          <span className="text-primary-200 text-sm">Boarding Pass</span>
        </div>

        <div className="text-center my-4">
          <p className="text-primary-200 text-sm mb-1">PNR Code</p>
          <p className="text-4xl font-bold tracking-widest">{pnr}</p>
        </div>

        {booking && (
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-primary-200 text-xs">From</p>
              <p className="font-semibold">
                {booking.flight?.origin.split("(")[0].trim()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-primary-200 text-xs">To</p>
              <p className="font-semibold">
                {booking.flight?.destination.split("(")[0].trim()}
              </p>
            </div>
            <div>
              <p className="text-primary-200 text-xs">Departure</p>
              <p className="font-semibold text-sm">
                {booking.flight ? formatDateTime(booking.flight.departs_at) : "—"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-primary-200 text-xs">Seat</p>
              <p className="font-semibold">
                {booking.seat?.seat_number}{" "}
                <span className="text-primary-200 text-xs">
                  ({booking.seat ? getSeatClassLabel(booking.seat.class) : ""})
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Booking details */}
      {booking && (
        <div className="card mb-6 animate-slide-up">
          <h2 className="font-semibold text-gray-900 mb-4">Booking Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Flight</span>
              <span className="font-medium">{booking.flight?.flight_no}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="badge bg-green-100 text-green-800">Confirmed</span>
            </div>
            {booking.passengers?.[0] && (
              <div className="flex justify-between">
                <span className="text-gray-500">Passenger</span>
                <span className="font-medium">{booking.passengers[0].full_name}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t pt-3">
              <span>Total Paid</span>
              <span className="text-primary-600">
                {formatCurrency(booking.total_price)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 animate-slide-up">
        <button
          onClick={() => router.push("/")}
          className="btn-secondary flex items-center justify-center gap-2 flex-1"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </button>
        <button
          onClick={() => window.print()}
          className="btn-secondary flex items-center justify-center gap-2 flex-1"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </button>
        <button
          onClick={() => router.push("/bookings")}
          className="btn-primary flex items-center justify-center gap-2 flex-1"
        >
          <BookOpen className="w-4 h-4" />
          My Bookings
        </button>
      </div>
    </div>
  );
}
