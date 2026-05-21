"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Booking } from "@/types";
import { formatCurrency, formatDateTime, getSeatClassLabel } from "@/lib/utils";
import { CheckCircle, Plane, Printer, Home, BookOpen, MapPin, Calendar, Tag } from "lucide-react";
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
    if (!bookingId) { setLoading(false); return; }
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
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading your booking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Success header */}
      <div className="text-center mb-8 animate-slide-up">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-3xl mb-5 shadow-lg shadow-emerald-200">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-500">Your flight has been booked successfully.</p>
      </div>

      {/* Boarding Pass Card */}
      <div className="relative bg-hero-gradient rounded-3xl overflow-hidden mb-6 animate-slide-up shadow-xl">
        {/* Decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative p-7">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <Plane className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">FlightX</span>
            </div>
            <span className="text-white/50 text-xs font-medium tracking-widest uppercase">Boarding Pass</span>
          </div>

          {/* PNR */}
          <div className="text-center py-4 mb-6">
            <p className="text-white/50 text-xs font-medium tracking-widest uppercase mb-2">PNR Code</p>
            <p className="text-5xl font-black tracking-[0.2em] text-white">{pnr}</p>
          </div>

          {booking && (
            <>
              {/* Dashed divider */}
              <div className="flex items-center gap-2 mb-5">
                <div className="w-4 h-4 bg-white/10 rounded-full -ml-10" />
                <div className="flex-1 border-t border-dashed border-white/20" />
                <div className="w-4 h-4 bg-white/10 rounded-full -mr-10" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wide mb-1">From</p>
                  <p className="font-bold text-white">{booking.flight?.origin.split("(")[0].trim()}</p>
                  <p className="text-white/50 text-xs">{booking.flight?.origin.match(/\(([^)]+)\)/)?.[1]}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/40 text-xs uppercase tracking-wide mb-1">To</p>
                  <p className="font-bold text-white">{booking.flight?.destination.split("(")[0].trim()}</p>
                  <p className="text-white/50 text-xs">{booking.flight?.destination.match(/\(([^)]+)\)/)?.[1]}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Departure</p>
                  <p className="font-semibold text-white text-sm">{booking.flight ? formatDateTime(booking.flight.departs_at) : "—"}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Seat</p>
                  <p className="font-bold text-white">{booking.seat?.seat_number}</p>
                  <p className="text-white/50 text-xs">{booking.seat ? getSeatClassLabel(booking.seat.class) : ""}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Booking details */}
      {booking && (
        <div className="card mb-6 animate-slide-up">
          <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600" />
            Booking Details
          </h2>
          <div className="space-y-3">
            {[
              { icon: <Plane className="w-4 h-4" />, label: "Flight", value: booking.flight?.flight_no },
              { icon: <MapPin className="w-4 h-4" />, label: "Route", value: `${booking.flight?.origin.split("(")[0].trim()} → ${booking.flight?.destination.split("(")[0].trim()}` },
              { icon: <Calendar className="w-4 h-4" />, label: "Departure", value: booking.flight ? formatDateTime(booking.flight.departs_at) : "—" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  {item.icon}
                  {item.label}
                </div>
                <span className="font-semibold text-gray-900 text-sm">{item.value}</span>
              </div>
            ))}
            {booking.passengers?.[0] && (
              <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
                <span className="text-gray-400 text-sm">Passenger</span>
                <span className="font-semibold text-gray-900 text-sm">{booking.passengers[0].full_name}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-3">
              <span className="font-bold text-gray-900">Total Paid</span>
              <span className="text-xl font-bold text-blue-600">{formatCurrency(booking.total_price)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 animate-slide-up">
        <button onClick={() => router.push("/")} className="btn-secondary flex items-center justify-center gap-2 flex-1">
          <Home className="w-4 h-4" />
          Back to Home
        </button>
        <button onClick={() => window.print()} className="btn-secondary flex items-center justify-center gap-2 flex-1">
          <Printer className="w-4 h-4" />
          Print Pass
        </button>
        <button onClick={() => router.push("/bookings")} className="btn-primary flex items-center justify-center gap-2 flex-1">
          <BookOpen className="w-4 h-4" />
          My Bookings
        </button>
      </div>
    </div>
  );
}
